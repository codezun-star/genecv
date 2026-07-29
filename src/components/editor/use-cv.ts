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

  const template = getTemplate(cv.templateId);

  return {
    cv,
    saveState,
    resumed,
    hydrated,
    region: getRegion(cv.region),
    template,
    /**
     * Premium: se previsualiza siempre, pero la descarga pasa por el checkout.
     * No hay estado de "desbloqueado": cada descarga es un pago, así que esto
     * depende solo del diseño elegido.
     */
    locked: template.isPremium,
    update: updateCv,
    updatePersonal,
    setRegion,
    setTemplate,
    reset: resetDraft,
  };
}
