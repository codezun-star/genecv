import { CV_SCHEMA_VERSION, createEmptyCv } from "@/lib/cv/defaults";
import type { CvData } from "@/lib/cv/types";

const STORAGE_KEY = "genecv:draft";
const ONBOARDED_KEY = "genecv:onboarded";

/**
 * Reads the saved draft. Returns null when there is nothing usable — a missing
 * key, a corrupt payload, or a draft written by an older schema.
 */
export function loadDraft(): CvData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CvData>;
    if (parsed?.version !== CV_SCHEMA_VERSION) return null;

    // Merge onto a fresh default so fields added since the draft was written
    // are always present.
    const base = createEmptyCv(parsed.region);
    return {
      ...base,
      ...parsed,
      personal: { ...base.personal, ...parsed.personal },
    } as CvData;
  } catch {
    return null;
  }
}

/** Persists the draft. Storage can be full or disabled — never throw. */
export function saveDraft(data: CvData): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    // Most likely QuotaExceededError from a large photo.
    return false;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    // Nothing to do — the draft simply stays.
  }
}

export function hasDraft(): boolean {
  return loadDraft() !== null;
}

/** True once the user has picked a region, so we skip the format step. */
export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboarded() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    // Ignore: the user just sees the format picker again next time.
  }
}
