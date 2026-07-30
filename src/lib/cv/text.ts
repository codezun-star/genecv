/**
 * Calidad del texto que acaba en el PDF.
 *
 * Este módulo centraliza toda la normalización de texto del CV. Lo consume
 * `lib/cv/view.ts`, que alimenta a la vez la vista previa y el PDF, así que lo
 * que el usuario ve en la vista previa es exactamente lo que se exporta.
 *
 * --- Por qué hace falta filtrar caracteres ---------------------------------
 *
 * El PDF se compone con Helvetica, una de las 14 fuentes estándar del formato.
 * No se registra ninguna fuente propia (no hay `Font.register` en el proyecto),
 * de modo que el texto se codifica en WinAnsi, es decir CP1252. Lo que no cabe
 * en ese repertorio no desaparece: se reinterpreta como otro byte y sale
 * basura. Comprobado sobre un PDF real generado por el propio proyecto:
 *
 *   "Hola [emoji] mundo [emoji] fin [check]" -> "Hola   = mundo   =€ fin"
 *   "A [flecha] B [checks] [estrella]"       -> "A ’ B"
 *   "[mayor igual] [aprox] [infinito]"       -> "e d H `"
 *   "[cirilico] [chino]"                     -> "@825B -‡"
 *   "a[zero-width]b[BOM]c"                   -> "a b cÿd"
 *
 * En cambio sí sobreviven, y por tanto se conservan tal cual: acentos y ñ,
 * comillas tipográficas, guiones en/em, elipsis, y los símbolos € £ © ® ™ ° ±
 * ½ • § µ.
 *
 * Por eso la regla no es "quitar emojis" sino la más precisa y estable:
 * conservar lo que CP1252 puede representar, traducir un puñado de símbolos
 * frecuentes a su equivalente ASCII, y eliminar el resto.
 */

/* ------------------------------------------------------------------ CP1252 */

/**
 * Los 27 caracteres del bloque 0x80-0x9F de CP1252. Son los que hacen que las
 * comillas tipográficas y el euro funcionen aunque estén fuera de Latin-1.
 */
const CP1252_HIGH = new Set(
  [
    0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
    0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
    0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
  ].map((cp) => String.fromCodePoint(cp)),
);

/** True si Helvetica puede representar ese carácter en el PDF. */
function isPdfSafe(char: string): boolean {
  const cp = char.codePointAt(0);
  if (cp === undefined) return false;

  if (cp === 0x0a) return true; // salto de línea
  if (cp >= 0x20 && cp <= 0x7e) return true; // ASCII imprimible
  if (cp >= 0xa0 && cp <= 0xff) return true; // Latin-1 suplementario

  return CP1252_HIGH.has(char);
}

/**
 * Símbolos frecuentes fuera de CP1252 que conviene traducir en lugar de
 * borrar, porque aportan significado. El resto (emojis, alfabetos no latinos,
 * decoración) se elimina.
 */
const TRANSLITERATIONS: Record<string, string> = {
  // Flechas: habituales en logros pegados desde otras herramientas.
  "→": "->", // →
  "⇒": "->", // ⇒
  "➔": "->", // ➔
  "➜": "->", // ➜
  "⟶": "->", // ⟶
  "←": "<-", // ←
  "⇐": "<-", // ⇐
  "↔": "<->", // ↔

  // Viñetas: se unifican en "•" (•), que sí está en CP1252, para no dejar
  // los elementos de una lista pegados unos a otros.
  "▪": "•", // ▪
  "▫": "•", // ▫
  "●": "•", // ●
  "○": "•", // ○
  "◦": "•", // ◦
  "‣": "•", // ‣
  "⁃": "•", // ⁃

  // Comparadores y matemáticos.
  "≥": ">=", // ≥
  "≤": "<=", // ≤
  "≈": "~", // ≈
  "≠": "!=", // ≠
  "−": "-", // − signo menos, distinto del guion ASCII
  "‑": "-", // ‑ guion no separable
  "⁄": "/", // ⁄

  // Fracciones que no están en CP1252 (½ ¼ ¾ sí lo están).
  "⅓": "1/3", // ⅓
  "⅔": "2/3", // ⅔
  "⅛": "1/8", // ⅛

  // Tipografía.
  "′": "'", // ′
  "″": '"', // ″
  "№": "No.", // №
  "℃": "°C", // ℃
  "℉": "°F", // ℉
};

/**
 * Caracteres invisibles: no se ven, pero rompen el PDF y el recuento.
 *
 * Se construye desde una cadena de escapes en lugar de escribir los caracteres
 * dentro de la expresión regular. Un literal invisible en el código fuente es
 * ilegible en una revisión y cualquier herramienta que reformatee el fichero
 * puede corromperlo sin que se note.
 */
const INVISIBLE = new RegExp(
  "[" +
    "\\u200b-\\u200f" + // espacios de ancho cero y marcas de dirección
    "\\u00ad" + // guion suave
    "\\u2060" + // word joiner
    "\\u202a-\\u202e" + // controles de dirección
    "\\ufeff" + // BOM
    "]",
  "g",
);

/**
 * Espacios que no existen en CP1252 y hay que convertir en un espacio normal.
 *
 * Sin este paso se eliminarían como cualquier otro carácter no soportado y las
 * palabras quedarían pegadas: un tabulador o un espacio fino entre nombre y
 * apellido daría "NombreApellido". Aparecen constantemente al pegar desde Word,
 * desde un PDF o desde una página web.
 */
const SPACE_LIKE = new RegExp(
  "[" +
    "\\t" + // tabulador
    "\\u1680" + // ogham
    "\\u2000-\\u200a" + // de en-quad a hair space
    "\\u202f" + // espacio fino no separable
    "\\u205f" + // espacio matemático medio
    "\\u3000" + // espacio ideográfico
    "]",
  "g",
);

/** Separadores de línea que hay que traducir a un salto normal. */
const LINE_LIKE = new RegExp(
  "\\r\\n?|[" +
    "\\u2028" + // separador de línea
    "\\u2029" + // separador de párrafo
    "\\u000b\\u000c" + // tabulador vertical y salto de página
    "]",
  "g",
);

/* ------------------------------------------------- normalización principal */

export interface SanitizeResult {
  text: string;
  /** True si se eliminó algún carácter que la fuente no soporta. */
  removed: boolean;
}

/** Deja el texto listo para el PDF: `prepare` y luego el filtro CP1252. */
/**
 * Paso previo común: unifica la representación del texto sin descartar nada.
 *
 * NFC hace que una "á" escrita como "a" + tilde combinante se convierta en un
 * único carácter que CP1252 sí conoce; sin él, el texto copiado desde macOS
 * perdería los acentos. Los espacios y saltos exóticos se traducen ANTES del
 * filtro: si llegasen a él se borrarían y pegarían las palabras entre sí.
 */
function prepare(value: string): string {
  return value
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .replace(SPACE_LIKE, " ")
    .replace(LINE_LIKE, "\n");
}

function sanitize(value: string): SanitizeResult {
  let removed = false;

  const normalised = prepare(value);

  let out = "";
  // Se itera por puntos de código, no por unidades UTF-16: así un emoji
  // formado por un par subrogado se trata como un solo carácter y no deja
  // media pareja huérfana.
  for (const char of normalised) {
    if (isPdfSafe(char)) {
      out += char;
      continue;
    }

    const replacement = TRANSLITERATIONS[char];
    if (replacement !== undefined) {
      out += replacement;
      continue;
    }

    // Emoji, alfabetos no latinos, decoración: fuera.
    removed = true;
  }

  return { text: out, removed };
}

/**
 * Recompone los huecos que deja la eliminación de caracteres.
 *
 * Quitar un emoji suelto deja dobles espacios y signos huérfanos: "Logro X."
 * se quedaría como "Logro ." con un espacio antes del punto.
 *
 * Va antes de `fixSentenceSpacing` a propósito: "ventas X.Áreas" queda como
 * "ventas .Áreas" tras el filtro, y con ese espacio delante del punto la regex
 * del espaciado no reconocería la frase.
 */
function tidyGaps(value: string): string {
  return (
    value
      // Espacio sobrante antes de puntuación de cierre. El "%" queda fuera a
      // propósito: en español lo correcto es "40 %" con espacio, y así lo
      // escriben los textos de ejemplo del propio editor.
      .replace(/[ \t]+([,.;:!?)\]}»])/g, "$1")
      // Espacio sobrante tras puntuación de apertura.
      .replace(/([(\[{«¿¡])[ \t]+/g, "$1")
      // Viñeta que quedó pegada a un signo de puntuación.
      .replace(/•[ \t]*([,.;:])/g, "$1")
      // Viñeta al final de línea, ya sin contenido detrás.
      .replace(/[ \t]*•[ \t]*$/gm, "")
  );
}

/* ------------------------------------------- espacio tras punto y seguido */

/**
 * Marcador para apartar URLs y correos mientras se corrige el espaciado.
 *
 * Se genera con `fromCharCode` en lugar de incrustar el carácter de control
 * literal, por el mismo motivo que `INVISIBLE`.
 */
const SENTINEL = String.fromCharCode(1);

/**
 * Tramos que la corrección de espaciado no debe tocar: URLs y correos. Se
 * apartan antes de aplicar la regex y se restauran después, que es más fiable
 * que intentar excluirlos dentro del propio patrón.
 */
const PROTECTED = /((?:https?:\/\/|www\.)[^\s]+|[^\s@]+@[^\s@]+\.[^\s@]+)/gi;

/**
 * Inserta el espacio que falta tras un punto, punto y coma o dos puntos cuando
 * le sigue directamente una mayúscula: "automatización.Áreas" pasa a ser
 * "automatización. Áreas".
 *
 * Casos que deja en paz a propósito:
 *
 * - Decimales y versiones: "v2.5Beta" no encaja, porque tras el punto hay un
 *   dígito y el patrón exige una mayúscula.
 * - Siglas e iniciales: "S.A.", "EE.UU.", "Ph.D". Se descartan porque exigimos
 *   tres letras o más antes del separador —o bien una cifra, para que
 *   "un 40%.Nuevas métricas" también se corrija sin abrir la puerta a las
 *   siglas de dos letras.
 * - Nombres técnicos: "ASP.NET", "Node.JS", "Adobe.XD". Se descartan porque
 *   exigimos que tras la mayúscula venga una minúscula, y ahí vienen más
 *   mayúsculas. Sin esta condición "ASP.NET" acababa como "ASP. NET", que es
 *   justo el tipo de destrozo que este arreglo debe evitar: aparece como
 *   competencia en muchísimos CV.
 * - URLs y correos: se apartan con `PROTECTED`, así "www.Example.com" no se
 *   convierte en "www. Example.com".
 * - Horas y proporciones: "10:30" no encaja (dígito) y "A:B" tampoco (una sola
 *   letra delante).
 *
 * El precio de ser prudente es dejar sin corregir "Ventas.CRM nuevo", porque no
 * hay forma de distinguirlo de "ASP.NET" sin un diccionario. Preferimos no
 * tocar una frase correcta antes que partir el nombre de una tecnología.
 */
function fixSentenceSpacing(value: string): string {
  const protectedParts: string[] = [];

  // El marcador es un carácter de control que `sanitize` ya eliminó del texto
  // antes de llegar aquí, así que no puede colisionar con nada escrito por el
  // usuario. Un marcador tipo " 0 " sí colisionaría: al restaurarlo se
  // comerían números aislados del texto ("de 3 años").
  const masked = value.replace(PROTECTED, (match) => {
    protectedParts.push(match);
    return `${SENTINEL}${protectedParts.length - 1}${SENTINEL}`;
  });

  // \p{Lu} y \p{Ll} cubren las mayúsculas y minúsculas acentuadas sin tener que
  // enumerarlas.
  const fixed = masked.replace(
    /(\p{L}{3,}|[\d%])([.;:])(\p{Lu}\p{Ll})/gu,
    "$1$2 $3",
  );

  return fixed.replace(
    new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, "g"),
    (whole, index) => protectedParts[Number(index)] ?? whole,
  );
}

/* ------------------------------------------------------------ API pública */

/** Colapsa los espacios y recorta los extremos. */
function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Igual, pero conservando los saltos de párrafo. */
function collapseSpacesMultiline(value: string): string {
  return value
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Normaliza un campo de una sola línea (nombre, empresa, titular...).
 *
 * Devuelve también si se descartó algo, para poder avisar al usuario.
 */
export function normaliseLine(value: string | undefined | null): SanitizeResult {
  if (!value) return { text: "", removed: false };

  const { text, removed } = sanitize(value);
  return { text: collapseSpaces(fixSentenceSpacing(tidyGaps(text))), removed };
}

/** Igual que `normaliseLine`, pero para campos con párrafos. */
export function normaliseParagraph(
  value: string | undefined | null,
): SanitizeResult {
  if (!value) return { text: "", removed: false };

  const { text, removed } = sanitize(value);
  return {
    text: collapseSpacesMultiline(fixSentenceSpacing(tidyGaps(text))),
    removed,
  };
}

/**
 * Limpieza para el propio campo del editor, al perder el foco.
 *
 * Deliberadamente NO elimina los caracteres que la fuente no soporta. Borrarle
 * a alguien lo que acaba de escribir, sin posibilidad de deshacerlo, es peor que
 * el problema que resuelve: el emoji se descarta al renderizar y el campo avisa
 * de que va a pasar. Aquí solo se hacen los dos arreglos inocuos —espacios y
 * punto y seguido—, que son los que conviene que el usuario vea aplicados para
 * que el borrador guardado coincida con la vista previa.
 *
 * Tampoco pasa por `tidyGaps`: ese paso repara los huecos que deja el filtro de
 * caracteres, y aquí no se filtra nada.
 */
export function tidyEditorText(value: string, multiline = false): string {
  const spaced = fixSentenceSpacing(prepare(value));
  return multiline ? collapseSpacesMultiline(spaced) : collapseSpaces(spaced);
}

/**
 * Solo comprueba, sin transformar. Lo usa la interfaz para decidir si muestra
 * el aviso junto al campo, sin pagar el coste de normalizar dos veces.
 */
export function hasUnsupportedChars(value: string | undefined | null): boolean {
  if (!value) return false;

  const normalised = value.normalize("NFC").replace(INVISIBLE, "");
  for (const char of normalised) {
    if (!isPdfSafe(char) && TRANSLITERATIONS[char] === undefined) return true;
  }
  return false;
}
