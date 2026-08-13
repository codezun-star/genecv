#!/usr/bin/env node
/**
 * Crea en Paddle el producto y el precio del pase de descarga premium, y
 * escupe la línea lista para pegar en `.env.local` o en Vercel.
 *
 * Es un solo producto y un solo precio porque el modelo es un solo pase: un
 * pago desbloquea las diecisiete plantillas y se consume al descargar. (La
 * versión anterior de este script creaba diecisiete productos, uno por
 * plantilla; si los creaste, ya no se usan y puedes archivarlos en el
 * dashboard.)
 *
 * Es idempotente: marca el producto con `custom_data.genecv = "premium_pass"`,
 * así que volver a ejecutarlo reutiliza lo que exista en lugar de duplicarlo.
 *
 * Uso:
 *   PADDLE_API_KEY=pdl_sdbx_... node scripts/paddle-seed.mjs --amount=499
 *   PADDLE_API_KEY=pdl_sdbx_... node scripts/paddle-seed.mjs --check
 *
 * Opciones:
 *   --amount=499        Importe en unidades MENORES (499 = 4,99). Por defecto 499.
 *   --currency=USD      Moneda. Por defecto USD.
 *   --tax=standard      Categoría fiscal de Paddle. Por defecto "standard".
 *   --env=sandbox       sandbox | production. Por defecto sandbox.
 *   --check             No crea nada: solo dice si el pase ya existe.
 *   --dry-run           Muestra lo que crearía, sin llamar a la API de escritura.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * El precio declarado en `src/lib/payments/copy.ts`.
 *
 * Se lee del repositorio en lugar de repetirlo aquí para que `--check` pueda
 * comparar lo que la web anuncia con lo que Paddle cobra de verdad. Una web que
 * dice 9,99 mientras el overlay cobra 12,99 es una devolución seguida de una
 * reseña mala, y es un fallo que nadie nota hasta que lo nota un cliente.
 */
function declaredPrice() {
  const source = readFileSync(join(ROOT, "src/lib/payments/copy.ts"), "utf8");
  const amount = /amountMinorUnits:\s*(\d+)/.exec(source)?.[1];
  const currency = /currency:\s*"([A-Z]+)"/.exec(source)?.[1];
  const label = /label:\s*"([^"]+)"/.exec(source)?.[1];
  return { amount, currency, label };
}

const DECLARED = declaredPrice();

// ---------------------------------------------------------------- argumentos

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  }),
);

const AMOUNT = String(args.amount ?? DECLARED.amount ?? "999");
const CURRENCY = String(args.currency ?? DECLARED.currency ?? "USD").toUpperCase();
const TAX_CATEGORY = String(args.tax ?? "standard");
const ENV = String(args.env ?? process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox");
const CHECK_ONLY = Boolean(args.check);
const DRY_RUN = Boolean(args["dry-run"]);

const API =
  ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

/** Etiqueta que vincula el producto con este script entre ejecuciones. */
const MARKER = "premium_pass";

const API_KEY = process.env.PADDLE_API_KEY;
if (!API_KEY) {
  console.error(
    "Falta PADDLE_API_KEY.\n" +
      "  PADDLE_API_KEY=pdl_sdbx_... node scripts/paddle-seed.mjs",
  );
  process.exit(1);
}

if (!/^\d+$/.test(AMOUNT)) {
  console.error(
    `--amount debe ser un entero en unidades menores (499 = 4,99). Recibido: ${AMOUNT}`,
  );
  process.exit(1);
}

// ------------------------------------------------------------------ API HTTP

async function paddle(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body?.error?.detail ?? body?.error?.code ?? response.statusText;
    throw new Error(`${options.method ?? "GET"} ${path} → ${response.status}: ${detail}`);
  }

  return body;
}

/** Recorre la paginación de Paddle hasta agotar los resultados. */
async function listAll(path) {
  const items = [];
  let after = null;

  do {
    const query = new URLSearchParams({ per_page: "100", status: "active" });
    if (after) query.set("after", after);

    const page = await paddle(`${path}?${query}`);
    items.push(...(page.data ?? []));

    after = page.meta?.pagination?.has_more
      ? (page.data.at(-1)?.id ?? null)
      : null;
  } while (after);

  return items;
}

// ---------------------------------------------------------------------- main

async function main() {
  console.log(`Entorno: ${ENV} (${API})`);
  console.log(`Precio anunciado en la web: ${DECLARED.label} (${DECLARED.amount} ${DECLARED.currency})\n`);

  const products = await listAll("/products");

  // El vínculo estable es custom_data, no el nombre: renombrar el producto en
  // el dashboard no debe hacer que el script cree uno nuevo al lado.
  let product = products.find((item) => item.custom_data?.genecv === MARKER);

  if (!product) {
    if (CHECK_ONLY || DRY_RUN) {
      console.log("  producto  —  faltaría crear");
      console.log(
        "\nEl pase todavía no existe. Ejecuta sin --check para crearlo.",
      );
      process.exit(1);
    }

    product = await paddle("/products", {
      method: "POST",
      body: JSON.stringify({
        name: "GeneCV — Pase de descarga premium",
        description:
          "Desbloquea las diecisiete plantillas premium de GeneCV y da derecho " +
          "a una descarga en PDF sin marca de agua. El pase se consume al " +
          "descargar.",
        tax_category: TAX_CATEGORY,
        custom_data: { genecv: MARKER },
      }),
    }).then((r) => r.data);

    console.log(`  producto  ${product.id}  creado`);
  } else {
    console.log(`  producto  ${product.id}  ya existía`);
  }

  const prices = await listAll("/prices");
  let price = prices.find((item) => item.product_id === product.id);

  if (!price) {
    if (CHECK_ONLY || DRY_RUN) {
      console.log("  precio    —  faltaría crear");
      console.log("\nFalta el precio. Ejecuta sin --check para crearlo.");
      process.exit(1);
    }

    price = await paddle("/prices", {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        description: "Pase de descarga premium",
        // billing_cycle ausente = pago único. Con un ciclo sería suscripción,
        // que no es el modelo: el pase se gasta, no se renueva.
        unit_price: { amount: AMOUNT, currency_code: CURRENCY },
        quantity: { minimum: 1, maximum: 1 },
      }),
    }).then((r) => r.data);

    console.log(`  precio    ${price.id}  creado`);
  } else {
    console.log(`  precio    ${price.id}  ya existía`);
  }

  // ------------------------------------------------------------------- informe

  const configured = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PASS?.trim();

  console.log();

  // Lo que Paddle cobra de verdad, frente a lo que la web anuncia.
  const realAmount = price.unit_price?.amount;
  const realCurrency = price.unit_price?.currency_code;
  const priceMatches =
    realAmount === DECLARED.amount && realCurrency === DECLARED.currency;

  if (!priceMatches) {
    console.error(
      `AVISO: Paddle cobra ${realAmount} ${realCurrency} pero la web anuncia ` +
        `${DECLARED.label} (${DECLARED.amount} ${DECLARED.currency}).\n` +
        "  Ajusta PASS_PRICE en src/lib/payments/copy.ts o el precio en Paddle.\n",
    );
  }

  if (CHECK_ONLY || DRY_RUN) {
    if (!priceMatches) process.exit(1);

    if (configured && configured !== price.id) {
      console.error(
        `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS apunta a ${configured}, pero en ${ENV} ` +
          `el pase es ${price.id}.`,
      );
      process.exit(1);
    }

    console.log(
      configured
        ? "Todo listo: el pase existe y la variable de entorno coincide."
        : `El pase existe. Falta configurar NEXT_PUBLIC_PADDLE_PRICE_ID_PASS=${price.id}`,
    );
    process.exit(configured ? 0 : 1);
  }

  console.log("Añade esto a .env.local y a las variables de Vercel:\n");
  console.log(`NEXT_PUBLIC_PADDLE_PRICE_ID_PASS=${price.id}`);
  console.log(`NEXT_PUBLIC_PADDLE_ENV=${ENV}`);
  console.log(
    "\nRecuerda: son NEXT_PUBLIC_, se incrustan al compilar. Hay que redesplegar.",
  );
}

// Un fallo de la API es lo habitual cuando la clave o el entorno están mal:
// se muestra el motivo en una línea en lugar de un stack de Node.
main().catch((error) => {
  const message = error?.message ?? String(error);
  console.error(`\nError de Paddle: ${message}`);
  if (message.includes("403") || message.includes("401")) {
    console.error(
      `  Revisa que la clave sea del entorno correcto (estás usando ${ENV}) ` +
        "y que tenga permisos de lectura y escritura.",
    );
  }
  process.exit(1);
});
