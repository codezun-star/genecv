import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassTransaction } from "@/lib/payments/paddle-server";
import { passAvailability } from "@/lib/payments/purchases";

/**
 * ¿Sigue valiendo este pase?
 *
 * El editor guarda el `transaction_id` en localStorage para que un F5 no
 * deshaga un desbloqueo pagado. localStorage no sabe si el pase se gastó en
 * otra pestaña ni si la compra se reembolsó, así que al arrancar pregunta aquí.
 *
 * Esto **no autoriza nada**. Es cortesía de interfaz: evita enseñar las
 * plantillas desbloqueadas para que al pulsar «Descargar» salte un 403. Quien
 * autoriza es `/api/generate-pdf`, que repite las dos comprobaciones y además
 * consume el pase de forma atómica. Un `{"valid":true}` de aquí no sirve para
 * obtener un PDF.
 *
 * Responde 200 con el veredicto en el cuerpo incluso cuando el pase no vale:
 * un 4xx haría que un fallo de red y un "ya se gastó" fueran indistinguibles
 * para el cliente, y esos dos casos se tratan de forma opuesta (ver
 * `pass-store.ts`).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  transactionId: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const { transactionId } = parsed.data;

  const verification = await verifyPassTransaction(transactionId);

  if (!verification.ok) {
    // Un fallo de configuración no es un pase inválido: si respondiéramos
    // `valid: false`, un despliegue al que le falta una variable borraría el
    // pase del navegador de todo el que haya pagado. Se deja sin veredicto y el
    // cliente conserva el pase.
    if (verification.reason === "not_configured") {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    return NextResponse.json(
      { valid: false, reason: verification.reason },
      { status: 200 },
    );
  }

  let availability;
  try {
    availability = await passAvailability(transactionId);
  } catch (error) {
    console.error("[premium-pass] no se pudo consultar el pase", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Mismo criterio: la base de datos caída no convierte un pase pagado en
    // inválido.
    return NextResponse.json({ error: "storage_error" }, { status: 503 });
  }

  if (!availability.available) {
    return NextResponse.json(
      { valid: false, reason: availability.reason },
      { status: 200 },
    );
  }

  return NextResponse.json({ valid: true }, { status: 200 });
}
