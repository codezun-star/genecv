import { EventName } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

import { paddle } from "@/lib/payments/paddle-server";
import { markRefunded, recordPurchase } from "@/lib/payments/purchases";
import { isPassPrice } from "@/lib/payments/pricing";

/**
 * Webhook de Paddle.
 *
 * Sirve para auditoría y respaldo, NO para autorizar descargas. Si el usuario
 * cierra la pestaña después de pagar, el pase queda registrado igualmente y
 * soporte puede localizarlo. La autorización real vive en /api/generate-pdf,
 * que consulta Paddle en el momento de la descarga en lugar de esperar a que
 * llegue este evento (que puede tardar y rompería el flujo de una sola sesión).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature");
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[paddle-webhook] falta PADDLE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  if (!signature) {
    console.warn("[paddle-webhook] petición sin cabecera Paddle-Signature");
    return NextResponse.json({ error: "missing_signature" }, { status: 401 });
  }

  // La firma se calcula sobre el cuerpo EXACTO. Hay que leerlo como texto y no
  // parsearlo antes: un JSON.parse + stringify cambiaría los bytes y la
  // verificación fallaría siempre.
  const rawBody = await request.text();

  let event;
  try {
    event = await paddle().webhooks.unmarshal(rawBody, secret, signature);
  } catch (error) {
    console.warn("[paddle-webhook] firma inválida", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  try {
    switch (event.eventType) {
      case EventName.TransactionCompleted: {
        await handleTransactionCompleted(event.data);
        break;
      }

      // Un reembolso invalida el pase: si aún no se descargó, ya no podrá.
      case EventName.AdjustmentCreated: {
        const adjustment = event.data as { transactionId?: string; action?: string };
        if (adjustment.action === "refund" && adjustment.transactionId) {
          await markRefunded(adjustment.transactionId);
          console.info("[paddle-webhook] pase marcado como reembolsado", {
            transactionId: adjustment.transactionId,
          });
        }
        break;
      }

      default:
        // El resto de eventos no nos afectan; se responde 200 para que Paddle
        // no reintente indefinidamente.
        break;
    }
  } catch (error) {
    console.error("[paddle-webhook] error procesando el evento", {
      eventType: event.eventType,
      error: error instanceof Error ? error.stack : String(error),
    });
    // 500 hace que Paddle reintente, que es lo correcto ante un fallo
    // transitorio de base de datos.
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

interface TransactionEventData {
  id: string;
  customData?: Record<string, unknown> | null;
  items?: { price?: { id?: string | null } | null }[];
  customer?: { email?: string | null } | null;
}

async function handleTransactionCompleted(data: unknown) {
  const transaction = data as TransactionEventData;

  // La misma cuenta de Paddle sirve a más de un producto, así que no toda
  // transacción completada es un pase. Se filtra por el price_id realmente
  // cobrado: sin esto, la compra de cualquier otro producto crearía una fila
  // aquí y contaría como pase pagado.
  const isPass = (transaction.items ?? []).some((item) =>
    isPassPrice(item.price?.id),
  );

  if (!isPass) {
    console.info("[paddle-webhook] transacción ajena al pase, ignorada", {
      transactionId: transaction.id,
    });
    // 200: no es un fallo, simplemente no es nuestra.
    return;
  }

  const email =
    transaction.customer?.email ??
    (typeof transaction.customData?.email === "string"
      ? transaction.customData.email
      : null) ??
    "desconocido@genecv.local";

  await recordPurchase({ email, transactionId: transaction.id });

  console.info("[paddle-webhook] pase registrado", {
    transactionId: transaction.id,
  });
}
