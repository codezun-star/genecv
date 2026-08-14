/**
 * Template catalogue.
 *
 * Every design is a configuration rather than a bespoke component: a layout
 * archetype plus a handful of style choices. One HTML renderer and one PDF
 * renderer read this config, which is why twenty templates do not mean forty
 * files to keep in sync — and why adding a design is adding an entry here.
 */

/** How the page is divided. */
export type TemplateLayout =
  | "single" // one linear column — the ATS-safe shape
  | "header-band" // full-width coloured header, single-column body
  | "sidebar-left" // coloured sidebar on the left
  | "sidebar-right" // light sidebar on the right, separated by a rule
  | "split-header" // large name block, then a two-column body
  | "timeline"; // single column, experience hung off a vertical rule

export type HeadingStyle =
  | "underline"
  | "plain"
  | "bar" // filled bar behind the heading
  | "boxed" // outlined box
  | "caps-rule" // small caps with a hairline to the right
  | "left-accent"; // vertical accent bar on the left

export type NameStyle = "bold" | "uppercase-wide" | "large-light";
export type Density = "airy" | "normal" | "compact";
export type SkillStyle = "text" | "bars" | "rows" | "pills";
export type PhotoShape = "circle" | "square" | "rounded";

export interface TemplateDesign {
  layout: TemplateLayout;
  heading: HeadingStyle;
  name: NameStyle;
  density: Density;
  skills: SkillStyle;
  photo: PhotoShape;
  /** Sidebar layouts: which sections move out of the main column. */
  sidebarSections?: ("skills" | "languages")[];
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  /** Premium templates are catalogued and rendered but locked until checkout ships. */
  isPremium: boolean;
  design: TemplateDesign;
  /** Default accent, overridable by the user. */
  accent: string;
  /** Monochrome designs ignore the accent entirely. */
  monochrome?: boolean;
  tags: string[];
}

const MULTI_COLUMN: TemplateLayout[] = [
  "sidebar-left",
  "sidebar-right",
  "split-header",
];

/**
 * ATS signals derived from the design instead of maintained by hand, so a
 * template can never claim to be parser-safe while rendering a sidebar.
 */
export function atsSignals(template: TemplateMeta) {
  return {
    multiColumn: MULTI_COLUMN.includes(template.design.layout),
    usesTables: false,
    graphicRatings: template.design.skills === "bars",
    headerFooterContent: false,
  };
}

export function isAtsSafe(template: TemplateMeta) {
  const signals = atsSignals(template);
  return !signals.multiColumn && !signals.usesTables && !signals.graphicRatings;
}

export const TEMPLATES: TemplateMeta[] = [
  /* ------------------------------------------------------------- Gratuitas */
  {
    id: "clasica",
    name: "Clásica ATS",
    description:
      "Una sola columna, tipografía sobria y cero adornos. La opción más segura para portales de empleo y filtros automáticos.",
    isPremium: false,
    accent: "#234D68",
    monochrome: true,
    design: {
      layout: "single",
      heading: "underline",
      name: "bold",
      density: "normal",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Sobria", "Universal"],
  },
  {
    id: "moderna",
    name: "Moderna",
    description:
      "Cabecera con color de acento y jerarquía clara. Mantiene una sola columna, así que sigue siendo legible para los ATS.",
    isPremium: false,
    accent: "#234D68",
    design: {
      layout: "header-band",
      heading: "plain",
      name: "bold",
      density: "normal",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Con foto", "Actual"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Mucho aire, titulares finos y separadores discretos. Una sola columna para que el contenido mande.",
    isPremium: false,
    accent: "#566B81",
    design: {
      layout: "single",
      heading: "caps-rule",
      name: "large-light",
      density: "airy",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Minimalista", "Aire"],
  },
  {
    id: "pauta",
    name: "Pauta",
    description:
      "Titulares enmarcados que separan las secciones de un vistazo, sin adornos ni color de fondo. Una sola columna.",
    isPremium: false,
    accent: "#33414D",
    design: {
      layout: "single",
      heading: "boxed",
      name: "bold",
      density: "normal",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Estructurada", "Sobria"],
  },
  {
    id: "cantera",
    name: "Cantera",
    description:
      "Titulares en barra maciza y datos en filas. Pensada para oficios y perfiles técnicos, donde lo que importa es encontrar el dato rápido.",
    isPremium: false,
    accent: "#26404F",
    design: {
      layout: "single",
      heading: "bar",
      name: "uppercase-wide",
      density: "normal",
      skills: "rows",
      photo: "square",
    },
    tags: ["ATS", "Oficios", "Directa"],
  },
  {
    id: "sendero",
    name: "Sendero",
    description:
      "Línea de tiempo sin etiquetas ni gráficos: solo texto colgando de una regla. La más segura de las cronológicas para filtros automáticos.",
    isPremium: false,
    accent: "#4F4A5C",
    design: {
      layout: "timeline",
      heading: "caps-rule",
      name: "uppercase-wide",
      density: "normal",
      skills: "text",
      photo: "rounded",
    },
    tags: ["ATS", "Línea de tiempo", "Sobria"],
  },

  /* ---------------------------------------------------------------- Premium */
  {
    id: "creativa",
    name: "Creativa",
    description:
      "Barra lateral de color con foto, contacto y habilidades en barras. Para candidaturas directas y perfiles de diseño.",
    isPremium: true,
    accent: "#566B81",
    design: {
      layout: "sidebar-left",
      heading: "underline",
      name: "bold",
      density: "normal",
      skills: "bars",
      photo: "circle",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Con foto", "Diseño"],
  },
  {
    id: "ejecutiva",
    name: "Ejecutiva",
    description:
      "Nombre en mayúsculas, columna lateral estrecha y mucho contraste. Para perfiles senior con trayectoria larga.",
    isPremium: true,
    accent: "#1B3C51",
    design: {
      layout: "sidebar-right",
      heading: "plain",
      name: "uppercase-wide",
      density: "normal",
      skills: "rows",
      photo: "square",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Senior", "Elegante"],
  },
  {
    id: "compacta",
    name: "Compacta Pro",
    description:
      "Densidad alta para encajar más de diez años de experiencia en una página sin que se vea apretado.",
    isPremium: true,
    accent: "#234D68",
    design: {
      layout: "single",
      heading: "bar",
      name: "bold",
      density: "compact",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Una página", "Densa"],
  },
  {
    id: "editorial",
    name: "Editorial Pro",
    description:
      "Retícula tipo revista, titulares en caja y habilidades en etiquetas. Para portfolio, marketing y comunicación.",
    isPremium: true,
    accent: "#7A3B4E",
    design: {
      layout: "sidebar-left",
      heading: "boxed",
      name: "large-light",
      density: "airy",
      skills: "pills",
      photo: "rounded",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Editorial", "Con foto", "Creativa"],
  },
  {
    id: "corporativa",
    name: "Corporativa",
    description:
      "Cabecera de color a sangre y titulares enmarcados. Formal sin renunciar a una sola columna.",
    isPremium: true,
    accent: "#163243",
    design: {
      layout: "header-band",
      heading: "boxed",
      name: "uppercase-wide",
      density: "normal",
      skills: "rows",
      photo: "square",
    },
    tags: ["ATS", "Formal", "Con foto"],
  },
  {
    id: "consultora",
    name: "Consultora",
    description:
      "Columna lateral clara para datos rápidos y cuerpo denso para el detalle. Pensada para perfiles de consultoría.",
    isPremium: true,
    accent: "#2C3740",
    design: {
      layout: "sidebar-right",
      heading: "caps-rule",
      name: "bold",
      density: "compact",
      skills: "rows",
      photo: "square",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Densa", "Analítica"],
  },
  {
    id: "directiva",
    name: "Directiva",
    description:
      "Bloque de nombre a gran tamaño sobre una regla de color y cuerpo a dos columnas. Para dirección y alta gestión.",
    isPremium: true,
    accent: "#0C1B24",
    design: {
      layout: "split-header",
      heading: "left-accent",
      name: "uppercase-wide",
      density: "normal",
      skills: "text",
      photo: "square",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dirección", "Impacto", "Dos columnas"],
  },
  {
    id: "trayectoria",
    name: "Trayectoria",
    description:
      "Línea de tiempo vertical que hace evidente la progresión de tu carrera. Una sola columna.",
    isPremium: true,
    accent: "#234D68",
    design: {
      layout: "timeline",
      heading: "plain",
      name: "bold",
      density: "normal",
      skills: "pills",
      photo: "circle",
    },
    tags: ["Línea de tiempo", "Progresión"],
  },
  {
    id: "academica",
    name: "Académica",
    description:
      "Estructura amplia y neutra para currículums largos con formación, cursos y publicaciones.",
    isPremium: true,
    accent: "#394753",
    design: {
      layout: "single",
      heading: "underline",
      name: "bold",
      density: "airy",
      skills: "text",
      photo: "circle",
    },
    tags: ["ATS", "Académica", "Extensa"],
  },
  {
    id: "tecnica",
    name: "Técnica",
    description:
      "Titulares con barra de acento y habilidades en etiquetas, para perfiles con muchas tecnologías.",
    isPremium: true,
    accent: "#2F7D5D",
    design: {
      layout: "single",
      heading: "left-accent",
      name: "bold",
      density: "compact",
      skills: "pills",
      photo: "circle",
    },
    tags: ["Tecnología", "Densa", "Stack"],
  },
  {
    id: "contraste",
    name: "Contraste",
    description:
      "Barra lateral oscura a la izquierda y cuerpo claro, con habilidades en etiquetas. Moderna y legible.",
    isPremium: true,
    accent: "#1F272E",
    design: {
      layout: "sidebar-left",
      heading: "plain",
      name: "bold",
      density: "normal",
      skills: "pills",
      photo: "rounded",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Con foto", "Contraste"],
  },
  {
    id: "meridiano",
    name: "Meridiano",
    description:
      "Cabecera a sangre con titulares finos y habilidades en etiquetas. Equilibrio entre color y legibilidad.",
    isPremium: true,
    accent: "#1F5A6B",
    design: {
      layout: "header-band",
      heading: "caps-rule",
      name: "large-light",
      density: "normal",
      skills: "pills",
      photo: "circle",
    },
    tags: ["Con foto", "Actual", "Etiquetas"],
  },
  {
    id: "nordica",
    name: "Nórdica",
    description:
      "Tipografía en mayúsculas espaciadas y separadores mínimos. Sobria, con mucho aire y una sola columna.",
    isPremium: true,
    accent: "#3A4A52",
    design: {
      layout: "single",
      heading: "caps-rule",
      name: "uppercase-wide",
      density: "airy",
      skills: "rows",
      photo: "square",
    },
    tags: ["ATS", "Minimalista", "Sobria"],
  },
  {
    id: "atenea",
    name: "Atenea",
    description:
      "Columna lateral clara con titulares enmarcados y etiquetas de competencias. Para perfiles académicos y de investigación.",
    isPremium: true,
    accent: "#4A3B6B",
    design: {
      layout: "sidebar-right",
      heading: "boxed",
      name: "large-light",
      density: "airy",
      skills: "pills",
      photo: "rounded",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Académica", "Etiquetas"],
  },
  {
    id: "pulso",
    name: "Pulso",
    description:
      "Línea de tiempo compacta con titulares de barra lateral. Muestra una carrera larga sin ocupar dos páginas.",
    isPremium: true,
    accent: "#8A4B2A",
    design: {
      layout: "timeline",
      heading: "left-accent",
      name: "bold",
      density: "compact",
      skills: "rows",
      photo: "circle",
    },
    tags: ["Línea de tiempo", "Densa", "Una página"],
  },
  {
    id: "vanguardia",
    name: "Vanguardia",
    description:
      "Nombre a gran tamaño, titulares en barra de color y cuerpo a dos columnas. Pensada para causar impacto.",
    isPremium: true,
    accent: "#0F3D3E",
    design: {
      layout: "split-header",
      heading: "bar",
      name: "large-light",
      density: "airy",
      skills: "pills",
      photo: "rounded",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Impacto", "Dos columnas", "Editorial"],
  },
  {
    id: "bruma",
    name: "Bruma",
    description:
      "Barra lateral en tono suave con tipografía ligera. Un diseño con foto que no compite con el contenido.",
    isPremium: true,
    accent: "#6B7A8F",
    design: {
      layout: "sidebar-left",
      heading: "caps-rule",
      name: "large-light",
      density: "airy",
      skills: "rows",
      photo: "circle",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Con foto", "Suave"],
  },
  {
    id: "aurora",
    name: "Aurora",
    description:
      "Cabecera de color a sangre, titulares con barra de acento y competencias en etiquetas. Aire generoso sin perder una sola columna.",
    isPremium: true,
    accent: "#2B5F5A",
    design: {
      layout: "header-band",
      heading: "left-accent",
      name: "bold",
      density: "airy",
      skills: "pills",
      photo: "rounded",
    },
    tags: ["ATS", "Con foto", "Etiquetas"],
  },
  {
    id: "lumen",
    name: "Lumen",
    description:
      "Cabecera de color con tipografía ligera y cuerpo denso. Mete mucha información sin que la página se vea recargada.",
    isPremium: true,
    accent: "#45566B",
    design: {
      layout: "header-band",
      heading: "underline",
      name: "large-light",
      density: "compact",
      skills: "rows",
      photo: "rounded",
    },
    tags: ["ATS", "Densa", "Con foto"],
  },
  {
    id: "faro",
    name: "Faro",
    description:
      "Línea de tiempo con titulares enmarcados y mucho aire entre etapas. Hace legible una carrera con muchos saltos.",
    isPremium: true,
    accent: "#7A5C2E",
    design: {
      layout: "timeline",
      heading: "boxed",
      name: "large-light",
      density: "airy",
      skills: "pills",
      photo: "square",
    },
    tags: ["Línea de tiempo", "Aire", "Etiquetas"],
  },
  {
    id: "delta",
    name: "Delta",
    description:
      "Bloque de nombre amplio sobre un cuerpo a dos columnas muy denso. Para trayectorias largas que deben caber en una página.",
    isPremium: true,
    accent: "#3E6B8A",
    design: {
      layout: "split-header",
      heading: "caps-rule",
      name: "bold",
      density: "compact",
      skills: "rows",
      photo: "circle",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Densa", "Una página"],
  },
  {
    id: "cenit",
    name: "Cénit",
    description:
      "Nombre a gran tamaño y cuerpo a dos columnas con las habilidades en barras. Para candidaturas directas que buscan impacto.",
    isPremium: true,
    accent: "#8C3F3F",
    design: {
      layout: "split-header",
      heading: "plain",
      name: "large-light",
      density: "normal",
      skills: "bars",
      photo: "circle",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Impacto", "Habilidades"],
  },
  {
    id: "istmo",
    name: "Istmo",
    description:
      "Columna lateral derecha con las habilidades en barras y titulares de acento. Para perfiles donde el nivel técnico es el argumento.",
    isPremium: true,
    accent: "#5A6E52",
    design: {
      layout: "sidebar-right",
      heading: "left-accent",
      name: "bold",
      density: "airy",
      skills: "bars",
      photo: "circle",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Habilidades", "Con foto"],
  },
  {
    id: "ribera",
    name: "Ribera",
    description:
      "Barra lateral de color y titulares macizos, con densidad alta. Formal, con carácter y sin desperdiciar espacio.",
    isPremium: true,
    accent: "#874C62",
    design: {
      layout: "sidebar-left",
      heading: "bar",
      name: "uppercase-wide",
      density: "compact",
      skills: "text",
      photo: "square",
      sidebarSections: ["skills", "languages"],
    },
    tags: ["Dos columnas", "Densa", "Contraste"],
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
