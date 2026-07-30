import type { Metadata } from "next";

export const siteConfig = {
  name: "GeneCV",
  domain: "genecv.codezun.com",
  url: "https://genecv.codezun.com",
  tagline: "Crea un CV profesional en minutos, gratis",
  description:
    "Generador de currículums gratuito y universal. Plantillas compatibles con ATS, formatos adaptados a Europa, Latinoamérica y el mundo anglosajón, vista previa en tiempo real y exportación a PDF.",
  locale: "es_ES",
  lang: "es",
  twitter: "@codezun",

  /**
   * Recursos de marca. Los genera `scripts/build-logo.mjs` a partir de
   * `assets/logocv.png`; si cambian de nombre, se cambian aquí y ya.
   *
   * `logo` es el lockup completo (con eslogan), que es el que tiene sentido en
   * los datos estructurados. La interfaz usa la versión compacta, porque el
   * eslogan no se lee a 32 px de alto.
   */
  logo: "/logo-genecv.png",
  logoCompact: "/logo-genecv-compact.png",
} as const;

/** URL absoluta de un recurso del sitio; los datos estructurados la exigen. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

/** Organización emisora, reutilizada por los datos estructurados. */
export const publisherJsonLd = {
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(siteConfig.logo),
  },
} as const;

/**
 * Identidad del sitio, para la portada.
 *
 * `WebSite` es de donde Google saca el nombre que rotula el resultado. Sin este
 * nodo, Search cae al dominio registrable y todos los subdominios aparecen
 * como «codezun.com», como si fueran secciones de otro sitio en vez de
 * productos con nombre propio. `url` apunta a la raíz de ESTE subdominio, que
 * es el sitio al que se le está poniendo nombre.
 *
 * Va solo en la portada: es donde Search lo lee.
 */
export const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  alternateName: `${siteConfig.name} — Generador de CV`,
  url: `${siteConfig.url}/`,
  description: siteConfig.description,
  inLanguage: siteConfig.lang,
  publisher: { "@id": `${siteConfig.url}/#organization` },
} as const;

/** El mismo emisor, pero como nodo con identidad propia y no incrustado. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: `${siteConfig.url}/`,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(siteConfig.logo),
  },
} as const;

/**
 * Migas de pan. Se pasa la ruta sin el inicio: se añade sola, porque siempre
 * es la misma y olvidarla es el error más habitual al escribir este esquema.
 */
export function breadcrumbJsonLd(
  steps: { name: string; path: string }[],
): Record<string, unknown> {
  const all = [{ name: "Inicio", path: "/" }, ...steps];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: step.path === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${step.path}`,
    })),
  };
}

/**
 * Preguntas frecuentes.
 *
 * Es el esquema del que un motor de respuestas saca una respuesta directa: le
 * entrega la pregunta y la respuesta ya emparejadas, sin tener que deducir
 * cuál de los párrafos de la página contesta a qué. Exige que esas mismas
 * preguntas estén visibles —de ahí que se construya a partir del array que ya
 * pinta el bloque, y no de una copia.
 */
export function faqJsonLd(
  items: readonly { q: string; a: string }[],
): Record<string, unknown> | null {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: siteConfig.lang,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * Los pasos para hacer un CV, como procedimiento.
 *
 * Google retiró el resultado enriquecido de `HowTo` en 2023, así que esto no
 * dibuja nada en la página de resultados. Sigue valiendo la pena por el otro
 * lector: un asistente al que le preguntan "¿cómo hago un currículum gratis?"
 * puede responder con los tres pasos reales y citar de dónde salen, en lugar
 * de resumir la portada a ojo.
 */
export function howToJsonLd(
  steps: readonly { title: string; text: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo crear un CV profesional con GeneCV",
    description:
      "Tres pasos para generar un currículum en PDF compatible con ATS, sin crear una cuenta.",
    inLanguage: siteConfig.lang,
    totalTime: "PT10M",
    // El procedimiento no cuesta nada: declararlo evita que un asistente
    // asuma un muro de pago que no existe.
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: { "@type": "HowToTool", name: siteConfig.name },
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.text,
      url: `${siteConfig.url}/crear`,
    })),
  };
}

type PageSeo = {
  title: string;
  description: string;
  /** Path starting with "/" — used for the canonical URL. */
  path: string;
  keywords?: string[];
  /** Set to false for utility pages that should stay out of the index. */
  index?: boolean;
};

/**
 * Builds per-page metadata on top of the site defaults so every route ships a
 * canonical URL and consistent OpenGraph/Twitter cards.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
}: PageSeo): Metadata {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: siteConfig.twitter,
    },
  };
}

/** Primary navigation, shared by the navbar and the footer. */
export const mainNav = [
  { href: "/plantillas", label: "Plantillas" },
  { href: "/premium", label: "Premium" },
  { href: "/articulos", label: "Artículos" },
] as const;

export const footerNav = [
  {
    title: "Producto",
    links: [
      { href: "/crear", label: "Crear mi CV" },
      { href: "/plantillas", label: "Plantillas" },
      { href: "/premium", label: "Plantillas premium" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/articulos", label: "Guías por país" },
      { href: "/articulos/como-hacer-un-curriculum-en-espana", label: "CV en España" },
      { href: "/articulos/como-hacer-un-curriculum-en-mexico", label: "CV en México" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidad", label: "Privacidad" },
      { href: "/terminos", label: "Términos" },
    ],
  },
] as const;
