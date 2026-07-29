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
} as const;

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
      { href: "/articulos/como-hacer-cv-en-espana", label: "CV en España" },
      { href: "/articulos/como-hacer-cv-en-mexico", label: "CV en México" },
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
