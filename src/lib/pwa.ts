import { useSyncExternalStore } from "react";

/**
 * Instalación como aplicación.
 *
 * Chrome y Edge avisan de que el sitio se puede instalar con el evento
 * `beforeinstallprompt`, y el diálogo solo se puede abrir llamando a
 * `prompt()` sobre ese mismo evento. Llega una sola vez y a menudo antes de
 * que nadie abra el menú donde está el botón, así que se escucha aquí, al
 * cargar el módulo, y se guarda.
 *
 * No se le llama `preventDefault()`: eso escondería la mini barra que ofrece
 * el propio navegador, y no hay motivo para quitarle a nadie esa vía.
 *
 * Safari no tiene ni el evento ni un diálogo propio: en iPhone y iPad se
 * instala desde la hoja de compartir, así que ahí lo que se da son las
 * instrucciones.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * - `prompt`: el navegador ofrece su diálogo de instalación.
 * - `ios`: Safari en iPhone o iPad; se explica cómo hacerlo a mano.
 * - `installed`: ya se está usando como aplicación.
 * - `none`: no hay forma de ofrecerlo (o todavía no se sabe).
 */
export type InstallMode = "prompt" | "ios" | "installed" | "none";

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari en iOS no implementa `display-mode` para las webs añadidas a la
    // pantalla de inicio; tiene su propia propiedad.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  // Desde iPadOS 13 el iPad se presenta como un Mac de escritorio; lo delata
  // la pantalla táctil.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function getInstallMode(): InstallMode {
  if (isStandalone()) return "installed";
  if (deferred) return "prompt";
  if (isIos()) return "ios";
  return "none";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useInstallMode(): InstallMode {
  return useSyncExternalStore(subscribe, getInstallMode, () => "none");
}

/** Abre el diálogo del navegador. Devuelve si la instalación se aceptó. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;

  // El evento solo sirve una vez, se acepte o no.
  deferred = null;
  notify();

  try {
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome === "accepted";
  } catch {
    return false;
  }
}
