"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { useCv } from "@/components/editor/use-cv";
import { FieldGroup } from "@/components/editor/fields";
import { Badge } from "@/components/ui/badge";
import {
  FREE_TEMPLATES,
  PREMIUM_TEMPLATES,
  isAtsSafe,
  type TemplateMeta,
} from "@/lib/cv/templates";
import { cn } from "@/lib/utils";

/** Accent options drawn from the brand palette plus a few neutral extras. */
const ACCENTS = [
  { value: "#234D68", label: "Azul GeneCV" },
  { value: "#1B3C51", label: "Azul profundo" },
  { value: "#566B81", label: "Gris azulado" },
  { value: "#2C3740", label: "Grafito" },
  { value: "#2F7D5D", label: "Verde" },
  { value: "#7A3B4E", label: "Granate" },
  { value: "#8A4B2A", label: "Terracota" },
  { value: "#4A3B6B", label: "Violeta" },
];

export function TemplateStep() {
  const { cv, template, setTemplate, update } = useCv();

  return (
    <div className="space-y-10">
      <FieldGroup
        title="Elige tu plantilla"
        description="Puedes cambiarla en cualquier momento sin perder lo que escribas: el contenido es independiente del diseño."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FREE_TEMPLATES.map((option) => (
            <TemplateCard
              key={option.id}
              option={option}
              selected={cv.templateId === option.id}
              onSelect={() => setTemplate(option.id)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Plantillas premium"
        description="Puedes seleccionarlas y ver tu CV con ese diseño. La descarga sin marca de agua se paga una vez, en el último paso: es esa descarga concreta, no un acceso permanente."
        action={
          <Link
            href="/premium"
            className="text-secondary hover:text-primary -mx-1 inline-flex min-h-9 shrink-0 items-center px-1 text-xs font-semibold transition-colors duration-150"
          >
            Saber más →
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PREMIUM_TEMPLATES.map((option) => (
            <TemplateCard
              key={option.id}
              option={option}
              selected={cv.templateId === option.id}
              onSelect={() => setTemplate(option.id)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Color de acento"
        description={
          template.monochrome
            ? `«${template.name}» es intencionadamente monocroma, así que el acento no se aplica.`
            : "Se usa en titulares, líneas y la barra lateral."
        }
      >
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((accent) => (
            <button
              key={accent.value}
              type="button"
              onClick={() => update({ accentColor: accent.value })}
              aria-label={accent.label}
              aria-pressed={cv.accentColor === accent.value}
              disabled={template.monochrome}
              className={cn(
                "size-10 rounded-full transition-transform duration-150",
                template.monochrome
                  ? "cursor-not-allowed opacity-40"
                  : "hover:scale-110",
                cv.accentColor === accent.value &&
                  !template.monochrome &&
                  "ring-primary ring-2 ring-offset-2",
              )}
              style={{ backgroundColor: accent.value }}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function TemplateCard({
  option,
  selected,
  onSelect,
}: {
  option: TemplateMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = option.isPremium;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-card border p-2.5 text-left transition-[border-color,box-shadow,transform] duration-200",
        selected
          ? "border-primary shadow-soft"
          : "border-line hover:border-secondary-300 sm:hover:-translate-y-0.5",
      )}
    >
      <div className="bg-surface border-line relative mb-2.5 aspect-[3/4] overflow-hidden rounded-md border">
        <TemplateThumb template={option} />
        {locked && (
          <span className="bg-primary-900/15 absolute inset-0 grid place-items-center">
            <span className="bg-canvas text-primary shadow-soft grid size-7 place-items-center rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-3.5"
                aria-hidden
              >
                <path d="M7 10V7a5 5 0 0110 0v3M5 10h14v10H5z" />
              </svg>
            </span>
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-1.5">
        <span className="text-ink text-sm leading-tight font-semibold">
          {option.name}
        </span>
        {selected && (
          <motion.span
            layoutId="template-check"
            className="bg-primary mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              className="size-3"
              aria-hidden
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </motion.span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {isAtsSafe(option) && <Badge tone="success">ATS</Badge>}
        {locked && <Badge tone="premium">Premium</Badge>}
      </div>
    </button>
  );
}
