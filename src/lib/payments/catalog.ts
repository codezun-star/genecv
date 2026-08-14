import { PREMIUM_TEMPLATES, getTemplate } from "@/lib/cv/templates";

/**
 * Mapa plantilla premium → price_id de Paddle.
 *
 * Los price_id NO son secretos: viajan al navegador para abrir el checkout, así
 * que viven en el repositorio y no en variables de entorno. Lo que sí es
 * secreto es la API key del servidor.
 *
 * Cada entrada corresponde a un precio distinto en Paddle. Se rellena con los
 * ids reales del dashboard (ver `docs/PAGOS.md`). Mientras queden marcadores
 * `pri_PENDIENTE_*`, esa plantilla no se puede comprar y la interfaz lo dice en
 * lugar de abrir un checkout roto.
 */

type PaddleEnvironment = "sandbox" | "production";

/** Marcador para las plantillas todavía sin precio creado en Paddle. */
const PENDING = (id: string) => `pri_PENDIENTE_${id}`;

const SANDBOX_PRICE_IDS: Record<string, string> = {
  creativa: PENDING("creativa"),
  ejecutiva: PENDING("ejecutiva"),
  compacta: PENDING("compacta"),
  editorial: PENDING("editorial"),
  corporativa: PENDING("corporativa"),
  consultora: PENDING("consultora"),
  directiva: PENDING("directiva"),
  trayectoria: PENDING("trayectoria"),
  academica: PENDING("academica"),
  tecnica: PENDING("tecnica"),
  contraste: PENDING("contraste"),
  meridiano: PENDING("meridiano"),
  nordica: PENDING("nordica"),
  atenea: PENDING("atenea"),
  pulso: PENDING("pulso"),
  vanguardia: PENDING("vanguardia"),
  bruma: PENDING("bruma"),
};

const PRODUCTION_PRICE_IDS: Record<string, string> = {
  creativa: PENDING("creativa"),
  ejecutiva: PENDING("ejecutiva"),
  compacta: PENDING("compacta"),
  editorial: PENDING("editorial"),
  corporativa: PENDING("corporativa"),
  consultora: PENDING("consultora"),
  directiva: PENDING("directiva"),
  trayectoria: PENDING("trayectoria"),
  academica: PENDING("academica"),
  tecnica: PENDING("tecnica"),
  contraste: PENDING("contraste"),
  meridiano: PENDING("meridiano"),
  nordica: PENDING("nordica"),
  atenea: PENDING("atenea"),
  pulso: PENDING("pulso"),
  vanguardia: PENDING("vanguardia"),
  bruma: PENDING("bruma"),
};

/**
 * Qué entorno de Paddle se usa. Se lee de una variable pública porque el
 * cliente también necesita saberlo para inicializar Paddle.js.
 */
export function paddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "production"
    : "sandbox";
}

function priceMap(): Record<string, string> {
  return paddleEnvironment() === "production"
    ? PRODUCTION_PRICE_IDS
    : SANDBOX_PRICE_IDS;
}

export function isPlaceholderPriceId(priceId: string | undefined): boolean {
  return !priceId || priceId.startsWith("pri_PENDIENTE_");
}

/** price_id configurado para una plantilla, o null si aún no existe. */
export function priceIdForTemplate(templateId: string): string | null {
  const priceId = priceMap()[templateId];
  return isPlaceholderPriceId(priceId) ? null : priceId;
}

/**
 * Inverso del mapa anterior. Lo usa el servidor para comprobar que el price_id
 * realmente cobrado corresponde a la plantilla que se está pidiendo.
 */
export function templateIdForPrice(priceId: string): string | null {
  const map = priceMap();
  for (const [templateId, id] of Object.entries(map)) {
    if (id === priceId && !isPlaceholderPriceId(id)) return templateId;
  }
  return null;
}

/** True si esa plantilla se puede comprar ahora mismo. */
export function isPurchasable(templateId: string): boolean {
  const template = getTemplate(templateId);
  return template.isPremium && priceIdForTemplate(templateId) !== null;
}

/**
 * Comprobación de arranque para detectar plantillas premium sin precio. Se
 * expone para el script de verificación y para los tests; no se ejecuta sola
 * porque durante el desarrollo es normal tener precios a medio crear.
 */
export function missingPriceIds(): string[] {
  return PREMIUM_TEMPLATES.filter(
    (template) => priceIdForTemplate(template.id) === null,
  ).map((template) => template.id);
}
