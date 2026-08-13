"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { useCv } from "@/components/editor/use-cv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TemplateMeta } from "@/lib/cv/templates";
import { PASS_COPY } from "@/lib/payments/mode";
import { isCheckoutConfigured } from "@/lib/payments/pricing";
import {
  CheckoutError,
  fetchPassPrice,
  openPassCheckout,
} from "@/lib/payments/checkout-client";

/**
 * Compra del pase premium.
 *
 * El pago NO descarga nada: desbloquea las diecisiete plantillas para que la
 * persona pueda comparar su CV en todas y decidir con calma. Lo que gasta el
 * pase es pulsar «Descargar PDF» (ver `editor-shell.tsx`).
 *
 * Por eso este bloque insiste tanto en el consumo antes de cobrar. El modelo es
 * legítimo pero fácil de malinterpretar como «acceso premium», y descubrir el
 * re-bloqueo *después* de pagar es exactamente como se ganan las devoluciones.
 * No hay cuenta ni sesión: el email se pide solo porque Paddle lo necesita para
 * la factura.
 */

type Phase = "idle" | "checkout" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PremiumUnlock({ template }: { template: TemplateMeta }) {
  const { passActive, passChecking, justConsumed, activatePass } = useCv();

  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  const configured = isCheckoutConfigured();

  // El importe se pregunta a Paddle en lugar de escribirlo aquí: así sale en la
  // moneda de quien mira y no puede desfasarse del que se cobra.
  useEffect(() => {
    if (!configured || passActive) return;

    let cancelled = false;
    void fetchPassPrice().then((value) => {
      if (!cancelled) setPrice(value);
    });

    return () => {
      cancelled = true;
    };
  }, [configured, passActive]);

  async function handleBuy() {
    if (!EMAIL_PATTERN.test(email.trim()) || phase === "checkout") return;

    setError(null);
    setPhase("checkout");

    try {
      const transactionId = await openPassCheckout({ email: email.trim() });

      // El overlay se cerró sin pagar: no es un error, se vuelve al inicio.
      if (!transactionId) {
        setPhase("idle");
        return;
      }

      activatePass(transactionId);
      setPhase("idle");
    } catch (err) {
      setError(
        err instanceof CheckoutError
          ? err.message
          : "Algo falló durante el pago. Inténtalo de nuevo.",
      );
      setPhase("error");
    }
  }

  if (!configured) {
    return (
      <div className="border-line bg-surface rounded-card border border-dashed p-5">
        <p className="text-ink text-sm font-semibold">
          Las plantillas premium todavía no están a la venta
        </p>
        <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">
          El pase aún no tiene precio configurado en Paddle. Elige una de las
          plantillas gratuitas para descargar ahora mismo.
        </p>
      </div>
    );
  }

  if (passActive) {
    return (
      <div className="border-success/30 bg-success/5 rounded-card border p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-ink font-semibold">
            Plantillas premium desbloqueadas
          </p>
          <Badge tone="success">{PASS_COPY.unlockedBadge}</Badge>
          {passChecking && (
            <span className="text-ink-muted text-xs">Comprobando tu pase…</span>
          )}
        </div>

        <p className="text-ink-soft mt-2 text-sm leading-relaxed">
          Puedes cambiar de diseño las veces que quieras y ver tu CV en cada uno
          sin marca de agua. Cuando lo tengas decidido, pulsa «Descargar PDF».
        </p>

        <p className="text-ink-muted mt-2 text-xs leading-relaxed">
          {PASS_COPY.consumedOnDownload} Ahora mismo descargarías «
          {template.name}».
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tras una descarga el bloqueo vuelve, y sin decirlo parecería que algo
          se ha roto: la persona acaba de pagar y de pronto ve otra vez el
          candado. */}
      {justConsumed && (
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
            {PASS_COPY.afterDownload} Guarda el PDF: volver a descargarlo
            requiere un pase nuevo.
          </p>
        </div>
      )}

      <div className="border-primary-200 bg-primary-soft rounded-card border p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-primary font-semibold">
            {PASS_COPY.name}
          </p>
          <Badge tone="premium">Premium</Badge>
          {price && (
            <span className="text-ink font-display text-sm font-semibold">
              {price}
            </span>
          )}
        </div>

        <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
          {PASS_COPY.summary}
        </p>

        <p className="text-ink mt-2 text-sm leading-relaxed font-medium">
          {PASS_COPY.consumedOnDownload}
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
            disabled={phase === "checkout"}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="field max-w-sm"
          />
          <p className="text-ink-muted mt-1 text-xs">
            Solo se usa para el recibo de Paddle. No creamos ninguna cuenta.
          </p>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleBuy}
            disabled={!EMAIL_PATTERN.test(email.trim()) || phase === "checkout"}
          >
            {phase === "checkout"
              ? "Abriendo el pago…"
              : "Pagar y desbloquear las premium"}
          </Button>
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
    </div>
  );
}
