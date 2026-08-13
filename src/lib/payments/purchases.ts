import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Acceso a `pdf_purchases` con la service role key.
 *
 * Cada fila es un pase comprado. El pase nace sin plantilla —se compran las
 * diecisiete a la vez— y se le anota cuál se descargó en el momento de
 * consumirlo, que es lo único que dice algo útil sobre qué diseño se llevó la
 * gente.
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
  template_id: string | null;
  paddle_transaction_id: string;
}

/**
 * Registra la compra del pase. Idempotente por `paddle_transaction_id`: Paddle
 * reintenta los webhooks, y un segundo intento no debe duplicar la fila ni
 * pisar el estado de consumo.
 *
 * `ignoreDuplicates` deja intacta la fila existente, que es lo que queremos:
 * si el PDF ya se generó, un reintento del webhook no puede resetear
 * `pdf_generated`.
 */
export async function recordPurchase(input: {
  email: string;
  transactionId: string;
  status?: "completed" | "refunded";
}): Promise<void> {
  const { error } = await db()
    .from("pdf_purchases")
    .upsert(
      {
        email: input.email,
        paddle_transaction_id: input.transactionId,
        status: input.status ?? "completed",
      },
      { onConflict: "paddle_transaction_id", ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(`No se pudo registrar la compra: ${error.message}`);
  }
}

/** Marca una transacción como reembolsada; el pase deja de servir. */
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
 * Consume el pase de forma atómica y anota con qué plantilla se descargó.
 *
 * El UPDATE condicional (`... AND pdf_generated = false`) es lo que impide
 * reusar un mismo pago: si dos peticiones entran a la vez, Postgres serializa
 * los UPDATE sobre la fila y solo una ve `pdf_generated = false`; la otra
 * recibe cero filas. No hace falta un lock explícito ni una transacción
 * multiinstrucción.
 *
 * `templateId` ya no es una condición sino un dato que se guarda: el pase vale
 * para cualquier plantilla premium, así que no hay nada que emparejar. Lo que
 * queda registrado es cuál se acabó descargando.
 *
 * Se marca ANTES de generar el PDF a propósito. La alternativa —generar y
 * luego marcar— deja una ventana en la que dos peticiones simultáneas generan
 * dos PDF. El coste es que un fallo al renderizar consume el pase; por eso
 * `releasePurchase` lo devuelve si la generación falla.
 */
export async function consumePurchase(
  transactionId: string,
  templateId: string,
): Promise<ConsumeResult> {
  const { data, error } = await db().rpc("consume_premium_pass", {
    p_transaction_id: transactionId,
    p_template_id: templateId,
  });

  if (error) {
    throw new Error(`No se pudo consumir el pase: ${error.message}`);
  }

  const rows = (data ?? []) as PurchaseRecord[];
  if (rows.length === 0) return { ok: false, reason: "already_used_or_missing" };

  return { ok: true, purchase: rows[0] };
}

/**
 * Devuelve el pase al estado no consumido.
 *
 * Solo se usa cuando la generación del PDF falla después de haberlo consumido:
 * el usuario pagó y no recibió nada, así que debe poder reintentar.
 */
export async function releasePurchase(transactionId: string): Promise<void> {
  const { error } = await db()
    .from("pdf_purchases")
    .update({ pdf_generated: false, pdf_generated_at: null })
    .eq("paddle_transaction_id", transactionId);

  if (error) {
    // No se propaga: ya estamos en un camino de error y lo importante es no
    // enmascarar la causa original. Queda el log para soporte.
    console.error("[purchases] no se pudo liberar el pase", {
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
 * Es seguro porque solo se llama después de que `verifyPassTransaction` haya
 * confirmado el cobro contra Paddle.
 */
export async function ensurePurchase(input: {
  email: string;
  transactionId: string;
}): Promise<void> {
  await recordPurchase({ ...input, status: "completed" });
}

export type PassAvailability =
  | { available: true }
  | { available: false; reason: "already_used" | "refunded" };

/**
 * ¿Este pase sigue sin gastar?
 *
 * Lo consulta `/api/premium-pass` para decidir si el editor puede seguir
 * mostrando las plantillas desbloqueadas al recargar la página. NO autoriza
 * nada: la descarga vuelve a comprobarlo, y encima de forma atómica. Aquí solo
 * se evita enseñar un desbloqueo que al pulsar «Descargar» daría un error.
 *
 * Una fila ausente cuenta como disponible: significa que el webhook todavía no
 * ha llegado, no que el pase se haya gastado. Quien decide de verdad es la
 * verificación contra Paddle, que corre justo antes que esto.
 */
export async function passAvailability(
  transactionId: string,
): Promise<PassAvailability> {
  const { data, error } = await db()
    .from("pdf_purchases")
    .select("status, pdf_generated")
    .eq("paddle_transaction_id", transactionId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo consultar el pase: ${error.message}`);
  }

  if (!data) return { available: true };
  if (data.status === "refunded") return { available: false, reason: "refunded" };
  if (data.pdf_generated) return { available: false, reason: "already_used" };

  return { available: true };
}
