/**
 * Modo de monetización de las plantillas premium.
 *
 * Toda la integración de Paddle sigue en el repositorio y funcionando; este
 * flag decide únicamente si se ejecuta. Volver a cobrar es cambiar el valor de
 * `NEXT_PUBLIC_PREMIUM_MODE` a "paid" y redesplegar: no hay que descomentar
 * código, restaurar ficheros ni tocar el catálogo.
 *
 * - "free_launch": las plantillas premium se descargan gratis y sin marca de
 *   agua, con un aviso de que más adelante tendrán coste. No se abre el
 *   checkout, no se llama a /api/generate-pdf y no se contacta con Paddle.
 * - "paid": el flujo real — se compra un pase, el pase desbloquea las
 *   diecisiete plantillas premium, y la descarga del PDF lo consume.
 *
 * OJO: las variables NEXT_PUBLIC_ se incrustan en el bundle en tiempo de
 * compilación. Cambiar el valor en Vercel NO surte efecto hasta que se vuelve
 * a desplegar.
 */

export type PremiumMode = "free_launch" | "paid";

/** Por defecto "free_launch": ante una variable ausente o mal escrita, nunca
 *  se cobra por error. */
export function premiumMode(): PremiumMode {
  return process.env.NEXT_PUBLIC_PREMIUM_MODE === "paid"
    ? "paid"
    : "free_launch";
}

export function isFreeLaunch(): boolean {
  return premiumMode() === "free_launch";
}

export function isPaidMode(): boolean {
  return premiumMode() === "paid";
}

/**
 * Textos del modo de lanzamiento gratuito.
 *
 * Están todos aquí para que cambiar el mensaje o el precio anunciado sea
 * editar un fichero, no perseguir cadenas por media docena de componentes.
 */
export const FREE_LAUNCH_COPY = {
  /** Etiqueta corta, para insignias junto al nombre de la plantilla. */
  badge: "Gratis por lanzamiento",

  /** Titular del aviso que aparece antes de descargar. */
  title: "Plantilla premium — gratis por lanzamiento",

  /** Primera parte del aviso, común a los dos casos. */
  body:
    "Esta plantilla es de pago, pero durante el lanzamiento puedes descargarla " +
    "sin coste y sin marca de agua.",

  /**
   * Precio que se anuncia. Déjalo vacío mientras no esté decidido y la frase
   * se adapta sola; en cuanto pongas un valor ("4,99 €") se anuncia.
   */
  priceLabel: "",

  /** Cierre cuando todavía no hay precio decidido. */
  closingWithoutPrice: "Más adelante pasará a ser de pago.",

  /** Cierre cuando sí lo hay. `{price}` se sustituye por `priceLabel`. */
  closingWithPrice: "Más adelante costará {price}.",

  /** Descripción del bloque de plantillas premium en el paso de plantilla. */
  templateSectionDescription:
    "Durante el lanzamiento puedes usarlas y descargarlas gratis, sin marca de " +
    "agua. Más adelante pasarán a ser de pago.",

  /** Texto para la página comercial /premium. */
  landingLead:
    "Durante el lanzamiento, todas las plantillas premium se descargan gratis " +
    "y sin marca de agua. Queremos ver cuáles se usan más antes de ponerles " +
    "precio, así que aprovecha ahora.",
} as const;

/**
 * Monta el aviso completo.
 *
 * Elige el cierre según haya precio anunciado o no, de modo que la frase se
 * lee bien tanto ahora («Más adelante pasará a ser de pago») como cuando se
 * fije el importe («Más adelante costará 4,99 €»).
 */
export function freeLaunchBody(): string {
  const price = FREE_LAUNCH_COPY.priceLabel.trim();

  const closing = price
    ? FREE_LAUNCH_COPY.closingWithPrice.replace("{price}", price)
    : FREE_LAUNCH_COPY.closingWithoutPrice;

  return `${FREE_LAUNCH_COPY.body} ${closing} Aprovecha mientras esté disponible sin cargo.`;
}

/**
 * Textos del modo de cobro.
 *
 * El modelo cuesta una frase de explicar y es fácil de contar mal, así que la
 * frase se escribe una vez aquí y la usan el editor, la galería y las páginas
 * comerciales. Si el modelo cambia, cambia en un sitio.
 *
 * La regla al redactar: no prometer «acceso» ni «desbloqueo permanente». Lo que
 * se compra desbloquea las diecisiete plantillas, pero se gasta al descargar.
 * Decirlo antes del pago es la diferencia entre un cliente y una devolución.
 */
export const PASS_COPY = {
  /** Nombre del producto, tal y como se le llama al usuario. */
  name: "Pase de descarga premium",

  /** Insignia corta para el estado desbloqueado. */
  unlockedBadge: "Premium desbloqueado",

  /** Resumen del modelo, en una frase. Es el texto que más se repite. */
  summary:
    "Un solo pago desbloquea las diecisiete plantillas premium: puedes " +
    "probarlas todas con tu CV y cambiar de diseño las veces que quieras. El " +
    "pase se consume al descargar el PDF.",

  /** La advertencia, dicha sin rodeos. Va siempre antes de pagar. */
  consumedOnDownload:
    "Al descargar, el pase se consume y las plantillas premium vuelven a " +
    "bloquearse. Una segunda descarga requiere un pago nuevo.",

  /** Confirmación tras una descarga correcta. */
  afterDownload:
    "Tu PDF se ha descargado sin marca de agua. El pase ya se ha consumido, " +
    "así que las plantillas premium vuelven a estar bloqueadas.",
} as const;
