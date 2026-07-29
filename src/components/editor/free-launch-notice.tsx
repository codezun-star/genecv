"use client";

import { Badge } from "@/components/ui/badge";
import type { TemplateMeta } from "@/lib/cv/templates";
import { FREE_LAUNCH_COPY, freeLaunchBody } from "@/lib/payments/mode";

/**
 * Aviso de que la plantilla premium elegida es gratis durante el lanzamiento.
 *
 * Se muestra justo encima del botón de descarga, así que el usuario lo lee
 * antes de descargar sin que nada le corte el paso: no es un modal ni bloquea
 * el flujo, solo informa.
 *
 * Todos los textos vienen de `lib/payments/mode.ts`.
 */
export function FreeLaunchNotice({ template }: { template: TemplateMeta }) {
  return (
    <div className="border-success/30 bg-success/5 rounded-card border p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-success grid size-6 shrink-0 place-items-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
            aria-hidden
          >
            <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
          </svg>
        </span>
        <p className="font-display text-ink font-semibold">
          {FREE_LAUNCH_COPY.title}
        </p>
        <Badge tone="success">{FREE_LAUNCH_COPY.badge}</Badge>
      </div>

      <p className="text-ink-soft mt-2 text-sm leading-relaxed">
        {freeLaunchBody()}
      </p>

      <p className="text-ink-muted mt-2 text-xs">
        Estás usando «{template.name}». Pulsa «Descargar PDF» para obtenerla.
      </p>
    </div>
  );
}
