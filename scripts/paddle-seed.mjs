#!/usr/bin/env node
/**
 * Crea en Paddle un producto y un precio por cada plantilla premium, y escupe
 * el bloque listo para pegar en `src/lib/payments/catalog.ts`.
 *
 * Hacerlo a mano son 34 formularios y 17 ids que copiar sin equivocarse; esto
 * lo deja en un comando. Es idempotente: marca cada producto con
 * `custom_data.template_id`, así que volver a ejecutarlo no duplica nada —
 * reutiliza lo que ya exista y solo crea lo que falte.
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
 *   --check             No crea nada: solo lista qué existe y qué falta.
 *   --dry-run           Muestra lo que crearía, sin llamar a la API de escritura.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------- argumentos

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  }),
);

const AMOUNT = String(args.amount ?? "499");
const CURRENCY = String(args.currency ?? "USD").toUpperCase();
const TAX_CATEGORY = String(args.tax ?? "standard");
const ENV = String(args.env ?? process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox");
const CHECK_ONLY = Boolean(args.check);
const DRY_RUN = Boolean(args["dry-run"]);

const API =
  ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

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

// ------------------------------------------------- plantillas premium del repo

/**
 * Se leen del propio catálogo en lugar de duplicar la lista aquí: si mañana se
 * añade una plantilla premium, este script la recoge sin tocarlo.
 */
function readPremiumTemplates() {
  const source = readFileSync(join(ROOT, "src/lib/cv/templates.ts"), "utf8");
  const pattern =
    /id:\s*"([a-z-]+)",\s*\n\s*name:\s*"([^"]+)",[\s\S]*?isPremium:\s*(true|false),/g;

  const out = [];
  let match;
  while ((match = pattern.exec(source)) !== null) {
    if (match[3] === "true") out.push({ id: match[1], name: match[2] });
  }
  return out;
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
      ? page.data.at(-1)?.id ?? null
      : null;
  } while (after);

  return items;
}

// ---------------------------------------------------------------------- main

async function main() {
  const templates = readPremiumTemplates();
  console.log(`Entorno: ${ENV} (${API})`);
  console.log(`Plantillas premium en el repo: ${templates.length}\n`);

  const existingProducts = await listAll("/products");
  const existingPrices = await listAll("/prices");

  // El vínculo estable es custom_data.template_id, no el nombre: renombrar un
  // producto en el dashboard no debe romper el emparejamiento.
  const productByTemplate = new Map();
  for (const product of existingProducts) {
    const templateId = product.custom_data?.template_id;
    if (templateId) productByTemplate.set(templateId, product);
  }

  const priceByProduct = new Map();
  for (const price of existingPrices) {
    if (!priceByProduct.has(price.product_id)) {
      priceByProduct.set(price.product_id, price);
    }
  }

  const results = [];

  for (const template of templates) {
    let product = productByTemplate.get(template.id);
    let created = false;

    if (!product) {
      if (CHECK_ONLY || DRY_RUN) {
        results.push({ ...template, priceId: null, action: "faltaría crear" });
        continue;
      }

      product = await paddle("/products", {
        method: "POST",
        body: JSON.stringify({
          name: `GeneCV — Plantilla ${template.name}`,
          description:
            `Descarga en PDF de tu currículum con la plantilla ${template.name}, ` +
            `sin marca de agua. Da derecho a una descarga.`,
          tax_category: TAX_CATEGORY,
          custom_data: { template_id: template.id },
        }),
      }).then((r) => r.data);

      created = true;
    }

    let price = priceByProduct.get(product.id);

    if (!price) {
      if (CHECK_ONLY || DRY_RUN) {
        results.push({
          ...template,
          priceId: null,
          action: created ? "producto creado, falta precio" : "falta precio",
        });
        continue;
      }

      price = await paddle("/prices", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          description: `Descarga PDF — ${template.name}`,
          // billing_cycle ausente = pago único. Con un ciclo sería suscripción,
          // que no es el modelo: se cobra una descarga concreta.
          unit_price: { amount: AMOUNT, currency_code: CURRENCY },
          quantity: { minimum: 1, maximum: 1 },
        }),
      }).then((r) => r.data);
    }

    results.push({
      ...template,
      priceId: price.id,
      action: created ? "creado" : "ya existía",
    });
  }

  // ------------------------------------------------------------------- informe

  const width = Math.max(...templates.map((t) => t.id.length));
  for (const row of results) {
    const id = row.id.padEnd(width);
    console.log(`  ${id}  ${row.priceId ?? "—".padEnd(30)}  ${row.action}`);
  }

  const missing = results.filter((r) => !r.priceId);
  console.log();

  if (CHECK_ONLY || DRY_RUN) {
    console.log(
      missing.length === 0
        ? "Todo listo: cada plantilla premium tiene producto y precio."
        : `Faltan ${missing.length} de ${templates.length}. Ejecuta sin --check para crearlas.`,
    );
    process.exit(missing.length === 0 ? 0 : 1);
  }

  if (missing.length > 0) {
    console.error(`No se pudo completar ${missing.length} plantilla(s).`);
    process.exit(1);
  }

  const constName =
    ENV === "production" ? "PRODUCTION_PRICE_IDS" : "SANDBOX_PRICE_IDS";

  console.log(
    `Pega esto en src/lib/payments/catalog.ts, sustituyendo ${constName}:\n`,
  );
  console.log(`const ${constName}: Record<string, string> = {`);
  for (const row of results) {
    console.log(`  ${row.id}: "${row.priceId}",`);
  }
  console.log("};");
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
