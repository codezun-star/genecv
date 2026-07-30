/**
 * Captura las imágenes que enseña el diálogo de instalación.
 *
 * Un manifiesto sin `screenshots` se instala igual, pero el navegador lo ofrece
 * con una sola línea de texto; con ellas enseña una ficha con imágenes, que es
 * la misma diferencia que hay entre una ficha de tienda con capturas y otra
 * sin. Tienen que ser capturas reales, así que esto levanta el servidor de
 * producción y conduce un navegador de verdad por encima.
 *
 * Playwright no es dependencia del proyecto: esto se ejecuta a mano cuando
 * cambia el diseño, no en cada instalación. Uso, con la aplicación construida:
 *
 *     npm run build
 *     npm i --no-save playwright && npx playwright install chromium
 *     node scripts/screenshots.mjs
 *
 * `CHROME_PATH` sirve para reutilizar un Chromium ya instalado en el sistema y
 * ahorrarse la descarga.
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

import { chromium } from "playwright";

const OUT = "public/screenshots";
const PORT = 3123;

/**
 * Las capturas, en los dos formatos que declara el manifiesto: el navegador
 * elige `wide` o `narrow` según el dispositivo en el que ofrece instalar.
 */
const SHOTS = [
  { name: "movil-inicio", path: "/", width: 390, height: 844 },
  { name: "movil-plantillas", path: "/plantillas", width: 390, height: 844 },
  { name: "escritorio-inicio", path: "/", width: 1280, height: 800 },
  { name: "escritorio-editor", path: "/crear", width: 1280, height: 800 },
];

/** Espera a que el servidor responda, en lugar de dormir a ciegas. */
async function esperarServidor(url, intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Todavía no escucha.
    }
    await sleep(500);
  }
  throw new Error(`el servidor no respondió en ${url}`);
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  detached: true,
});

try {
  await esperarServidor(`http://127.0.0.1:${PORT}/`);

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
  });

  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 1,
      });
      await page.goto(`http://127.0.0.1:${PORT}${shot.path}`, {
        waitUntil: "networkidle",
      });
      // La portada y el editor entran con animación; se captura ya asentado.
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${OUT}/${shot.name}.png` });
      await page.close();
      console.log(`${shot.name}.png — ${shot.width}x${shot.height}`);
    }
  } finally {
    await browser.close();
  }
} finally {
  // El proceso de Next deja hijos: se mata el grupo entero.
  process.kill(-server.pid, "SIGTERM");
}
