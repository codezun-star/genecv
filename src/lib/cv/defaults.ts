import { getRegion } from "@/lib/cv/regions";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/cv/templates";
import type {
  CvData,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  RegionId,
  SkillItem,
} from "@/lib/cv/types";
import { createId } from "@/lib/utils";

/** Bump when the stored shape changes; older drafts are discarded. */
export const CV_SCHEMA_VERSION = 1;

export function createExperience(): ExperienceItem {
  return {
    id: createId("exp"),
    position: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    achievements: [""],
  };
}

export function createEducation(): EducationItem {
  return {
    id: createId("edu"),
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

export function createSkill(name = ""): SkillItem {
  return { id: createId("skl"), name, level: 3 };
}

export function createLanguage(): LanguageItem {
  return { id: createId("lng"), name: "", level: "B2" };
}

export function createEmptyCv(region: RegionId = "europa"): CvData {
  const preset = getRegion(region);
  const template = getTemplate(DEFAULT_TEMPLATE_ID);

  return {
    version: CV_SCHEMA_VERSION,
    region: preset.id,
    templateId: template.id,
    industry: "general",
    accentColor: template.accent,
    personal: {
      firstName: "",
      lastName: "",
      headline: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      website: "",
      linkedin: "",
      photo: null,
      showPhoto: preset.showPhotoByDefault,
      summary: "",
      birthDate: "",
      nationality: "",
      drivingLicense: "",
    },
    experience: [createExperience()],
    education: [createEducation()],
    skills: [createSkill(), createSkill(), createSkill()],
    languages: [createLanguage()],
    sectionOrder: [...preset.sectionOrder],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Placeholder content for the live preview. Shown only where the user has not
 * typed anything yet, so the document never looks broken while empty.
 */
export const PREVIEW_PLACEHOLDERS = {
  firstName: "Nombre",
  lastName: "Apellido",
  headline: "Tu puesto o especialidad",
  email: "tu@email.com",
  phone: "+00 000 000 000",
  city: "Ciudad",
  country: "País",
  summary:
    "Escribe dos o tres líneas que resuman tu perfil, tus años de experiencia y lo que buscas. Aparecerá aquí mientras lo redactas.",
  position: "Puesto",
  company: "Empresa",
  degree: "Titulación",
  institution: "Centro de estudios",
  achievement: "Describe un logro concreto y, si puedes, cuantifícalo.",
} as const;
