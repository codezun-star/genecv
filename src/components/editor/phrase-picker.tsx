"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { getSuggestions } from "@/lib/cv/phrases";

/**
 * Inline suggestion list backed by the phrase bank.
 *
 * Clicking a phrase inserts it into the field the caller controls. The text
 * keeps its [placeholders] so the user is nudged to replace them with real
 * numbers rather than shipping a generic line.
 */
export function PhrasePicker({
  industry,
  kind,
  onPick,
  label = "Ver sugerencias",
}: {
  industry: string;
  kind: "summaries" | "achievements";
  onPick: (phrase: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const suggestions = getSuggestions(industry, kind);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-secondary hover:text-primary -mx-1 inline-flex min-h-9 items-center gap-1.5 px-1 text-xs font-semibold transition-colors duration-150"
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
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        </svg>
        {open ? "Ocultar sugerencias" : label}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="border-line bg-surface mt-2 max-h-56 space-y-1 overflow-y-auto rounded-field border p-2">
              {suggestions.map((phrase) => (
                <li key={phrase}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(phrase);
                      setOpen(false);
                    }}
                    className="hover:bg-primary-soft hover:text-primary text-ink-soft w-full rounded-md px-2.5 py-2 text-left text-xs leading-relaxed transition-colors duration-150"
                  >
                    {phrase}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-1.5 text-xs">
              Sustituye lo que va entre corchetes por tus datos reales.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
