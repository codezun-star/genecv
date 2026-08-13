/**
 * El pase premium, del lado del navegador.
 *
 * Mismo patrón que el borrador del CV (`lib/cv/store.ts`): localStorage es el
 * store y React se suscribe con `useSyncExternalStore`. Se guarda en
 * localStorage y no en memoria porque el pago abre un overlay y la gente cierra
 * pestañas: haber pagado y perder el desbloqueo por recargar sería cobrar dos
 * veces por lo mismo.
 *
 * Lo que se guarda es un `transaction_id`, que no es una credencial: no
 * desbloquea nada por sí solo. El servidor lo resuelve contra Paddle en cada
 * petición. Falsificar esta entrada de localStorage solo consigue que
 * `/api/generate-pdf` responda 403.
 */

const STORAGE_KEY = "genecv:pase";

export interface PremiumPass {
  transactionId: string;
  unlockedAt: string;
}

/**
 * - `none`: no hay pase.
 * - `checking`: hay uno guardado y se está preguntando al servidor si sirve.
 * - `active`: desbloqueado.
 */
export type PassStatus = "none" | "checking" | "active";

export interface PassSnapshot {
  pass: PremiumPass | null;
  status: PassStatus;
  /** True justo después de una descarga correcta, para poder explicarla. */
  justConsumed: boolean;
  /** False durante el SSR y el render de hidratación. */
  hydrated: boolean;
}

const SERVER_SNAPSHOT: PassSnapshot = {
  pass: null,
  status: "none",
  justConsumed: false,
  hydrated: false,
};

const listeners = new Set<() => void>();
let snapshot: PassSnapshot = SERVER_SNAPSHOT;
let initialized = false;

function emit() {
  for (const listener of listeners) listener();
}

function set(patch: Partial<PassSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function read(): PremiumPass | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PremiumPass>;
    return typeof parsed?.transactionId === "string" && parsed.transactionId
      ? {
          transactionId: parsed.transactionId,
          unlockedAt: parsed.unlockedAt ?? "",
        }
      : null;
  } catch {
    return null;
  }
}

function write(pass: PremiumPass | null) {
  try {
    if (pass) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pass));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Almacenamiento lleno o desactivado. El pase sigue valiendo en el
    // servidor; lo único que se pierde es sobrevivir a una recarga.
  }
}

/**
 * Le pregunta al servidor si un pase guardado sigue en pie.
 *
 * Vive aquí y no en `checkout-client.ts` para no arrastrar Paddle.js: es un
 * `fetch` a nuestra propia API y no necesita el SDK, mientras que cualquier
 * cosa importada desde este módulo acaba en el bundle del editor entero.
 *
 * `null` significa "no se ha podido preguntar", que no es lo mismo que "no
 * vale".
 */
async function askServer(transactionId: string): Promise<boolean | null> {
  try {
    const response = await fetch("/api/premium-pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) return null;

    const body = (await response.json()) as { valid?: boolean };
    return typeof body.valid === "boolean" ? body.valid : null;
  } catch {
    return null;
  }
}

/**
 * Comprueba un pase recuperado de localStorage.
 *
 * El veredicto ante un fallo de red es deliberado: se deja el pase **activo**.
 * Equivocarse hacia "desbloqueado" cuesta un error claro al pulsar «Descargar»
 * —el endpoint sigue siendo la autoridad y no entrega nada sin pago—, mientras
 * que equivocarse hacia "bloqueado" invita a alguien que ya pagó a pagar otra
 * vez. Entre las dos, la que no cobra dos veces.
 */
async function revalidate(pass: PremiumPass) {
  const valid = await askServer(pass.transactionId);

  // Preguntar lleva su tiempo, y en ese hueco el pase puede haberse gastado en
  // una descarga o haberse comprado otro. Escribir el veredicto de un pase que
  // ya no es el vigente resucitaría un estado muerto, así que se descarta.
  if (snapshot.pass?.transactionId !== pass.transactionId) return;

  if (valid === false) {
    write(null);
    set({ pass: null, status: "none" });
    return;
  }

  set({ status: "active" });
}

/** Se ejecuta una sola vez, en la primera lectura desde el cliente. */
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const pass = read();

  snapshot = {
    pass,
    status: pass ? "checking" : "none",
    justConsumed: false,
    hydrated: true,
  };

  if (pass) void revalidate(pass);

  // Si el pase se gasta en otra pestaña, esta se entera. Sin esto, una segunda
  // pestaña seguiría enseñando las plantillas desbloqueadas hasta recargar.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;

    const current = read();
    set({
      pass: current,
      status: current ? "active" : "none",
      justConsumed: false,
    });
  });
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): PassSnapshot {
  init();
  return snapshot;
}

export function getServerSnapshot(): PassSnapshot {
  return SERVER_SNAPSHOT;
}

/**
 * Guarda el pase recién comprado.
 *
 * Se marca `active` sin preguntar al servidor: el overlay acaba de confirmar el
 * pago y la descarga lo verificará de todos modos. Pedir una segunda opinión
 * aquí solo añadiría una espera —y un posible falso negativo por la latencia
 * entre Paddle y su propia API— justo en el momento en que la persona acaba de
 * pagar.
 */
export function activatePass(transactionId: string) {
  init();

  const pass: PremiumPass = {
    transactionId,
    unlockedAt: new Date().toISOString(),
  };

  write(pass);
  set({ pass, status: "active", justConsumed: false });
}

/**
 * El pase se ha gastado en una descarga correcta.
 *
 * Es el momento en que el sistema se vuelve a bloquear, que es justo lo que se
 * anuncia antes de pagar. `justConsumed` existe para poder decirlo en pantalla:
 * sin ello, la interfaz se re-bloquearía sin explicación aparente.
 */
export function consumePass() {
  init();
  write(null);
  set({ pass: null, status: "none", justConsumed: true });
}

/** El pase ya no sirve (gastado en otra pestaña, reembolsado, inválido). */
export function clearPass() {
  init();
  write(null);
  set({ pass: null, status: "none", justConsumed: false });
}
