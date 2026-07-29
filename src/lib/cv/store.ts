import { createEmptyCv } from "@/lib/cv/defaults";
import { getRegion } from "@/lib/cv/regions";
import { FREE_TEMPLATES, getTemplate } from "@/lib/cv/templates";
import {
  clearDraft,
  isOnboarded,
  loadDraft,
  markOnboarded,
  saveDraft,
} from "@/lib/cv/storage";
import type { CvData, RegionId } from "@/lib/cv/types";

/**
 * The draft lives in localStorage, so localStorage is the store and React
 * subscribes to it through `useSyncExternalStore`. Keeping it outside React
 * means no hydration effect and no save effect: reads happen lazily on the
 * first client render, and every mutation schedules its own write.
 */

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface CvSnapshot {
  cv: CvData;
  saveState: SaveState;
  /** True when a draft from a previous session was restored. */
  resumed: boolean;
  /** False during SSR and the hydration render. */
  hydrated: boolean;
}

const SAVE_DEBOUNCE_MS = 500;

/**
 * Rendered on the server and during hydration. Ids are fixed rather than
 * random so both passes produce identical markup.
 */
const SERVER_SNAPSHOT: CvSnapshot = {
  cv: {
    ...createEmptyCv(),
    experience: [
      {
        id: "exp_seed",
        position: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        achievements: [""],
      },
    ],
    education: [
      {
        id: "edu_seed",
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    skills: [
      { id: "skl_seed_1", name: "", level: 3 },
      { id: "skl_seed_2", name: "", level: 3 },
      { id: "skl_seed_3", name: "", level: 3 },
    ],
    languages: [{ id: "lng_seed", name: "", level: "B2" }],
    updatedAt: "",
  },
  saveState: "idle",
  resumed: false,
  hydrated: false,
};

const listeners = new Set<() => void>();
let snapshot: CvSnapshot = SERVER_SNAPSHOT;
let initialized = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

/** Template preselected via ?plantilla= on the gallery links. */
function templateFromUrl(): string | null {
  try {
    const id = new URLSearchParams(window.location.search).get("plantilla");
    if (!id) return null;
    return FREE_TEMPLATES.some((t) => t.id === id) ? id : null;
  } catch {
    return null;
  }
}

/** Runs once, on the first client read. */
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const draft = loadDraft();
  const requested = templateFromUrl();
  const base = draft ?? createEmptyCv();
  const cv = requested
    ? { ...base, templateId: requested, accentColor: getTemplate(requested).accent }
    : base;

  snapshot = {
    cv,
    saveState: "idle",
    resumed: Boolean(draft) && isOnboarded(),
    hydrated: true,
  };
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CvSnapshot {
  init();
  return snapshot;
}

export function getServerSnapshot(): CvSnapshot {
  return SERVER_SNAPSHOT;
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    const ok = saveDraft(snapshot.cv);
    snapshot = { ...snapshot, saveState: ok ? "saved" : "error" };
    emit();
  }, SAVE_DEBOUNCE_MS);
}

function commit(cv: CvData) {
  snapshot = {
    ...snapshot,
    cv: { ...cv, updatedAt: new Date().toISOString() },
    saveState: "saving",
  };
  emit();
  scheduleSave();
}

export function updateCv(patch: Partial<CvData>) {
  init();
  commit({ ...snapshot.cv, ...patch });
}

export function updatePersonal(patch: Partial<CvData["personal"]>) {
  init();
  commit({
    ...snapshot.cv,
    personal: { ...snapshot.cv.personal, ...patch },
  });
}

/**
 * Applies a market's conventions — section order and whether a photo is shown
 * — without touching anything the user typed.
 */
export function setRegion(regionId: RegionId) {
  init();
  const preset = getRegion(regionId);
  markOnboarded();

  commit({
    ...snapshot.cv,
    region: preset.id,
    sectionOrder: [...preset.sectionOrder],
    personal: {
      ...snapshot.cv.personal,
      showPhoto:
        preset.photo === "discouraged" ? false : preset.showPhotoByDefault,
    },
  });
}

export function setTemplate(templateId: string) {
  init();
  const template = getTemplate(templateId);
  // Premium designs are catalogued but not selectable yet.
  if (template.isPremium) return;

  commit({
    ...snapshot.cv,
    templateId: template.id,
    accentColor: template.accent,
  });
}

export function resetDraft() {
  init();
  if (saveTimer) clearTimeout(saveTimer);
  clearDraft();

  snapshot = {
    cv: createEmptyCv(),
    saveState: "idle",
    resumed: false,
    hydrated: true,
  };
  emit();
}
