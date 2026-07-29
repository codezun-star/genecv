/**
 * Article registry for the future country guides.
 *
 * Content is intentionally not written yet — this only fixes the URL shape,
 * the metadata and the listing UI so posts can be dropped in later (MDX, a
 * CMS, or plain objects here) without touching routing.
 *
 * Add a `body` field or point `source` at an MDX file when content arrives.
 */
export interface Article {
  slug: string;
  title: string;
  description: string;
  /** ISO country code, used for grouping and hreflang later on. */
  country: string;
  countryLabel: string;
  /** Reading time in minutes, shown in the listing. */
  readingMinutes: number;
  /** null while the guide is still being written. */
  publishedAt: string | null;
  body?: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "como-hacer-cv-en-espana",
    title: "Cómo hacer un CV en España",
    description:
      "Formato, foto, extensión y errores frecuentes del currículum español, con ejemplos de secciones y frases.",
    country: "ES",
    countryLabel: "España",
    readingMinutes: 8,
    publishedAt: null,
  },
  {
    slug: "como-hacer-cv-en-mexico",
    title: "Cómo hacer un CV en México",
    description:
      "Qué esperan los reclutadores mexicanos, qué datos personales evitar y cómo estructurar la experiencia.",
    country: "MX",
    countryLabel: "México",
    readingMinutes: 7,
    publishedAt: null,
  },
  {
    slug: "como-hacer-cv-en-argentina",
    title: "Cómo hacer un CV en Argentina",
    description:
      "Extensión recomendada, uso de la foto y cómo presentar estudios en curso en el mercado argentino.",
    country: "AR",
    countryLabel: "Argentina",
    readingMinutes: 6,
    publishedAt: null,
  },
  {
    slug: "como-hacer-cv-en-colombia",
    title: "Cómo hacer un CV en Colombia",
    description:
      "Hoja de vida vs. currículum, qué incluir y cómo adaptarlo a las plataformas de empleo colombianas.",
    country: "CO",
    countryLabel: "Colombia",
    readingMinutes: 6,
    publishedAt: null,
  },
  {
    slug: "como-hacer-un-resume-en-estados-unidos",
    title: "Cómo hacer un resume en Estados Unidos",
    description:
      "Por qué no se pone foto, cómo superar los filtros ATS y cómo redactar logros cuantificados en inglés.",
    country: "US",
    countryLabel: "Estados Unidos",
    readingMinutes: 9,
    publishedAt: null,
  },
  {
    slug: "como-hacer-cv-en-reino-unido",
    title: "Cómo hacer un CV en Reino Unido",
    description:
      "Diferencias entre el CV británico y el resume estadounidense: extensión, referencias y personal statement.",
    country: "GB",
    countryLabel: "Reino Unido",
    readingMinutes: 7,
    publishedAt: null,
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export const PUBLISHED_ARTICLES = ARTICLES.filter((a) => a.publishedAt !== null);
