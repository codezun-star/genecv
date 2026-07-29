"use client";

import { motion } from "motion/react";

import { useCv } from "@/components/editor/use-cv";
import {
  Checkbox,
  FieldGroup,
  MonthField,
  TextAreaField,
  TextField,
} from "@/components/editor/fields";
import { SortableList, SortableRow } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { createEducation } from "@/lib/cv/defaults";
import type { EducationItem } from "@/lib/cv/types";

export function EducationStep() {
  const { cv, region, update } = useCv();

  function patchItem(id: string, patch: Partial<EducationItem>) {
    update({
      education: cv.education.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeItem(id: string) {
    const rest = cv.education.filter((item) => item.id !== id);
    update({ education: rest.length > 0 ? rest : [createEducation()] });
  }

  return (
    <FieldGroup
      title={region.terms.education}
      description="Incluye titulaciones, cursos relevantes y certificaciones."
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            update({ education: [...cv.education, createEducation()] })
          }
        >
          Añadir formación
        </Button>
      }
    >
      <SortableList
        items={cv.education}
        onReorder={(education) => update({ education })}
        className="space-y-4"
      >
        {(item, index) => (
          <SortableRow
            key={item.id}
            id={item.id}
            handleLabel="Reordenar formación"
          >
            {(handle) => (
              <motion.div
                layout
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="border-line bg-canvas rounded-card border p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {handle}
                    <span className="text-ink-muted text-xs font-semibold tracking-wide uppercase">
                      Formación {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar formación ${index + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Titulación o curso"
                    value={item.degree}
                    onChange={(e) =>
                      patchItem(item.id, { degree: e.target.value })
                    }
                    placeholder="Grado en Ingeniería Informática"
                  />
                  <TextField
                    label="Centro"
                    value={item.institution}
                    onChange={(e) =>
                      patchItem(item.id, { institution: e.target.value })
                    }
                    placeholder="Universidad Complutense"
                  />
                  <TextField
                    label="Ubicación"
                    value={item.location}
                    onChange={(e) =>
                      patchItem(item.id, { location: e.target.value })
                    }
                    placeholder="Madrid"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <MonthField
                      label="Inicio"
                      value={item.startDate}
                      onChange={(e) =>
                        patchItem(item.id, { startDate: e.target.value })
                      }
                    />
                    <MonthField
                      label="Fin"
                      value={item.endDate}
                      disabled={item.current}
                      onChange={(e) =>
                        patchItem(item.id, { endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Checkbox
                  className="mt-3"
                  label="En curso"
                  checked={item.current}
                  onChange={(e) =>
                    patchItem(item.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : item.endDate,
                    })
                  }
                />

                <TextAreaField
                  className="mt-4"
                  label="Detalles (opcional)"
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    patchItem(item.id, { description: e.target.value })
                  }
                  placeholder="Especialidad, proyecto final, mención o nota media."
                />
              </motion.div>
            )}
          </SortableRow>
        )}
      </SortableList>
    </FieldGroup>
  );
}
