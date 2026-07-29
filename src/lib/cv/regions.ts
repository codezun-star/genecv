import type { RegionId, SectionId } from "@/lib/cv/types";

export type PhotoPolicy = "recommended" | "optional" | "discouraged";

export interface RegionPreset {
  id: RegionId;
  label: string;
  /** Short blurb shown in the format picker. */
  description: string;
  /** Countries/markets this preset targets. */
  markets: string;
  /** What the document is called in this market. */
  documentName: string;
  shortName: string;
  photo: PhotoPolicy;
  showPhotoByDefault: boolean;
  /** Locale used to render month names in the preview. */
  dateLocale: string;
  /** Default order of the reorderable sections. */
  sectionOrder: SectionId[];
  /** Extra personal fields this market still expects. */
  personalFields: {
    birthDate: boolean;
    nationality: boolean;
    drivingLicense: boolean;
  };
  /** Section headings rendered in the exported document. */
  terms: Record<SectionId, string>;
  /** Guidance surfaced in the editor sidebar. */
  tips: string[];
}

export const REGIONS: Record<RegionId, RegionPreset> = {
  europa: {
    id: "europa",
    label: "España y Europa",
    description:
      "Formato europeo clásico: se acepta la foto, se incluyen datos personales y el documento se llama Currículum Vitae.",
    markets: "España, Alemania, Francia, Italia, Portugal…",
    documentName: "Currículum Vitae",
    shortName: "CV",
    photo: "recommended",
    showPhotoByDefault: true,
    dateLocale: "es-ES",
    sectionOrder: ["summary", "experience", "education", "skills", "languages"],
    personalFields: {
      birthDate: true,
      nationality: true,
      drivingLicense: true,
    },
    terms: {
      summary: "Perfil profesional",
      experience: "Experiencia laboral",
      education: "Formación académica",
      skills: "Competencias",
      languages: "Idiomas",
    },
    tips: [
      "En España es habitual incluir foto tipo carné y el carnet de conducir si el puesto lo requiere.",
      "Dos páginas como máximo; una si tienes menos de 5 años de experiencia.",
      "Los idiomas se indican con el nivel del Marco Común Europeo (A1–C2).",
    ],
  },
  latam: {
    id: "latam",
    label: "Latinoamérica",
    description:
      "Currículum en español con foto opcional, datos de contacto locales y un resumen profesional al inicio.",
    markets: "México, Colombia, Argentina, Chile, Perú…",
    documentName: "Currículum Vitae",
    shortName: "CV",
    photo: "optional",
    showPhotoByDefault: true,
    dateLocale: "es-419",
    sectionOrder: ["summary", "experience", "education", "skills", "languages"],
    personalFields: {
      birthDate: false,
      nationality: true,
      drivingLicense: false,
    },
    terms: {
      summary: "Resumen profesional",
      experience: "Experiencia profesional",
      education: "Educación",
      skills: "Habilidades",
      languages: "Idiomas",
    },
    tips: [
      "La foto es opcional: inclúyela solo si la oferta o la empresa lo pide.",
      "Evita datos sensibles como estado civil, RFC/CURP o número de documento.",
      "Cuantifica los logros (%, montos, número de personas a cargo).",
    ],
  },
  anglo: {
    id: "anglo",
    label: "Anglosajón",
    description:
      "Resume sin foto ni datos personales, con las habilidades cerca del inicio para superar los filtros ATS.",
    markets: "Estados Unidos, Reino Unido, Canadá, Australia…",
    documentName: "Resume",
    shortName: "Resume",
    photo: "discouraged",
    showPhotoByDefault: false,
    dateLocale: "en-US",
    sectionOrder: ["summary", "skills", "experience", "education", "languages"],
    personalFields: {
      birthDate: false,
      nationality: false,
      drivingLicense: false,
    },
    terms: {
      summary: "Professional Summary",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      languages: "Languages",
    },
    tips: [
      "No incluyas foto, fecha de nacimiento ni nacionalidad: la legislación antidiscriminación lo desaconseja.",
      "Una sola página si tienes menos de 10 años de experiencia.",
      "Empieza cada logro con un verbo de acción en pasado (Led, Built, Reduced…).",
    ],
  },
};

export const REGION_LIST = Object.values(REGIONS);

export function getRegion(id: RegionId | string | undefined): RegionPreset {
  if (id && id in REGIONS) return REGIONS[id as RegionId];
  return REGIONS.europa;
}
