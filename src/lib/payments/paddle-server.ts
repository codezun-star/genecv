import "server-only";

import { Environment, Paddle } from "@paddle/paddle-node-sdk";

import { isPassPrice, paddleEnvironment, passPriceId } from "@/lib/payments/pricing";

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
 * Paddle termina de procesarla. Exigir solo `completed` haría fallar el
 * desbloqueo en la misma sesión, que es justo lo que el flujo necesita.
 */
const PAID_STATUSES = new Set(["paid", "completed"]);

/**
 * El correo del comprador, cueste lo que cueste.
 *
 * Paddle lo entrega en dos formas distintas según por dónde se pregunte, y
 * ninguna es fiable por sí sola:
 *
 * - `transactions.get(id, { include: ["customer"] })` debería traerlo incrustado,
 *   pero el objeto `customer` puede llegar vacío justo después del checkout,
 *   que es exactamente cuando lo pedimos.
 * - El evento `transaction.completed` del webhook **nunca** lo trae: el payload
 *   lleva `customer_id` y punto.
 *
 * Con `transaction.customer?.email` a secas las dos vías fallaban a la vez y la
 * fila acababa con el correo de relleno, que es lo que se veía en la tabla. Así
 * que cuando no viene incrustado se pide por su id, que sí está siempre.
 *
 * Devuelve null solo si Paddle no da ninguna de las dos cosas.
 */
export async function resolvePurchaseEmail(input: {
  embedded?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (input.embedded) return input.embedded;
  if (!input.customerId) return null;

  try {
    const customer = await paddle().customers.get(input.customerId);
    return customer.email ?? null;
  } catch (error) {
    // No es motivo para tumbar una descarga ya pagada: el correo es para el
    // recibo y para soporte, no para autorizar nada.
    console.warn("[paddle] no se pudo leer el correo del cliente", {
      customerId: input.customerId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export type VerificationFailure =
  | "not_configured"
  | "not_found"
  | "not_paid"
  | "price_mismatch";

export type VerificationResult =
  | {
      ok: true;
      transactionId: string;
      email: string | null;
      status: string;
    }
  | { ok: false; reason: VerificationFailure; detail: string };

/**
 * Verifica contra la API de Paddle que una transacción existe, está pagada y
 * corresponde al pase premium.
 *
 * Esta es la única fuente de autorización. Nada de lo que envíe el navegador
 * —ni el callback de Paddle.js, ni el pase guardado en localStorage— se toma
 * como prueba de pago: el transaction_id es solo un puntero que se resuelve
 * aquí contra Paddle.
 *
 * Ya no hay que comprobar *qué plantilla* se pagó, porque no se paga una
 * plantilla. Lo que sí hay que comprobar es que se pagó el pase y no otro
 * producto de la misma cuenta de Paddle.
 */
export async function verifyPassTransaction(
  transactionId: string,
): Promise<VerificationResult> {
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

  // Sin price_id del pase no hay nada contra lo que contrastar, y aceptar
  // cualquier transacción pagada convertiría en pase la compra de cualquier
  // otro producto de la cuenta. Se rechaza en lugar de adivinar.
  if (!passPriceId()) {
    console.error(
      "[paddle] falta NEXT_PUBLIC_PADDLE_PRICE_ID_PASS: no se puede validar el pase",
    );
    return {
      ok: false,
      reason: "not_configured",
      detail: "El pase premium no está configurado en el servidor.",
    };
  }

  let transaction;

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

  // (b) ¿Lo que se cobró es el pase?
  //
  // Se mira el price_id realmente facturado, no el custom_data: custom_data lo
  // fija el cliente al abrir el checkout y por tanto es manipulable; el
  // price_id es lo que Paddle cobró de verdad.
  const paidForPass = (transaction.items ?? []).some((item) =>
    isPassPrice(item.price?.id),
  );

  if (!paidForPass) {
    return {
      ok: false,
      reason: "price_mismatch",
      detail: "La transacción no corresponde al pase de descarga premium.",
    };
  }

  return {
    ok: true,
    transactionId: transaction.id,
    email: await resolvePurchaseEmail({
      embedded: transaction.customer?.email,
      customerId: transaction.customerId,
    }),
    status: transaction.status,
  };
}
