"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { AtsPanel } from "@/components/editor/ats-panel";
import { useCv } from "@/components/editor/use-cv";
import { FieldGroup } from "@/components/editor/fields";
import { SortableList, SortableRow } from "@/components/editor/sortable-list";
import { TemplateThumb } from "@/components/cv/template-thumb";
import { Badge } from "@/components/ui/badge";
import { FREE_TEMPLATES, PREMIUM_TEMPLATES, isAtsSafe } from "@/lib/cv/templates";
import type { SectionId } from "@/lib/cv/types";
import { cn } from "@/lib/utils";

/** Accent options drawn from the brand palette. */
const ACCENTS = [
  { value: "#234D68", label: "Azul GeneCV" },
  { value: "#1B3C51", label: "Azul profundo" },
  { value: "#566B81", label: "Gris azulado" },
  { value: "#2C3740", label: "Grafito" },
  { value: "#2F7D5D", label: "Verde" },
  { value: "#7A3B4E", label: "Granate" },
];

export function DesignStep() {
  const { cv, region, template, update, setTemplate } = useCv();

  // dnd-kit needs objects with an id; the model stores plain section ids.
  const sectionItems = cv.sectionOrder.map((id) => ({ id }));

  return (
    <div className="space-y-10">
      <FieldGroup
        title="Plantilla"
        description="Cambiar de plantilla no altera tu contenido."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {FREE_TEMPLATES.map((option) => {
            const selected = cv.templateId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTemplate(option.id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-card border p-3 text-left transition-[border-color,box-shadow,transform] duration-200",
                  selected
                    ? "border-primary shadow-soft"
                    : "border-line hover:border-secondary-300 hover:-translate-y-0.5",
                )}
              >
                <div className="bg-surface border-line mb-3 aspect-[3/4] overflow-hidden rounded-md border">
                  <TemplateThumb template={option} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink text-sm font-semibold">
                    {option.name}
                  </span>
                  {selected && (
                    <motion.span
                      layoutId="template-check"
                      className="bg-primary grid size-5 place-items-center rounded-full"
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
                {isAtsSafe(option) && (
                  <Badge tone="success" className="mt-2">
                    ATS
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Locked designs: catalogued now, purchasable once USDT ships. */}
        <div className="border-line bg-surface rounded-card mt-2 border border-dashed p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-ink text-sm font-semibold">
                Plantillas premium
                <Badge tone="premium" className="ml-2">
                  Próximamente
                </Badge>
              </p>
              <p className="text-ink-muted mt-1 text-xs">
                {PREMIUM_TEMPLATES.length} diseños adicionales que se desbloquearán con
                un pago único en USDT.
              </p>
            </div>
            <Link
              href="/premium"
              className="text-secondary hover:text-primary text-xs font-semibold transition-colors duration-150"
            >
              Saber más →
            </Link>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Color de acento"
        description={
          template.id === "clasica"
            ? "La plantilla Clásica ATS es intencionadamente monocroma, así que el acento no se aplica."
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
              className={cn(
                "size-9 rounded-full transition-transform duration-150 hover:scale-110",
                cv.accentColor === accent.value &&
                  "ring-primary ring-2 ring-offset-2",
              )}
              style={{ backgroundColor: accent.value }}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Orden de las secciones"
        description={`Arrastra para reordenar. El preajuste de ${region.label} ya está aplicado.`}
      >
        <SortableList
          items={sectionItems}
          onReorder={(items) =>
            update({ sectionOrder: items.map((item) => item.id as SectionId) })
          }
          className="max-w-md space-y-2"
        >
          {(item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              handleLabel={`Reordenar sección ${region.terms[item.id as SectionId]}`}
            >
              {(handle) => (
                <motion.div
                  layout
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-line bg-canvas rounded-field flex items-center gap-2 border px-2 py-2.5"
                >
                  {handle}
                  <span className="text-ink-muted w-5 text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-ink text-sm font-medium">
                    {region.terms[item.id as SectionId]}
                  </span>
                </motion.div>
              )}
            </SortableRow>
          )}
        </SortableList>
      </FieldGroup>

      <FieldGroup title="Revisión final">
        <AtsPanel />
      </FieldGroup>
    </div>
  );
}
