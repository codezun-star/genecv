"use client";

import {
  CheckoutEventNames,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

import { paddleEnvironment, priceIdForTemplate } from "@/lib/payments/catalog";
import type { CvData } from "@/lib/cv/types";

/**
 * Checkout en el navegador.
 *
 * Aquí solo pasan dos cosas: abrir el overlay de Paddle y quedarse con el
 * `transaction_id` que devuelve. Ese id NO es una prueba de pago —el callback
 * del navegador es manipulable—, es solo un identificador que el servidor
 * resolverá contra la API de Paddle antes de generar nada.
 */

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle(): Promise<Paddle | undefined> {
  if (paddlePromise) return paddlePromise;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    return Promise.reject(
      new Error("Falta NEXT_PUBLIC_PADDLE_CLIENT_TOKEN"),
    );
  }

  paddlePromise = initializePaddle({
    environment: paddleEnvironment(),
    token,
  });

  return paddlePromise;
}

export class CheckoutError extends Error {}

/**
 * Abre el overlay y resuelve con el transaction_id cuando el pago se completa.
 * Resuelve `null` si la persona cierra el overlay sin pagar.
 */
export function openCheckout(options: {
  templateId: string;
  email: string;
}): Promise<string | null> {
  const priceId = priceIdForTemplate(options.templateId);

  if (!priceId) {
    return Promise.reject(
      new CheckoutError(
        "Esta plantilla todavía no tiene precio configurado en Paddle.",
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
          customer: { email: options.email },
          // Pista para el webhook y para soporte. El servidor NO se fía de esto
          // para decidir qué plantilla se pagó: usa el price_id real.
          customData: { template_id: options.templateId },
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
 * Pide el PDF al servidor con el transaction_id. El servidor verifica el pago
 * contra Paddle y solo entonces renderiza.
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
  const fileName =
    /filename="([^"]+)"/.exec(disposition)?.[1] ?? "CV.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
