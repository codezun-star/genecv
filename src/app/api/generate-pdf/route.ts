import { NextResponse } from "next/server";

import { generateRequestSchema, toCvData } from "@/lib/cv/payload";
import { renderCvPdf } from "@/lib/cv/pdf/render-server";
import { getTemplate } from "@/lib/cv/templates";
import {
  consumePurchase,
  ensurePurchase,
  releasePurchase,
} from "@/lib/payments/purchases";
import { verifyTransactionForTemplate } from "@/lib/payments/paddle-server";

/**
 * Descarga de un PDF premium.
 *
 * Es el único punto que autoriza un PDF sin marca de agua, y no se fía de nada
 * que venga del navegador. El `transaction_id` que manda el cliente es solo un
 * puntero: la prueba de pago se obtiene consultando la API de Paddle desde
 * aquí. El callback `checkout.completed` de Paddle.js no autoriza nada.
 *
 * Orden de las comprobaciones:
 *   1. La transacción existe en Paddle y está pagada.
 *   2. El precio realmente cobrado corresponde a la plantilla pedida.
 *   3. Esa transacción no se ha usado ya (UPDATE condicional en Postgres).
 * Solo si las tres pasan se renderiza el PDF.
 */

// @react-pdf/renderer necesita Node, no el runtime Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Un CV con foto ronda 1,5 MB en JSON; por encima es abuso. */
const MAX_BODY_BYTES = 3_000_000;

function deny(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

export async function POST(request: Request) {
  // --- 0. Tamaño y forma del cuerpo -----------------------------------------
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return deny(413, "payload_too_large", "El CV enviado es demasiado grande.");
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return deny(400, "invalid_json", "El cuerpo de la petición no es JSON válido.");
  }

  const parsed = generateRequestSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[generate-pdf] payload inválido", {
      issues: parsed.error.issues.slice(0, 5),
    });
    return deny(400, "invalid_payload", "Los datos del CV no son válidos.");
  }

  const { transactionId, templateId, cv } = parsed.data;

  // La plantilla pedida tiene que existir y ser premium. Una gratuita no pasa
  // por aquí: se genera en el navegador y no necesita pago.
  const template = getTemplate(templateId);
  if (template.id !== templateId || !template.isPremium) {
    return deny(400, "not_premium", "Esa plantilla no requiere pago.");
  }

  // El diseño que se renderiza es el que se pagó, no el que traiga el CV.
  const cvData = toCvData({ ...cv, templateId });

  // --- 1 y 2. Verificación contra Paddle ------------------------------------
  const verification = await verifyTransactionForTemplate(
    transactionId,
    templateId,
  );

  if (!verification.ok) {
    console.warn("[generate-pdf] verificación rechazada", {
      transactionId,
      templateId,
      reason: verification.reason,
      detail: verification.detail,
    });

    // Un fallo de configuración es culpa nuestra, no del usuario: 500, no 403.
    if (verification.reason === "not_configured") {
      return deny(
        500,
        "not_configured",
        "Los pagos no están configurados. Inténtalo más tarde.",
      );
    }

    const message =
      verification.reason === "not_paid"
        ? "El pago todavía no está confirmado. Espera unos segundos e inténtalo de nuevo."
        : verification.reason === "template_mismatch"
          ? "El pago no corresponde a esta plantilla."
          : "No hemos podido verificar el pago.";

    return deny(403, verification.reason, message);
  }

  // El webhook puede tardar unos segundos y el flujo es en la misma sesión, así
  // que la fila se asegura aquí en lugar de esperarlo. Es seguro: llegados a
  // este punto Paddle ya confirmó el cobro.
  try {
    await ensurePurchase({
      email: verification.email ?? "desconocido@genecv.local",
      templateId,
      transactionId,
    });
  } catch (error) {
    console.error("[generate-pdf] no se pudo asegurar la compra", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return deny(500, "storage_error", "Error registrando la compra.");
  }

  // --- 3. Consumo atómico ---------------------------------------------------
  let consumed;
  try {
    consumed = await consumePurchase(transactionId, templateId);
  } catch (error) {
    console.error("[generate-pdf] fallo al reclamar la compra", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return deny(500, "storage_error", "Error verificando la compra.");
  }

  if (!consumed.ok) {
    console.warn("[generate-pdf] compra ya consumida", { transactionId });
    return deny(
      403,
      "already_used",
      "Este pago ya se usó para descargar un PDF. Cada compra da derecho a una descarga.",
    );
  }

  // --- 4. Generación --------------------------------------------------------
  try {
    const { buffer, fileName } = await renderCvPdf(cvData);

    console.info("[generate-pdf] PDF entregado", {
      transactionId,
      templateId,
      bytes: buffer.length,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    // El usuario pagó y no recibió nada: se devuelve la compra para que pueda
    // reintentar sin volver a pagar.
    await releasePurchase(transactionId);

    console.error("[generate-pdf] fallo al renderizar", {
      transactionId,
      templateId,
      error: error instanceof Error ? error.stack : String(error),
    });

    return deny(
      500,
      "render_failed",
      "No se pudo generar el PDF. Tu compra sigue disponible: vuelve a intentarlo.",
    );
  }
}
