import { createEmptyCv } from "@/lib/cv/defaults";
import { getRegion } from "@/lib/cv/regions";
import { TEMPLATES, getTemplate } from "@/lib/cv/templates";
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

/** Reads ?plantilla= and ?formato= from gallery and article links. */
function paramsFromUrl(): { templateId: string | null; region: RegionId | null } {
  try {
    const params = new URLSearchParams(window.location.search);

    const templateId = params.get("plantilla");
    const region = params.get("formato");

    return {
      templateId:
        templateId && TEMPLATES.some((t) => t.id === templateId)
          ? templateId
          : null,
      region:
        region === "europa" || region === "latam" || region === "anglo"
          ? region
          : null,
    };
  } catch {
    return { templateId: null, region: null };
  }
}

/** Runs once, on the first client read. */
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const draft = loadDraft();
  const { templateId, region } = paramsFromUrl();

  let cv = draft ?? createEmptyCv();

  if (templateId) {
    cv = {
      ...cv,
      templateId,
      accentColor: getTemplate(templateId).accent,
    };
  }

  // A ?formato= link (used by the country guides) applies that market's
  // conventions without touching content the user already typed.
  if (region) {
    const preset = getRegion(region);
    cv = {
      ...cv,
      region: preset.id,
      sectionOrder: [...preset.sectionOrder],
      personal: {
        ...cv.personal,
        showPhoto:
          preset.photo === "discouraged" ? false : preset.showPhotoByDefault,
      },
    };
    markOnboarded();
  }

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

/**
 * Any template can be selected. Nothing is gated: switching design is free and
 * keeps every word the user has typed, which is the whole point of separating
 * content from layout.
 */
export function setTemplate(templateId: string) {
  init();
  const template = getTemplate(templateId);

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
