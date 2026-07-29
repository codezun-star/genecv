"use client";

import { useSyncExternalStore } from "react";

import { getRegion } from "@/lib/cv/regions";
import {
  getServerSnapshot,
  getSnapshot,
  resetDraft,
  setRegion,
  setTemplate,
  subscribe,
  updateCv,
  updatePersonal,
} from "@/lib/cv/store";
import { getTemplate } from "@/lib/cv/templates";
import { isUnlocked } from "@/lib/cv/unlock";

/**
 * Subscribes a component to the draft. The mutators are module-level
 * functions, so they are stable and safe to use in dependency arrays.
 */
export function useCv() {
  const { cv, saveState, resumed, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const template = getTemplate(cv.templateId);

  return {
    cv,
    saveState,
    resumed,
    hydrated,
    region: getRegion(cv.region),
    template,
    /** Premium template the user has not paid for: preview yes, export no. */
    locked: template.isPremium && !isUnlocked(template.id),
    update: updateCv,
    updatePersonal,
    setRegion,
    setTemplate,
    reset: resetDraft,
  };
}
