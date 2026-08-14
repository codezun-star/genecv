import "server-only";

import { Environment, Paddle } from "@paddle/paddle-node-sdk";

import { paddleEnvironment, templateIdForPrice } from "@/lib/payments/catalog";

/**
 * Cliente de Paddle del lado servidor.
 *
 * La API key nunca sale de aquí. Este módulo importa `server-only`, así que si
 * alguien lo importa por error desde un componente de cliente el build falla en
 * lugar de filtrar la clave al bundle.
 */

let cached: Paddle | null = null;

function client(): Paddle {
  if (cached) return cached;

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("Falta PADDLE_API_KEY en el entorno del servidor");
  }

  cached = new Paddle(apiKey, {
    environment:
      paddleEnvironment() === "production"
        ? Environment.production
        : Environment.sandbox,
  });

  return cached;
}

export function paddle(): Paddle {
  return client();
}

/**
 * Estados de una transacción de Paddle Billing que significan "el dinero está
 * cobrado".
 *
 * Se aceptan los dos a propósito. Justo después de que el overlay se cierra la
 * transacción suele estar en `paid` y pasa a `completed` poco después, cuando
 * Paddle termina de procesarla. Exigir solo `completed` haría fallar la
 * descarga en la misma sesión, que es justo lo que el flujo necesita.
 */
const PAID_STATUSES = new Set(["paid", "completed"]);

export type VerificationFailure =
  | "not_configured"
  | "not_found"
  | "not_paid"
  | "template_mismatch"
  | "price_unknown";

export type VerificationResult =
  | {
      ok: true;
      transactionId: string;
      templateId: string;
      email: string | null;
      status: string;
    }
  | { ok: false; reason: VerificationFailure; detail: string };

/**
 * Verifica contra la API de Paddle que una transacción existe, está pagada y
 * corresponde a la plantilla solicitada.
 *
 * Esta es la única fuente de autorización de la descarga. Nada de lo que envíe
 * el navegador (ni el callback de Paddle.js, ni el propio template_id) se toma
 * como prueba de pago: el transaction_id es solo un puntero que se resuelve
 * aquí contra Paddle.
 */
export async function verifyTransactionForTemplate(
  transactionId: string,
  requestedTemplateId: string,
): Promise<VerificationResult> {
  let transaction;

  // Una API key ausente es un fallo de configuración, no un pago inválido. Si
  // se dejara caer en el catch de abajo se reportaría como "transacción no
  // encontrada" y estaríamos depurando el pago del usuario en lugar del
  // despliegue.
  if (!process.env.PADDLE_API_KEY) {
    console.error("[paddle] falta PADDLE_API_KEY: no se puede verificar nada");
    return {
      ok: false,
      reason: "not_configured",
      detail: "La verificación de pagos no está configurada en el servidor.",
    };
  }

  try {
    // `customer` solo viene si se pide explícitamente; lo usamos para guardar
    // el email de la compra sin fiarnos del que envíe el navegador.
    transaction = await paddle().transactions.get(transactionId, {
      include: ["customer"],
    });
  } catch (error) {
    // Paddle devuelve 404 para ids inexistentes y también para ids de otra
    // cuenta, que es exactamente lo que queremos rechazar.
    console.error("[paddle] no se pudo leer la transacción", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      reason: "not_found",
      detail: "La transacción no existe o no pertenece a esta cuenta.",
    };
  }

  if (!transaction) {
    return {
      ok: false,
      reason: "not_found",
      detail: "La transacción no existe.",
    };
  }

  // (a) ¿Está realmente pagada?
  if (!PAID_STATUSES.has(transaction.status)) {
    return {
      ok: false,
      reason: "not_paid",
      detail: `La transacción está en estado «${transaction.status}», no pagada.`,
    };
  }

  // (b) ¿Lo que se cobró corresponde a la plantilla pedida?
  //
  // Se resuelve a partir del price_id realmente facturado, no del custom_data:
  // custom_data lo fija el cliente al abrir el checkout y por tanto es
  // manipulable; el price_id es lo que Paddle cobró de verdad.
  const priceIds = (transaction.items ?? [])
    .map((item) => item.price?.id)
    .filter((id): id is string => Boolean(id));

  if (priceIds.length === 0) {
    return {
      ok: false,
      reason: "price_unknown",
      detail: "La transacción no tiene líneas con precio.",
    };
  }

  const paidTemplateIds = priceIds
    .map(templateIdForPrice)
    .filter((id): id is string => Boolean(id));

  if (paidTemplateIds.length === 0) {
    return {
      ok: false,
      reason: "price_unknown",
      detail: "El precio cobrado no corresponde a ninguna plantilla conocida.",
    };
  }

  if (!paidTemplateIds.includes(requestedTemplateId)) {
    return {
      ok: false,
      reason: "template_mismatch",
      detail: `Se pagó «${paidTemplateIds.join(", ")}» pero se pidió «${requestedTemplateId}».`,
    };
  }

  return {
    ok: true,
    transactionId: transaction.id,
    templateId: requestedTemplateId,
    email: transaction.customer?.email ?? null,
    status: transaction.status,
  };
}
