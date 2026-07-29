"use client";

import { AnimatePresence, motion } from "motion/react";

import { useCv } from "@/components/editor/use-cv";
import {
  Checkbox,
  FieldGroup,
  MonthField,
  TextField,
} from "@/components/editor/fields";
import { PhrasePicker } from "@/components/editor/phrase-picker";
import {
  SortableList,
  SortableRow,
} from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { createExperience } from "@/lib/cv/defaults";
import type { ExperienceItem } from "@/lib/cv/types";

export function ExperienceStep() {
  const { cv, region, update } = useCv();

  function patchItem(id: string, patch: Partial<ExperienceItem>) {
    update({
      experience: cv.experience.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeItem(id: string) {
    const rest = cv.experience.filter((item) => item.id !== id);
    update({ experience: rest.length > 0 ? rest : [createExperience()] });
  }

  return (
    <FieldGroup
      title={region.terms.experience}
      description="Empieza por el puesto más reciente. Arrastra para cambiar el orden."
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            update({ experience: [...cv.experience, createExperience()] })
          }
        >
          Añadir puesto
        </Button>
      }
    >
      <SortableList
        items={cv.experience}
        onReorder={(experience) => update({ experience })}
        className="space-y-4"
      >
        {(item, index) => (
          <SortableRow key={item.id} id={item.id} handleLabel="Reordenar puesto">
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
                      Puesto {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar puesto ${index + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Puesto"
                    value={item.position}
                    onChange={(e) =>
                      patchItem(item.id, { position: e.target.value })
                    }
                    placeholder="Desarrolladora Frontend"
                  />
                  <TextField
                    label="Empresa"
                    value={item.company}
                    onChange={(e) =>
                      patchItem(item.id, { company: e.target.value })
                    }
                    placeholder="Acme S.L."
                  />
                  <TextField
                    label="Ubicación"
                    value={item.location}
                    onChange={(e) =>
                      patchItem(item.id, { location: e.target.value })
                    }
                    placeholder="Madrid (híbrido)"
                  />
                </div>

                {/* Dates need the full width: a month name plus a year does
                    not fit in half a column on a phone. */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MonthField
                    label="Inicio"
                    value={item.startDate}
                    aria-label={`Inicio del puesto ${index + 1}`}
                    onChange={(v) => patchItem(item.id, { startDate: v })}
                  />
                  <MonthField
                    label="Fin"
                    value={item.endDate}
                    disabled={item.current}
                    aria-label={`Fin del puesto ${index + 1}`}
                    onChange={(v) => patchItem(item.id, { endDate: v })}
                  />
                </div>

                <Checkbox
                  className="mt-3"
                  label="Actualmente trabajo aquí"
                  checked={item.current}
                  onChange={(e) =>
                    patchItem(item.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : item.endDate,
                    })
                  }
                />

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="field-label mb-0">Logros y funciones</span>
                    <button
                      type="button"
                      onClick={() =>
                        patchItem(item.id, {
                          achievements: [...item.achievements, ""],
                        })
                      }
                      className="text-secondary hover:text-primary -mx-1 inline-flex min-h-9 items-center px-1 text-xs font-semibold transition-colors duration-150"
                    >
                      + Añadir línea
                    </button>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {item.achievements.map((line, lineIndex) => (
                        <motion.div
                          key={lineIndex}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            duration: 0.18,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex items-start gap-2"
                        >
                          <textarea
                            value={line}
                            rows={2}
                            onChange={(e) => {
                              const achievements = [...item.achievements];
                              achievements[lineIndex] = e.target.value;
                              patchItem(item.id, { achievements });
                            }}
                            placeholder="Reduje el tiempo de carga un 40 % optimizando el bundle."
                            className="field resize-y"
                            aria-label={`Logro ${lineIndex + 1}`}
                          />
                          {item.achievements.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                patchItem(item.id, {
                                  achievements: item.achievements.filter(
                                    (_, i) => i !== lineIndex,
                                  ),
                                })
                              }
                              aria-label={`Eliminar logro ${lineIndex + 1}`}
                              className="text-ink-muted hover:bg-danger/10 hover:text-danger mt-1.5 grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-150"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                className="size-4"
                                aria-hidden
                              >
                                <path d="M6 6l12 12M18 6L6 18" />
                              </svg>
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-2">
                    <PhrasePicker
                      industry={cv.industry}
                      kind="achievements"
                      onPick={(phrase) => {
                        const achievements = [...item.achievements];
                        const emptyIndex = achievements.findIndex(
                          (a) => !a.trim(),
                        );
                        if (emptyIndex >= 0) achievements[emptyIndex] = phrase;
                        else achievements.push(phrase);
                        patchItem(item.id, { achievements });
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </SortableRow>
        )}
      </SortableList>
    </FieldGroup>
  );
}
