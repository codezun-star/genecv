"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { AtsPanel } from "@/components/editor/ats-panel";
import { useCv } from "@/components/editor/use-cv";
import { FieldGroup } from "@/components/editor/fields";
import { SortableList, SortableRow } from "@/components/editor/sortable-list";
import { Badge } from "@/components/ui/badge";
import type { SectionId } from "@/lib/cv/types";

export function ReviewStep() {
  const { cv, region, template, locked, update } = useCv();

  // dnd-kit needs objects with an id; the model stores plain section ids.
  const sectionItems = cv.sectionOrder.map((id) => ({ id }));

  return (
    <div className="space-y-10">
      {locked && (
        <div className="border-primary-200 bg-primary-soft rounded-card border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-primary flex flex-wrap items-center gap-2 font-semibold">
                «{template.name}» es una plantilla premium
                <Badge tone="premium">Bloqueada</Badge>
              </p>
              <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
                Puedes seguir viendo tu CV con este diseño en la vista previa,
                pero la descarga está desactivada. Elige una plantilla gratuita
                en el paso «Plantilla» para exportar el PDF ahora mismo.
              </p>
            </div>
            <Link
              href="/premium"
              className="text-secondary hover:text-primary -mx-1 inline-flex min-h-9 shrink-0 items-center px-1 text-xs font-semibold transition-colors duration-150"
            >
              Saber más →
            </Link>
          </div>
        </div>
      )}

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

      <FieldGroup title="Revisión de compatibilidad">
        <AtsPanel />
      </FieldGroup>
    </div>
  );
}
