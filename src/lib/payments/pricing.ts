/**
 * Qué se vende.
 *
 * El modelo es un ÚNICO producto: el **pase de descarga premium**. No hay un
 * precio por plantilla. Eso eran diecisiete precios que mantener, diecisiete
 * productos que dar de alta y una decisión imposible de defender —por qué
 * «Ejecutiva» vale más que «Bruma»—, y además obligaba a comprar a ciegas: se
 * pagaba una plantilla concreta antes de haber podido comparar las demás con el
 * CV propio delante.
 *
 * Con un solo precio, el pago desbloquea las diecisiete a la vez y lo que se
 * consume es la descarga. Ver `docs/PAGOS.md` para el flujo completo.
 *
 * El price_id **no es secreto**: viaja al navegador para abrir el checkout. Vive
 * en una variable de entorno y no en el repositorio porque sandbox y producción
 * tienen ids distintos: así pasar a producción es cambiar variables en Vercel y
 * no editar un fichero, que es como se acaba desplegando el id de pruebas.
 */

export type PaddleEnvironment = "sandbox" | "production";

/**
 * Contra qué entorno de Paddle se habla. Es pública porque el navegador también
 * la necesita para inicializar Paddle.js con el entorno correcto.
 */
export function paddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "production"
    : "sandbox";
}

/** price_id del pase, o null si este despliegue todavía no lo tiene. */
export function passPriceId(): string | null {
  const id = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PASS?.trim();
  return id ? id : null;
}

/**
 * ¿El precio realmente cobrado es el del pase?
 *
 * Lo usa el servidor antes de desbloquear nada. La cuenta de Paddle puede
 * vender más cosas —de hecho ya sirve a otro producto—, así que una transacción
 * pagada no basta: tiene que ser pagada *por esto*. Sin esta comprobación,
 * cualquier compra de cualquier producto de la cuenta valdría como pase.
 */
export function isPassPrice(priceId: string | null | undefined): boolean {
  const expected = passPriceId();
  return Boolean(expected && priceId === expected);
}

/**
 * ¿Se puede abrir el checkout ahora mismo?
 *
 * Si falta el price_id o el token de cliente, la interfaz lo dice en lugar de
 * abrir un overlay roto. Es el fallo esperable de un despliegue al que se le
 * olvidó una variable, y conviene que se vea.
 */
export function isCheckoutConfigured(): boolean {
  return Boolean(passPriceId() && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
}
