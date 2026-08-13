"use client";

import { useSyncExternalStore } from "react";

import {
  activatePass,
  clearPass,
  consumePass,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/payments/pass-store";

/**
 * Suscribe un componente al pase premium. Los mutadores son funciones de
 * módulo, así que son estables y se pueden usar en arrays de dependencias.
 */
export function usePremiumPass() {
  const { pass, status, justConsumed, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    pass,
    /**
     * True si las plantillas premium están desbloqueadas ahora mismo.
     *
     * `checking` cuenta como desbloqueado a propósito. Mientras se comprueba un
     * pase recuperado del disco hay que enseñar algo, y enseñar el candado a
     * quien acaba de pagar es empujarle a pagar otra vez; enseñar las
     * plantillas a quien no tiene pase válido no le da nada, porque el PDF lo
     * sigue autorizando el servidor. El error barato es el segundo.
     */
    passActive: status === "active" || status === "checking",
    /** Se está comprobando contra el servidor un pase recuperado del disco. */
    passChecking: status === "checking",
    /** True justo después de una descarga correcta, para poder explicarla. */
    justConsumed,
    hydrated,
    activate: activatePass,
    consume: consumePass,
    clear: clearPass,
  };
}
