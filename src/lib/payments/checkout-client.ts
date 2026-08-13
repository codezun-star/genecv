"use client";

import {
  CheckoutEventNames,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

import { paddleEnvironment, passPriceId } from "@/lib/payments/pricing";
import type { CvData } from "@/lib/cv/types";

/**
 * Todo lo que el navegador hace con Paddle.
 *
 * Aquí solo pasan dos cosas: abrir el overlay y quedarse con el
 * `transaction_id` que devuelve. Ese id NO es una prueba de pago —el callback
 * del navegador es manipulable—, es solo un identificador que el servidor
 * resolverá contra la API de Paddle antes de desbloquear o generar nada.
 */

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle(): Promise<Paddle | undefined> {
  if (paddlePromise) return paddlePromise;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    return Promise.reject(new Error("Falta NEXT_PUBLIC_PADDLE_CLIENT_TOKEN"));
  }

  paddlePromise = initializePaddle({
    environment: paddleEnvironment(),
    token,
  });

  return paddlePromise;
}

export class CheckoutError extends Error {}

/**
 * Precio del pase, ya formateado y en la moneda del visitante.
 *
 * Se pregunta a Paddle en lugar de escribirlo en el repositorio. Un importe a
 * mano se queda desfasado en cuanto alguien toca el precio en el dashboard, y
 * anunciar 4,99 € para cobrar 5,99 € en el overlay es la clase de detalle que
 * se convierte en una devolución. Además Paddle localiza la moneda, que a mano
 * no se puede.
 *
 * Devuelve null si no se puede consultar: la interfaz enseña el botón sin
 * importe en lugar de no enseñar nada.
 */
export async function fetchPassPrice(): Promise<string | null> {
  const priceId = passPriceId();
  if (!priceId) return null;

  try {
    const paddle = await getPaddle();
    if (!paddle) return null;

    const preview = await paddle.PricePreview({
      items: [{ priceId, quantity: 1 }],
    });

    return preview.data.details.lineItems[0]?.formattedTotals.total ?? null;
  } catch {
    // Un fallo aquí es cosmético; no debe impedir comprar.
    return null;
  }
}

/**
 * Abre el overlay y resuelve con el transaction_id cuando el pago se completa.
 * Resuelve `null` si la persona cierra el overlay sin pagar.
 *
 * No se le pasa correo. El overlay de Paddle lo pide él mismo —lo necesita para
 * la factura y para el recibo—, así que pedirlo antes en nuestro formulario era
 * hacer teclear dos veces lo mismo para acabar usando el de Paddle igualmente.
 * El servidor lo recupera de la transacción cuando hace falta.
 */
export function openPassCheckout(): Promise<string | null> {
  const priceId = passPriceId();

  if (!priceId) {
    return Promise.reject(
      new CheckoutError(
        "El pase premium todavía no tiene precio configurado en Paddle.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    getPaddle()
      .then((paddle) => {
        if (!paddle) {
          reject(new CheckoutError("No se pudo cargar el checkout de Paddle."));
          return;
        }

        let settled = false;

        paddle.Update({
          eventCallback: (event) => {
            if (settled) return;

            if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
              settled = true;
              const transactionId = event.data?.transaction_id ?? null;

              if (!transactionId) {
                reject(
                  new CheckoutError(
                    "El pago se completó pero Paddle no devolvió identificador.",
                  ),
                );
                return;
              }

              resolve(transactionId);
              return;
            }

            // Cerrar el overlay sin pagar no es un error: se vuelve al inicio.
            if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
              settled = true;
              resolve(null);
              return;
            }

            if (
              event.name === CheckoutEventNames.CHECKOUT_ERROR ||
              event.name === CheckoutEventNames.CHECKOUT_FAILED
            ) {
              settled = true;
              reject(new CheckoutError("El pago no se pudo completar."));
            }
          },
        });

        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "es",
          },
        });
      })
      .catch((error) => reject(error));
  });
}

export class DownloadError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

/**
 * Pide el PDF al servidor con el transaction_id del pase. El servidor verifica
 * el pago contra Paddle, consume el pase y solo entonces renderiza.
 */
export async function downloadPaidPdf(options: {
  transactionId: string;
  templateId: string;
  cv: CvData;
}): Promise<void> {
  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: options.transactionId,
      templateId: options.templateId,
      cv: options.cv,
    }),
  });

  if (!response.ok) {
    let message = "No se pudo generar el PDF.";
    let code = "unknown";
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? message;
      code = body.error ?? code;
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    throw new DownloadError(message, code);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "CV.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
