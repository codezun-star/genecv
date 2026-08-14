"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CvData } from "@/lib/cv/types";
import type { TemplateMeta } from "@/lib/cv/templates";
import { isPurchasable } from "@/lib/payments/catalog";
import {
  CheckoutError,
  DownloadError,
  downloadPaidPdf,
  openCheckout,
} from "@/lib/payments/checkout-client";

/**
 * Compra y descarga de un PDF premium, en un solo paso.
 *
 * El modelo es transaccional: se paga una descarga concreta, se descarga y se
 * acabó. No hay cuenta, no hay sesión y no queda nada "desbloqueado" después.
 * El email se pide solo porque Paddle lo necesita para la factura.
 */

type Phase = "idle" | "checkout" | "generating" | "done" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PremiumCheckout({
  template,
  cv,
}: {
  template: TemplateMeta;
  cv: CvData;
}) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const purchasable = isPurchasable(template.id);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const busy = phase === "checkout" || phase === "generating";

  async function handleBuy() {
    if (!emailValid || busy) return;

    setError(null);
    setPhase("checkout");

    try {
      const transactionId = await openCheckout({
        templateId: template.id,
        email: email.trim(),
      });

      // El overlay se cerró sin pagar: no es un error, se vuelve al inicio.
      if (!transactionId) {
        setPhase("idle");
        return;
      }

      setPhase("generating");

      // El servidor verifica el pago contra Paddle antes de renderizar nada.
      await downloadPaidPdf({
        transactionId,
        templateId: template.id,
        cv,
      });

      setPhase("done");
    } catch (err) {
      if (err instanceof DownloadError || err instanceof CheckoutError) {
        setError(err.message);
      } else {
        setError("Algo falló durante el proceso. Inténtalo de nuevo.");
      }
      setPhase("error");
    }
  }

  if (!purchasable) {
    return (
      <div className="border-line bg-surface rounded-card border border-dashed p-5">
        <p className="text-ink text-sm font-semibold">
          «{template.name}» todavía no está a la venta
        </p>
        <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">
          Esta plantilla aún no tiene precio configurado en Paddle. Elige otra
          premium o una de las gratuitas para descargar ahora mismo.
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="border-success/30 bg-success/5 rounded-card border p-5">
        <p className="text-success flex items-center gap-2 text-sm font-semibold">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          Descarga completada
        </p>
        <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
          Tu PDF con la plantilla «{template.name}» se ha descargado sin marca
          de agua. Guárdalo: cada compra da derecho a una descarga, así que una
          nueva descarga requeriría un nuevo pago.
        </p>
      </div>
    );
  }

  return (
    <div className="border-primary-200 bg-primary-soft rounded-card border p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-primary font-semibold">
          Descargar con «{template.name}»
        </p>
        <Badge tone="premium">Premium</Badge>
      </div>

      <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
        Pagas una vez y descargas este CV sin marca de agua. No es una
        suscripción ni un acceso permanente: es esta descarga concreta.
      </p>

      <div className="mt-4">
        <label htmlFor="checkout-email" className="field-label">
          Correo para la factura
        </label>
        <input
          id="checkout-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          disabled={busy}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="field max-w-sm"
        />
        <p className="text-ink-muted mt-1 text-xs">
          Solo se usa para el recibo de Paddle. No creamos ninguna cuenta.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={handleBuy} disabled={!emailValid || busy}>
          {phase === "checkout"
            ? "Abriendo el pago…"
            : phase === "generating"
              ? "Generando tu PDF…"
              : "Pagar y descargar"}
        </Button>

        {phase === "generating" && (
          <span className="text-ink-muted flex items-center gap-2 text-xs">
            <span className="border-secondary-200 border-t-primary size-4 animate-spin rounded-full border-2" />
            Verificando el pago…
          </span>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-danger mt-3 text-sm"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
