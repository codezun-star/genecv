"use client";

import { useSyncExternalStore } from "react";

import { usePremiumPass } from "@/components/editor/use-premium-pass";
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
import { isPaidMode } from "@/lib/payments/mode";

/**
 * Subscribes a component to the draft. The mutators are module-level
 * functions, so they are stable and safe to use in dependency arrays.
 *
 * También compone el estado del pase premium, porque «¿está bloqueada la
 * descarga?» depende de las dos cosas —qué plantilla hay elegida y si hay pase—
 * y esa condición se consulta desde tres sitios. Escrita a mano en cada uno,
 * bastaría con olvidarse de un término para regalar descargas o para cobrar dos
 * veces.
 */
export function useCv() {
  const { cv, saveState, resumed, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const { pass, passActive, passChecking, justConsumed, activate, consume, clear } =
    usePremiumPass();

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
     * Si la descarga está bloqueada.
     *
     * En modo "free_launch" nunca lo está: las premium se descargan gratis por
     * el mismo camino que las gratuitas. En "paid" lo está mientras no haya un
     * pase activo — y vuelve a estarlo en cuanto el pase se consume al
     * descargar, que es el modelo entero en una línea.
     */
    locked: template.isPremium && isPaidMode() && !passActive,
    pass,
    passActive,
    passChecking,
    justConsumed,
    activatePass: activate,
    consumePass: consume,
    clearPass: clear,
    update: updateCv,
    updatePersonal,
    setRegion,
    setTemplate,
    reset: resetDraft,
  };
}
