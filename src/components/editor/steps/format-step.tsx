"use client";

import { motion } from "motion/react";

import { useCv } from "@/components/editor/use-cv";
import { FieldGroup, SelectField } from "@/components/editor/fields";
import { Badge } from "@/components/ui/badge";
import { INDUSTRIES } from "@/lib/cv/phrases";
import { REGION_LIST } from "@/lib/cv/regions";
import { cn } from "@/lib/utils";

export function FormatStep() {
  const { cv, region, setRegion, update } = useCv();

  return (
    <div className="space-y-8">
      <FieldGroup
        title="¿Para qué mercado es tu CV?"
        description="Ajustamos la foto, el orden de las secciones y la terminología. Puedes cambiarlo después sin perder lo que hayas escrito."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {REGION_LIST.map((option) => {
            const selected = cv.region === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setRegion(option.id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-card border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200",
                  selected
                    ? "border-primary bg-primary-soft shadow-soft"
                    : "border-line bg-canvas hover:border-secondary-300",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-ink text-sm font-semibold">
                    {option.label}
                  </span>
                  {selected && (
                    <motion.span
                      layoutId="region-check"
                      className="bg-primary grid size-5 place-items-center rounded-full"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3"
                        aria-hidden
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.span>
                  )}
                </div>
                <p className="text-ink-muted mt-1 text-xs">{option.markets}</p>
                <p className="text-ink-soft mt-3 text-xs leading-relaxed">
                  {option.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="secondary">{option.documentName}</Badge>
                  <Badge
                    tone={option.photo === "discouraged" ? "warning" : "success"}
                  >
                    {option.photo === "discouraged" ? "Sin foto" : "Con foto"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup
        title="¿A qué te dedicas?"
        description="Solo se usa para elegir qué frases sugerimos al redactar tus logros."
      >
        <SelectField
          label="Sector o profesión"
          value={cv.industry}
          onChange={(e) => update({ industry: e.target.value })}
          className="max-w-sm"
        >
          {INDUSTRIES.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.label}
            </option>
          ))}
        </SelectField>
      </FieldGroup>

      <div className="border-primary-100 bg-primary-soft rounded-card border p-5">
        <h3 className="font-display text-primary text-sm font-semibold">
          Recomendaciones para {region.label}
        </h3>
        <ul className="mt-3 space-y-2">
          {region.tips.map((tip) => (
            <li
              key={tip}
              className="text-ink-soft flex gap-2 text-sm leading-relaxed"
            >
              <span className="bg-primary mt-2 size-1 shrink-0 rounded-full" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
