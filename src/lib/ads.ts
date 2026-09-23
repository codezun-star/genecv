/**
 * Inventario publicitario.
 *
 * Una sola fuente de verdad para las claves, los tamaños y dónde se usa cada
 * unidad. Los componentes de `src/components/ads` no llevan ninguna clave
 * dentro: cambiar una unidad, retirarla o mover un formato a otro hueco se
 * hace aquí y se aplica en todo el sitio.
 *
 * Los banners son de la red de `highrevenueformat.com`, que se sirve con un
 * `document.write` dentro de un `invoke.js` y lee sus opciones de una variable
 * global llamada `atOptions`. Las dos cosas son incompatibles con una SPA: el
 * `document.write` tardío borra el documento entero y la global es única, así
 * que dos banners en la misma página se pisarían las opciones. Por eso cada
 * unidad se monta dentro de su propio iframe (`ad-banner.tsx`), donde la
 * global es suya y el `document.write` escribe en su propio documento.
 */

export interface AdUnit {
  /** Identificador de la unidad en el panel de la red. */
  key: string;
  width: number;
  height: number;
}

/** Las seis unidades dadas de alta, con su tamaño IAB. */
export const AD_UNITS = {
  /** 728x90 — la franja clásica de escritorio. */
  leaderboard: { key: "ff117b1a5d4f5baa98f6fb1e58629870", width: 728, height: 90 },
  /** 468x60 — la misma franja cuando 728 no cabe. */
  halfBanner: { key: "0b8e0f2cf97638a07181d55b4e6f9b8c", width: 468, height: 60 },
  /** 320x50 — franja de móvil. */
  mobileBanner: { key: "a0bd6788a57bdf735f371aae53c0d236", width: 320, height: 50 },
  /** 300x250 — el rectángulo, el que mejor encaja dentro del contenido. */
  rectangle: { key: "76a0a8dcb002065ae64485f0c0ed353d", width: 300, height: 250 },
  /** 160x600 — rascacielos de barra lateral. */
  skyscraper: { key: "0c2a10b8d7247986c334e780e43214f1", width: 160, height: 600 },
  /** 160x300 — medio rascacielos, para barras laterales estrechas. */
  halfTower: { key: "18bf72b45d580e172faa29d184e317dd", width: 160, height: 300 },
} as const satisfies Record<string, AdUnit>;

export type AdUnitId = keyof typeof AD_UNITS;

/**
 * Hueco = la lista de unidades que puede pintar, de la que más renta a la que
 * menos. Se elige la primera que **cabe en la columna**, no en la ventana:
 * ventana y columna no son lo mismo y confundirlas es lo que mete un 728x90
 * en la columna de 512 px del editor y le recorta un tercio. La anchura de la
 * caja se mide con un `ResizeObserver` en `ad-banner.tsx`.
 *
 * Se pinta **una** y solo una: dibujar las tres y esconder dos con CSS
 * dispararía tres peticiones y contaría dos impresiones que nadie llega a ver.
 * Por lo mismo, una caja escondida —anchura medida de 0— no pide nada.
 *
 * Si no cabe ninguna se usa la última, la más estrecha, y el iframe se recorta
 * un poco: pasa por debajo de 332 px de ventana, y ahí es mejor un anuncio
 * algo cortado que ninguno.
 */
export interface AdRule {
  unit: AdUnitId;
  /**
   * Alto mínimo de ventana. Solo lo llevan los formatos altos: un rascacielos
   * de 600 px fijo en una pantalla de portátil de 768 px no cabe entre la
   * barra superior y el borde inferior, y se quedaría cortado siempre.
   */
  minViewportHeight?: number;
}

export const AD_PLACEMENTS = {
  banner: [
    { unit: "leaderboard" },
    { unit: "halfBanner" },
    { unit: "mobileBanner" },
  ],
  block: [{ unit: "rectangle" }],
  sidebar: [{ unit: "rectangle" }, { unit: "halfTower" }],
  tower: [
    { unit: "skyscraper", minViewportHeight: 760 },
    { unit: "halfTower" },
  ],
} as const satisfies Record<string, readonly AdRule[]>;

export type AdPlacementId = keyof typeof AD_PLACEMENTS;

/**
 * La caja del anuncio: reserva su altura antes de que cargue.
 *
 * La unidad no se sabe hasta medir en el cliente, así que sin esta caja el
 * contenido daría un salto al aparecer. Los cortes son los de un `Container`
 * a lo ancho de la página; en columnas más estrechas la medida real manda y
 * ajusta el alto en cuanto monta.
 *
 * La franja se come además el `px-4` del `Container` por debajo de 640 px: un
 * móvil de 320 px deja 288 útiles y el creativo más estrecho mide 320, así
 * que sin esto se le recortaría el borde derecho. Da por supuesto —como todos
 * los usos de hoy— que la franja cuelga de un `Container`, que es de donde
 * salen esos 16 px de cada lado.
 */
export const AD_RESERVE: Record<AdPlacementId, string> = {
  banner: "-mx-4 h-[50px] sm:mx-0 min-[540px]:h-[60px] min-[850px]:h-[90px]",
  block: "h-[250px]",
  sidebar: "h-[250px]",
  tower: "h-[600px]",
};

/**
 * Anchuras en las que no hay columna donde meter el hueco. Esconderlo aquí no
 * es solo cosmético: sin caja no hay anchura que medir, y sin anchura no se
 * pide anuncio.
 */
export const AD_WRAPPER: Record<AdPlacementId, string> = {
  banner: "",
  block: "",
  sidebar: "hidden lg:block",
  tower: "hidden xl:block",
};

/**
 * La unidad que toca para una caja de `boxWidth` píxeles, o `null` si la caja
 * está escondida y no hay nada que pedir.
 */
export function chooseAdUnit(
  placement: AdPlacementId,
  boxWidth: number,
  viewportHeight: number,
): AdUnitId | null {
  if (boxWidth <= 0) return null;

  const rules: readonly AdRule[] = AD_PLACEMENTS[placement];
  const eligible = rules.filter(
    (rule) => !rule.minViewportHeight || viewportHeight >= rule.minViewportHeight,
  );
  if (eligible.length === 0) return null;

  const fits = eligible.find((rule) => AD_UNITS[rule.unit].width <= boxWidth);
  return (fits ?? eligible[eligible.length - 1]).unit;
}

/**
 * Banner nativo: se camufla con el contenido, así que rinde bastante más que
 * un rectángulo, pero su script escribe siempre dentro de un `id` fijo. Eso lo
 * limita a **uno por página**; dos `<NativeAd />` a la vez dejarían un `id`
 * duplicado y solo se rellenaría el primero.
 */
export const NATIVE_AD = {
  src: "https://pl31073479.profitableratecpmnetwork.com/0f8b96eac4eb0782894f265a18e6eec1/invoke.js",
  containerId: "container-0f8b96eac4eb0782894f265a18e6eec1",
} as const;

/**
 * Barra social: el formato flotante de la red, que se pinta él solo por encima
 * de la página. Va una vez en el layout raíz y cubre todas las rutas; por eso
 * no hay además un banner fijo propio abajo, que se solaparía con este.
 */
export const SOCIAL_BAR_SRC =
  "https://pl31073480.profitableratecpmnetwork.com/9c/70/70/9c7070b82b87c522a73a696e4d9a930e.js";

/**
 * Unidad suelta: un `<script>` sin contenedor ni tamaño, de la misma familia
 * que la barra social —la red decide ella dónde y cuándo se pinta—. Por eso no
 * está en `AD_UNITS`: aquí no hay caja que medir ni alto que reservar.
 *
 * `skipRoutes` la deja fuera del editor, y es a propósito: es el único punto
 * del sitio donde alguien está trabajando —escribiendo su CV y generando el
 * PDF en su propio navegador— y un formato que se pinta por encima de la
 * página ahí estorba de verdad. Son prefijos de ruta; los compara
 * `in-page-ad.tsx` contra `usePathname()`.
 */
export const IN_PAGE_AD = {
  src: "https://pl31475927.profitableratecpmnetwork.com/f5/56/f6/f556f6116702d68dc3a9fbbecdea07c1.js",
  skipRoutes: ["/crear"],
} as const;
