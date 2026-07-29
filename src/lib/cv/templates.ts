export type TemplateLayout = "single-column" | "two-column";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  /** Premium templates are listed but locked until the USDT flow ships. */
  isPremium: boolean;
  layout: TemplateLayout;
  /** Signals consumed by the ATS checker (see lib/cv/ats.ts). */
  ats: {
    /** Sidebars and columns are the most common parsing failure. */
    multiColumn: boolean;
    /** Table-based layouts confuse most parsers. */
    usesTables: boolean;
    /** Icons/bars that carry meaning are invisible to a parser. */
    graphicRatings: boolean;
    /** Content placed in the PDF header/footer area is often dropped. */
    headerFooterContent: boolean;
  };
  /** Whether the template renders a photo when the user enables one. */
  supportsPhoto: boolean;
  /** Default accent, overridable by the user. */
  accent: string;
  tags: string[];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "clasica",
    name: "Clásica ATS",
    description:
      "Una sola columna, tipografía sobria y cero adornos. La opción más segura para portales de empleo y filtros automáticos.",
    isPremium: false,
    layout: "single-column",
    ats: {
      multiColumn: false,
      usesTables: false,
      graphicRatings: false,
      headerFooterContent: false,
    },
    supportsPhoto: false,
    accent: "#234D68",
    tags: ["ATS", "Sobria", "Universal"],
  },
  {
    id: "moderna",
    name: "Moderna",
    description:
      "Cabecera con color de acento y jerarquía clara. Mantiene una sola columna, así que sigue siendo legible para los ATS.",
    isPremium: false,
    layout: "single-column",
    ats: {
      multiColumn: false,
      usesTables: false,
      graphicRatings: false,
      headerFooterContent: false,
    },
    supportsPhoto: true,
    accent: "#234D68",
    tags: ["ATS", "Con foto", "Actual"],
  },
  {
    id: "creativa",
    name: "Creativa",
    description:
      "Barra lateral de color con foto, habilidades y contacto. Pensada para candidaturas directas y perfiles de diseño.",
    isPremium: false,
    layout: "two-column",
    ats: {
      multiColumn: true,
      usesTables: false,
      graphicRatings: true,
      headerFooterContent: false,
    },
    supportsPhoto: true,
    accent: "#566B81",
    tags: ["Dos columnas", "Con foto", "Diseño"],
  },
  {
    id: "ejecutiva",
    name: "Ejecutiva",
    description:
      "Columna lateral estrecha y tipografía de mayor contraste. Para perfiles senior con trayectoria larga.",
    isPremium: false,
    layout: "two-column",
    ats: {
      multiColumn: true,
      usesTables: false,
      graphicRatings: false,
      headerFooterContent: false,
    },
    supportsPhoto: true,
    accent: "#1B3C51",
    tags: ["Dos columnas", "Senior", "Elegante"],
  },
  // --- Premium placeholders -----------------------------------------------
  // Listed so the gallery and the data model already handle locked designs.
  // Rendering + checkout land with the USDT integration.
  {
    id: "compacta-pro",
    name: "Compacta Pro",
    description:
      "Densidad alta para encajar 10+ años de experiencia en una sola página sin perder aire.",
    isPremium: true,
    layout: "single-column",
    ats: {
      multiColumn: false,
      usesTables: false,
      graphicRatings: false,
      headerFooterContent: false,
    },
    supportsPhoto: false,
    accent: "#234D68",
    tags: ["Premium", "ATS", "Una página"],
  },
  {
    id: "editorial-pro",
    name: "Editorial Pro",
    description:
      "Retícula tipo revista con tipografía a dos pesos. Para portfolios, marketing y comunicación.",
    isPremium: true,
    layout: "two-column",
    ats: {
      multiColumn: true,
      usesTables: false,
      graphicRatings: true,
      headerFooterContent: true,
    },
    supportsPhoto: true,
    accent: "#566B81",
    tags: ["Premium", "Editorial", "Con foto"],
  },
];

export const FREE_TEMPLATES = TEMPLATES.filter((t) => !t.isPremium);
export const PREMIUM_TEMPLATES = TEMPLATES.filter((t) => t.isPremium);

export const DEFAULT_TEMPLATE_ID = "clasica";

export function getTemplate(id: string | undefined): TemplateMeta {
  return (
    TEMPLATES.find((t) => t.id === id) ??
    TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!
  );
}
