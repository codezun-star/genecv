import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind classes win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable-enough id for client-side list items (experience, education, ...). */
export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Turns "José" "Pérez García" into "Jose_Perez_Garcia" so exported files are
 * safe on every OS. Falls back to a generic name when fields are empty.
 */
export function toFileSlug(...parts: string[]) {
  const slug = parts
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join("_");

  return slug || "CV";
}
