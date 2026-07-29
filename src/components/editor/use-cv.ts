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

  return {
    cv,
    saveState,
    resumed,
    hydrated,
    region: getRegion(cv.region),
    template: getTemplate(cv.templateId),
    update: updateCv,
    updatePersonal,
    setRegion,
    setTemplate,
    reset: resetDraft,
  };
}
