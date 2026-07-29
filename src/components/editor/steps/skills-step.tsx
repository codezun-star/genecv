"use client";

import { motion } from "motion/react";

import { useCv } from "@/components/editor/use-cv";
import { FieldGroup } from "@/components/editor/fields";
import { SortableList, SortableRow } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { createLanguage, createSkill } from "@/lib/cv/defaults";
import type {
  LanguageItem,
  LanguageLevel,
  SkillItem,
  SkillLevel,
} from "@/lib/cv/types";
import { LANGUAGE_LEVEL_LABELS, SKILL_LEVEL_LABELS } from "@/lib/cv/view";

const SKILL_LEVELS: SkillLevel[] = [1, 2, 3, 4, 5];
const LANGUAGE_LEVELS: LanguageLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "nativo",
];

export function SkillsStep() {
  const { cv, region, update } = useCv();

  function patchSkill(id: string, patch: Partial<SkillItem>) {
    update({
      skills: cv.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function patchLanguage(id: string, patch: Partial<LanguageItem>) {
    update({
      languages: cv.languages.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });
  }

  return (
    <div className="space-y-10">
      <FieldGroup
        title={region.terms.skills}
        description="Usa los mismos términos que la oferta: es donde el filtro automático busca coincidencias."
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => update({ skills: [...cv.skills, createSkill()] })}
          >
            Añadir habilidad
          </Button>
        }
      >
        <SortableList
          items={cv.skills}
          onReorder={(skills) => update({ skills })}
          className="space-y-2"
        >
          {(skill, index) => (
            <SortableRow
              key={skill.id}
              id={skill.id}
              handleLabel="Reordenar habilidad"
            >
              {(handle) => (
                <motion.div
                  layout
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-line bg-canvas rounded-field flex items-center gap-2 border p-2"
                >
                  {handle}
                  <input
                    value={skill.name}
                    onChange={(e) =>
                      patchSkill(skill.id, { name: e.target.value })
                    }
                    placeholder="React, negociación, Excel avanzado…"
                    aria-label={`Habilidad ${index + 1}`}
                    className="field border-none bg-transparent shadow-none focus:ring-0"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      patchSkill(skill.id, {
                        level: Number(e.target.value) as SkillLevel,
                      })
                    }
                    aria-label={`Nivel de la habilidad ${index + 1}`}
                    className="field w-36 shrink-0 cursor-pointer"
                  >
                    {SKILL_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {SKILL_LEVEL_LABELS[level]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        skills: cv.skills.filter((s) => s.id !== skill.id),
                      })
                    }
                    aria-label={`Eliminar habilidad ${index + 1}`}
                    className="text-ink-muted hover:bg-danger/10 hover:text-danger grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-150"
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
                </motion.div>
              )}
            </SortableRow>
          )}
        </SortableList>

        {cv.skills.length === 0 && (
          <p className="text-ink-muted text-sm">
            Añade al menos cinco habilidades para mejorar tu puntuación ATS.
          </p>
        )}
      </FieldGroup>

      <FieldGroup
        title={region.terms.languages}
        description="Los niveles siguen el Marco Común Europeo de Referencia."
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update({ languages: [...cv.languages, createLanguage()] })
            }
          >
            Añadir idioma
          </Button>
        }
      >
        <SortableList
          items={cv.languages}
          onReorder={(languages) => update({ languages })}
          className="space-y-2"
        >
          {(language, index) => (
            <SortableRow
              key={language.id}
              id={language.id}
              handleLabel="Reordenar idioma"
            >
              {(handle) => (
                <motion.div
                  layout
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-line bg-canvas rounded-field flex items-center gap-2 border p-2"
                >
                  {handle}
                  <input
                    value={language.name}
                    onChange={(e) =>
                      patchLanguage(language.id, { name: e.target.value })
                    }
                    placeholder="Inglés"
                    aria-label={`Idioma ${index + 1}`}
                    className="field border-none bg-transparent shadow-none focus:ring-0"
                  />
                  <select
                    value={language.level}
                    onChange={(e) =>
                      patchLanguage(language.id, {
                        level: e.target.value as LanguageLevel,
                      })
                    }
                    aria-label={`Nivel del idioma ${index + 1}`}
                    className="field w-44 shrink-0 cursor-pointer"
                  >
                    {LANGUAGE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {LANGUAGE_LEVEL_LABELS[level]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        languages: cv.languages.filter(
                          (l) => l.id !== language.id,
                        ),
                      })
                    }
                    aria-label={`Eliminar idioma ${index + 1}`}
                    className="text-ink-muted hover:bg-danger/10 hover:text-danger grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-150"
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
                </motion.div>
              )}
            </SortableRow>
          )}
        </SortableList>
      </FieldGroup>
    </div>
  );
}
