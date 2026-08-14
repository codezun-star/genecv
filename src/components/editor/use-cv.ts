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
import { isFreeLaunch } from "@/lib/payments/mode";

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
    /** True si el diseño elegido es de pago, con independencia del modo. */
    isPremiumTemplate: template.isPremium,
    /**
     * Si la descarga está bloqueada tras el checkout.
     *
     * En modo "free_launch" nunca lo está: las premium se descargan gratis por
     * el mismo camino que las gratuitas. En "paid" lo está siempre que el
     * diseño sea premium, porque cada descarga es un pago independiente y no
     * existe un estado de "ya desbloqueada".
     */
    locked: template.isPremium && !isFreeLaunch(),
    update: updateCv,
    updatePersonal,
    setRegion,
    setTemplate,
    reset: resetDraft,
  };
}
