/**
 * Genera los recursos del logo a partir de `public/logocv.png`.
 *
 * El original es un PNG de 1536x1024 sin canal alfa: el fondo es blanco opaco.
 * La barra de navegación es `bg-canvas/85` con desenfoque, así que un blanco
 * opaco se vería como un recuadro pegado encima. Hay que recortar el fondo.
 *
 * No sirve con "hacer transparente todo lo blanco": el interior del documento y
 * la marca de verificación TAMBIÉN son blancos, y quedarían agujereados. Lo que
 * se hace es un relleno por difusión desde los bordes, que solo alcanza el
 * blanco exterior conectado y deja intactos los blancos encerrados.
 *
 * Uso: node scripts/build-logo.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * El original vive fuera de `public/` para que no se sirva tal cual: pesa un
 * megabyte y nadie necesita descargarlo. Solo es la fuente de este script.
 */
const SOURCE = "assets/logocv.png";

/** El lockup se sirve como recurso estático. */
const PUBLIC_DIR = "public";

/**
 * Los iconos y la imagen de OpenGraph van en `src/app`, no en `public`: Next
 * los reconoce por convención de nombre de fichero y genera las etiquetas
 * `<link rel="icon">` y `og:image` solo por estar ahí.
 */
const APP_DIR = "src/app";

/**
 * El relleno se hace en dos pasadas con umbrales distintos.
 *
 * `WHITE` es el umbral estricto de la primera: solo blanco franco. `HALO` es el
 * de la segunda, que parte del fondo ya encontrado y se come el borde suavizado
 * y el ruido de compresión que quedan alrededor de las letras. Con una sola
 * pasada estricta, ese ruido de 230-234 corta la difusión y el fondo se queda
 * sin recortar; con una sola pasada permisiva, el relleno se cuela por los
 * bordes y agujerea el interior del documento.
 */
const WHITE = 234;
const HALO = 214;

/**
 * Lee los píxeles en crudo.
 *
 * Devuelve `channels` y se usa siempre para calcular los desplazamientos: dar
 * por hecho que son 3 hace que el recorrido se desplace un byte por píxel si la
 * imagen trae canal alfa, y entonces se leen colores de otra parte de la imagen.
 */
async function loadRgb(file) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}

/**
 * Marca el fondo exterior con un relleno por difusión desde los cuatro bordes.
 *
 * Devuelve un Uint8Array: 0 = trazo, 1 = fondo franco, 2 = borde suavizado.
 */
function floodFillBackground({ data, width, height, channels }) {
  const mask = new Uint8Array(width * height);

  const lightness = (i) => {
    const p = i * channels;
    return Math.min(data[p], data[p + 1], data[p + 2]);
  };

  /** Una pasada de difusión con su propio umbral y su propia marca. */
  function spread(seeds, threshold, stage) {
    const stack = [...seeds];

    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = y * width + x;
      if (mask[i] !== 0 || lightness(i) <= threshold) return;
      mask[i] = stage;
      stack.push(i);
    };

    for (const i of seeds) {
      if (mask[i] === 0 && lightness(i) > threshold) mask[i] = stage;
    }

    while (stack.length > 0) {
      const i = stack.pop();
      const x = i % width;
      const y = (i - x) / width;
      push(x - 1, y);
      push(x + 1, y);
      push(x, y - 1);
      push(x, y + 1);
    }
  }

  const border = [];
  for (let x = 0; x < width; x++) {
    border.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    border.push(y * width, y * width + width - 1);
  }

  spread(border, WHITE, 1);

  // Segunda pasada: parte de todo el fondo ya encontrado y avanza con el umbral
  // permisivo, de modo que solo alcanza lo que está pegado al fondo.
  const frontier = [];
  for (let i = 0; i < mask.length; i++) if (mask[i] === 1) frontier.push(i);
  spread(frontier, HALO, 2);

  return mask;
}

/**
 * Compone RGBA aplicando el alfa del relleno y recorta al contenido.
 *
 * El borde del relieve queda suavizado en el original, así que los píxeles casi
 * blancos que sobreviven al relleno reciben un alfa proporcional a lo oscuros
 * que sean. Sin esto se ve un halo blanco alrededor de las letras.
 */
function toRgba({ data, width, height, channels }, mask) {
  const rgba = Buffer.alloc(width * height * 4);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    const q = i * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    rgba[q] = r;
    rgba[q + 1] = g;
    rgba[q + 2] = b;

    if (mask[i] === 1) {
      rgba[q + 3] = 0;
      continue;
    }

    if (mask[i] === 2) {
      // Borde suavizado: el alfa sube según se oscurece el píxel, para que el
      // contorno no quede recortado a hachazos.
      const light = Math.min(r, g, b);
      const alpha = Math.round(((WHITE + 10 - light) * 255) / (WHITE + 10 - HALO));
      rgba[q + 3] = Math.max(0, Math.min(255, alpha));
      continue;
    }

    rgba[q + 3] = 255;

    // El recuadro se calcula solo con trazo franco: así una mota de ruido que
    // haya sobrevivido no estira el recorte hasta el borde de la imagen.
    if (Math.min(r, g, b) < 200) {
      const x = i % width;
      const y = (i - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return {
    rgba,
    width,
    height,
    box: { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
  };
}

/**
 * Encuentra dónde acaba el icono y empieza el texto: la primera columna vacía
 * lo bastante ancha después de que el contenido haya empezado. Así el recorte
 * del icono no depende de coordenadas escritas a mano.
 */
function findIconWidth({ rgba, width }, box) {
  const columnHasInk = (x) => {
    for (let y = box.top; y < box.top + box.height; y++) {
      if (rgba[(y * width + x) * 4 + 3] > 40) return true;
    }
    return false;
  };

  const minGap = Math.round(box.width * 0.02);
  let gap = 0;

  for (let x = box.left; x < box.left + box.width; x++) {
    if (columnHasInk(x)) {
      gap = 0;
      continue;
    }
    gap++;
    if (gap >= minGap) return x - gap - box.left + 1;
  }

  return box.width;
}

/**
 * Envuelve un PNG en un contenedor ICO.
 *
 * sharp no sabe escribir .ico, pero el formato admite una imagen PNG tal cual
 * dentro: basta la cabecera de 6 bytes más una entrada de directorio de 16.
 * Lo entienden todos los navegadores actuales.
 */
function icoFromPng(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo 1 = icono
  header.writeUInt16LE(1, 4); // una sola imagen

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho (0 significa 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
  entry.writeUInt8(0, 2); // sin paleta
  entry.writeUInt8(0, 3); // reservado
  entry.writeUInt16LE(1, 4); // planos
  entry.writeUInt16LE(32, 6); // bits por píxel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

/**
 * Filas con trazo dentro de un rango de columnas, en el recorte ya hecho.
 *
 * Sirve para localizar la banda del eslogan: en la zona del texto hay dos
 * bloques de filas con tinta —el logotipo y el eslogan— separados por un hueco.
 */
function inkRows(rgba, width, box, fromX, toX) {
  const rows = [];
  for (let y = 0; y < box.height; y++) {
    let ink = false;
    for (let x = fromX; x < toX && !ink; x++) {
      if (rgba[((y + box.top) * width + x + box.left) * 4 + 3] > 60) ink = true;
    }
    rows.push(ink);
  }
  return rows;
}

/**
 * Alto al que hay que cortar la zona de texto para dejar fuera el eslogan.
 *
 * Busca el último hueco de filas sin tinta y devuelve dónde empieza. Si no
 * encuentra ninguno, devuelve el alto completo y el lockup se queda como está.
 */
function taglineTop(rgba, width, box, fromX) {
  const rows = inkRows(rgba, width, box, fromX, box.width);

  let lastGapStart = -1;
  let gapStart = -1;

  for (let y = 0; y < rows.length; y++) {
    if (!rows[y]) {
      if (gapStart === -1) gapStart = y;
      continue;
    }
    // Solo cuenta como separación si el hueco es apreciable.
    if (gapStart !== -1 && y - gapStart >= Math.round(box.height * 0.04)) {
      lastGapStart = gapStart;
    }
    gapStart = -1;
  }

  return lastGapStart === -1 ? box.height : lastGapStart;
}

async function main() {
  const source = await loadRgb(SOURCE);
  const background = floodFillBackground(source);
  const composed = toRgba(source, background);
  const { box } = composed;

  console.log(`original ${source.width}x${source.height}`);
  console.log(`contenido ${box.width}x${box.height} en (${box.left}, ${box.top})`);

  const trimmed = sharp(composed.rgba, {
    raw: { width: composed.width, height: composed.height, channels: 4 },
  }).extract(box);

  const trimmedBuffer = await trimmed.png().toBuffer();

  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(APP_DIR, { recursive: true });

  // Lockup horizontal para la cabecera y el pie. 3x la altura con la que se
  // muestra (32px) sobra para pantallas de alta densidad.
  const lockupHeight = 96;
  const lockup = await sharp(trimmedBuffer)
    .resize({ height: lockupHeight, withoutEnlargement: false })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  await writeFile(path.join(PUBLIC_DIR, "logo-genecv.png"), lockup);

  const lockupMeta = await sharp(lockup).metadata();
  console.log(`lockup ${lockupMeta.width}x${lockupMeta.height}`);

  // Solo el icono, para favicon, iconos de aplicación y el lockup compacto.
  const iconWidth = findIconWidth(composed, box);
  console.log(`ancho del icono ${iconWidth}px de ${box.width}px`);

  // Lockup compacto: icono + logotipo, sin el eslogan. A la altura que se
  // muestra en la cabecera (32 px) el eslogan sería una mancha ilegible, así
  // que se recorta y se recompone el conjunto.
  const cut = taglineTop(composed.rgba, composed.width, box, iconWidth);
  console.log(`eslogan a partir de y=${cut} de ${box.height}`);

  if (cut < box.height) {
    const wordmark = await sharp(trimmedBuffer)
      .extract({
        left: iconWidth,
        top: 0,
        width: box.width - iconWidth,
        height: cut,
      })
      .trim({ threshold: 1 })
      .toBuffer();

    const iconPart = await sharp(trimmedBuffer)
      .extract({ left: 0, top: 0, width: iconWidth, height: box.height })
      .trim({ threshold: 1 })
      .toBuffer();

    const iconMeta = await sharp(iconPart).metadata();

    // El icono manda en la altura; el logotipo se escala a un 62 % de ella,
    // que es la proporción que ya tienen en el original.
    const height = iconMeta.height;
    const wordHeight = Math.round(height * 0.62);
    const wordResized = await sharp(wordmark)
      .resize({ height: wordHeight })
      .toBuffer();
    const wordResizedMeta = await sharp(wordResized).metadata();

    const gap = Math.round(height * 0.16);
    const totalWidth = iconMeta.width + gap + wordResizedMeta.width;

    const compact = await sharp({
      create: {
        width: totalWidth,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: iconPart, left: 0, top: 0 },
        {
          input: wordResized,
          left: iconMeta.width + gap,
          top: Math.round((height - wordResizedMeta.height) / 2),
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    await writeFile(
      path.join(PUBLIC_DIR, "logo-genecv-compact.png"),
      await sharp(compact).resize({ height: 96 }).png({ compressionLevel: 9 }).toBuffer(),
    );

    const compactMeta = await sharp(compact).resize({ height: 96 }).metadata();
    console.log(`compacto ${compactMeta.width}x${compactMeta.height}`);
  }

  const iconSquare = Math.max(iconWidth, box.height);
  const iconBuffer = await sharp(trimmedBuffer)
    .extract({ left: 0, top: 0, width: iconWidth, height: box.height })
    // Cuadrado, centrado y con algo de aire, que es como lo espera un favicon.
    .resize({
      width: Math.round(iconSquare * 0.86),
      height: Math.round(iconSquare * 0.86),
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: Math.round(iconSquare * 0.07),
      bottom: Math.round(iconSquare * 0.07),
      left: Math.round(iconSquare * 0.07),
      right: Math.round(iconSquare * 0.07),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Los iconos van sobre una placa blanca con las esquinas redondeadas, no
  // sobre transparencia. Dos razones: iOS compone los apple-touch-icon sobre
  // negro, y el relleno deja hueco el interior del documento, que sobre un
  // fondo oscuro se leería como un contorno vacío.
  const PLATE = 0.78; // proporción del lado que ocupa el dibujo

  /** Icono cuadrado sobre placa blanca, del tamaño pedido. */
  async function plateIcon(size, cornerRatio) {
    const inner = Math.round(size * PLATE);
    const radius = Math.round(size * cornerRatio);

    const plate = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
        `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#ffffff"/>` +
        `</svg>`,
    );

    const drawing = await sharp(iconBuffer)
      .resize(inner, inner, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    return sharp(plate)
      .composite([{ input: drawing, gravity: "centre" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // apple-icon va sin esquinas redondeadas: iOS aplica su propia máscara y una
  // esquina ya recortada se vería doblemente redondeada.
  await writeFile(path.join(APP_DIR, "icon.png"), await plateIcon(512, 0.22));
  await writeFile(path.join(APP_DIR, "apple-icon.png"), await plateIcon(180, 0));

  // favicon.ico para los clientes que siguen pidiendo /favicon.ico a pelo.
  await writeFile(
    path.join(APP_DIR, "favicon.ico"),
    icoFromPng(await plateIcon(32, 0.16), 32),
  );

  // Imagen de OpenGraph: al llamarse así, Next la usa como og:image y
  // twitter:image en todas las rutas sin tener que declararla en el metadata.
  const OG = { width: 1200, height: 630 };
  const ogLogo = await sharp(trimmedBuffer)
    .resize({ width: Math.round(OG.width * 0.62) })
    .toBuffer();

  await writeFile(
    path.join(APP_DIR, "opengraph-image.png"),
    await sharp({
      create: {
        width: OG.width,
        height: OG.height,
        channels: 4,
        background: { r: 0xf7, g: 0xf7, b: 0xf7, alpha: 1 },
      },
    })
      .composite([
        { input: ogLogo, gravity: "centre" },
        {
          // Franja inferior con el color primario, para que la tarjeta no sea
          // un rectángulo blanco sin identidad.
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="14">` +
              `<rect width="${OG.width}" height="14" fill="#234D68"/></svg>`,
          ),
          gravity: "south",
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  console.log("listo");
}

await main();
