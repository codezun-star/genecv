"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

import { useCv } from "@/components/editor/use-cv";
import { analyzeAts, scoreLabel, type CheckSeverity } from "@/lib/cv/ats";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<
  CheckSeverity,
  { badge: string; label: string; icon: string }
> = {
  error: {
    badge: "bg-danger/10 text-danger",
    label: "Crítico",
    icon: "M12 8v5M12 16.5v.01M10.3 4.3L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z",
  },
  warning: {
    badge: "bg-warning/10 text-warning",
    label: "Aviso",
    icon: "M12 8v5M12 16.5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    badge: "bg-secondary-100 text-secondary",
    label: "Sugerencia",
    icon: "M12 16v-5M12 8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

/**
 * Compatibility report for the currently selected template and content.
 *
 * It is deliberately advisory: no ATS publishes its parser, so the score is a
 * heuristic and the copy says so rather than implying a guarantee.
 */
export function AtsPanel({ compact = false }: { compact?: boolean }) {
  const { cv, template } = useCv();
  const report = useMemo(() => analyzeAts(cv, template), [cv, template]);
  const { label, tone } = scoreLabel(report.score);

  const ring =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-danger";

  return (
    <div className="border-line bg-canvas rounded-card border p-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90" aria-hidden>
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-surface-dark"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={ring}
              initial={false}
              animate={{ strokeDasharray: `${report.score}, 100` }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="font-display absolute inset-0 grid place-items-center text-sm font-bold">
            {report.score}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-ink font-semibold">
            Compatibilidad ATS
          </h3>
          <p className={cn("text-sm font-semibold", ring)}>{label}</p>
          <p className="text-ink-muted mt-0.5 text-xs leading-relaxed">
            {report.checks.length === 0
              ? "No hemos detectado problemas."
              : `${report.checks.length} punto${report.checks.length === 1 ? "" : "s"} a revisar.`}
          </p>
        </div>
      </div>

      {report.checks.length > 0 && (
        <ul className={cn("mt-5 space-y-3", compact && "max-h-72 overflow-y-auto")}>
          {report.checks.map((check) => {
            const style = SEVERITY_STYLES[check.severity];

            return (
              <li
                key={check.id}
                className="border-line rounded-field border p-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md",
                      style.badge,
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                      aria-hidden
                    >
                      <path d={style.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-ink text-sm font-semibold">
                      {check.title}
                      <span className="text-ink-muted ml-2 text-xs font-normal">
                        {style.label}
                      </span>
                    </p>
                    <p className="text-ink-soft mt-1 text-xs leading-relaxed">
                      {check.detail}
                    </p>
                    {check.fix && (
                      <p className="text-secondary mt-1.5 text-xs leading-relaxed">
                        <span className="font-semibold">Qué hacer: </span>
                        {check.fix}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-ink-muted mt-4 text-xs leading-relaxed">
        Es una estimación: cada empresa usa un ATS distinto y ninguno publica
        cómo procesa los archivos. Úsala como guía, no como garantía.
      </p>
    </div>
  );
}
