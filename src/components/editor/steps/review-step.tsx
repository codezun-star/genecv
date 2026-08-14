"use client";

import { motion } from "motion/react";

import { AtsPanel } from "@/components/editor/ats-panel";
import { useCv } from "@/components/editor/use-cv";
import { FieldGroup } from "@/components/editor/fields";
import { SortableList, SortableRow } from "@/components/editor/sortable-list";
import type { SectionId } from "@/lib/cv/types";

export function ReviewStep() {
  const { cv, region, update } = useCv();

  // dnd-kit needs objects with an id; the model stores plain section ids.
  const sectionItems = cv.sectionOrder.map((id) => ({ id }));

  return (
    <div className="space-y-10">
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
