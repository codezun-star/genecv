import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Acceso a `pdf_purchases` con la service role key.
 *
 * `server-only` hace fallar el build si este módulo acaba importado desde un
 * componente de cliente: la service role key salta RLS, así que exponerla al
 * navegador equivale a regalar la base de datos entera.
 */

let cached: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

export interface PurchaseRecord {
  id: string;
  email: string;
  template_id: string;
  paddle_transaction_id: string;
}

/**
 * Registra la compra. Idempotente por `paddle_transaction_id`: Paddle reintenta
 * los webhooks, y un segundo intento no debe duplicar la fila ni pisar el
 * estado de consumo.
 *
 * `ignoreDuplicates` deja intacta la fila existente, que es lo que queremos:
 * si el PDF ya se generó, un reintento del webhook no puede resetear
 * `pdf_generated`.
 */
export async function recordPurchase(input: {
  email: string;
  templateId: string;
  transactionId: string;
  status?: "completed" | "refunded";
}): Promise<void> {
  const { error } = await db()
    .from("pdf_purchases")
    .upsert(
      {
        email: input.email,
        template_id: input.templateId,
        paddle_transaction_id: input.transactionId,
        status: input.status ?? "completed",
      },
      { onConflict: "paddle_transaction_id", ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(`No se pudo registrar la compra: ${error.message}`);
  }
}

/** Marca una transacción como reembolsada; deja de poder generar PDF. */
export async function markRefunded(transactionId: string): Promise<void> {
  const { error } = await db()
    .from("pdf_purchases")
    .update({ status: "refunded" })
    .eq("paddle_transaction_id", transactionId);

  if (error) {
    throw new Error(`No se pudo marcar el reembolso: ${error.message}`);
  }
}

export type ConsumeResult =
  | { ok: true; purchase: PurchaseRecord }
  | { ok: false; reason: "already_used_or_missing" };

/**
 * Reclama la descarga de forma atómica.
 *
 * El UPDATE condicional (`... AND pdf_generated = false`) es lo que impide
 * reusar un mismo pago: si dos peticiones entran a la vez, Postgres serializa
 * los UPDATE sobre la fila y solo una ve `pdf_generated = false`; la otra
 * recibe cero filas. No hace falta un lock explícito ni una transacción
 * multiinstrucción.
 *
 * Se marca ANTES de generar el PDF a propósito. La alternativa —generar y
 * luego marcar— deja una ventana en la que dos peticiones simultáneas generan
 * dos PDF. El coste es que un fallo al renderizar consume la compra; por eso
 * `releasePurchase` la devuelve si la generación falla.
 */
export async function consumePurchase(
  transactionId: string,
  templateId: string,
): Promise<ConsumeResult> {
  const { data, error } = await db().rpc("consume_pdf_purchase", {
    p_transaction_id: transactionId,
    p_template_id: templateId,
  });

  if (error) {
    throw new Error(`No se pudo reclamar la compra: ${error.message}`);
  }

  const rows = (data ?? []) as PurchaseRecord[];
  if (rows.length === 0) return { ok: false, reason: "already_used_or_missing" };

  return { ok: true, purchase: rows[0] };
}

/**
 * Devuelve la compra al estado no consumido.
 *
 * Solo se usa cuando la generación del PDF falla después de haber reclamado la
 * compra: el usuario pagó y no recibió nada, así que debe poder reintentar.
 */
export async function releasePurchase(transactionId: string): Promise<void> {
  const { error } = await db()
    .from("pdf_purchases")
    .update({ pdf_generated: false, pdf_generated_at: null })
    .eq("paddle_transaction_id", transactionId);

  if (error) {
    // No se propaga: ya estamos en un camino de error y lo importante es no
    // enmascarar la causa original. Queda el log para soporte.
    console.error("[purchases] no se pudo liberar la compra", {
      transactionId,
      error: error.message,
    });
  }
}

/**
 * Alta de emergencia: si el webhook aún no llegó (Paddle puede tardar unos
 * segundos) pero la API confirma que la transacción está pagada, se crea la
 * fila en el momento para que la descarga no tenga que esperar.
 *
 * Es seguro porque solo se llama después de que `verifyTransactionForTemplate`
 * haya confirmado el pago contra Paddle.
 */
export async function ensurePurchase(input: {
  email: string;
  templateId: string;
  transactionId: string;
}): Promise<void> {
  await recordPurchase({ ...input, status: "completed" });
}
