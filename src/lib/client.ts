import { useSyncExternalStore } from "react";

/**
 * Pequeños ganchos para leer el navegador sin romper la hidratación.
 *
 * Todo lo que depende de `window` o de `navigator` vale una cosa en el
 * servidor (no hay navegador) y otra en el cliente. Leerlo directamente en el
 * render hace que el HTML hidratado no coincida con el del servidor;
 * `useSyncExternalStore` con un valor de servidor explícito es la forma que
 * tiene React de decir «en el servidor esto vale X y tras hidratar, lo que
 * diga el navegador», sin un render de más ni un `setState` dentro de un
 * efecto.
 */

const noopSubscribe = () => () => {};

/** `true` solo en el cliente, ya hidratado. Para portales y APIs del navegador. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Si el sistema ofrece la hoja de compartir nativa (móviles, sobre todo). */
export function useCanShare(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
}

/** Si el dispositivo se maneja con el dedo: teclado en pantalla, sin ratón. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

function subscribeCoarsePointer(onChange: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
