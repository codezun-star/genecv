/**
 * Los textos del modelo de cobro.
 *
 * El modelo cuesta una frase de explicar y es fácil de contar mal, así que la
 * frase se escribe una vez aquí y la usan el editor, la galería y las páginas
 * comerciales. Si el modelo cambia, cambia en un sitio.
 *
 * La regla al redactar: **no prometer «acceso» ni «desbloqueo permanente»**. Lo
 * que se compra desbloquea las diecisiete plantillas, pero se gasta al
 * descargar. Decirlo antes del pago es la diferencia entre un cliente y una
 * devolución.
 *
 * El precio de referencia vive aquí; el que manda, no. Ver `PASS_PRICE`.
 */

/**
 * El precio del pase, para poder anunciarlo.
 *
 * Existe porque las páginas comerciales (`/premium`, `/plantillas`) se
 * renderizan en el servidor y no pueden preguntarle nada a Paddle.js, que solo
 * corre en el navegador. Sin esto, un visitante tendría que llegar al último
 * paso del editor para enterarse de cuánto cuesta, y un precio que solo se ve
 * después de rellenar un formulario entero no vende nada.
 *
 * **La autoridad sigue siendo Paddle.** Donde se compra de verdad —el bloque
 * del editor— se pide el importe real con `PricePreview` y ese gana: sale en la
 * moneda de quien mira y refleja cualquier cambio hecho en el dashboard. Esta
 * etiqueta es el respaldo mientras llega, y el escaparate donde no hay
 * navegador que preguntar.
 *
 * Por eso `amountMinorUnits` está aquí junto a la etiqueta: `npm run
 * paddle:check` lo compara con el precio real de Paddle y avisa si se han
 * separado. Una etiqueta que anuncia 9,99 mientras el overlay cobra 12,99 es
 * una devolución y, en varios países, publicidad engañosa.
 */
export const PASS_PRICE = {
  /** Unidades menores, tal y como las quiere la API de Paddle (999 = 9,99). */
  amountMinorUnits: 999,
  currency: "USD",
  /** Cómo se escribe en pantalla. El sitio está en español: coma decimal. */
  label: "$9,99",
} as const;

export const PASS_COPY = {
  /** Nombre del producto, tal y como se le llama al usuario. */
  name: "Pase de descarga premium",

  /** Insignia corta para el estado desbloqueado. */
  unlockedBadge: "Premium desbloqueado",

  /** Resumen del modelo, en una frase. Es el texto que más se repite. */
  summary:
    `Un solo pago de ${PASS_PRICE.label} desbloquea las diecisiete plantillas ` +
    "premium: puedes probarlas todas con tu CV y cambiar de diseño las veces " +
    "que quieras. El pase se consume al descargar el PDF.",

  /** La advertencia, dicha sin rodeos. Va siempre antes de pagar. */
  consumedOnDownload:
    "Al descargar, el pase se consume y las plantillas premium vuelven a " +
    "bloquearse. Una segunda descarga requiere un pago nuevo.",

  /** Confirmación tras una descarga correcta. */
  afterDownload:
    "Tu PDF se ha descargado sin marca de agua. El pase ya se ha consumido, " +
    "así que las plantillas premium vuelven a estar bloqueadas.",
} as const;
