/** Regional CV conventions supported by the builder. */
export type RegionId = "europa" | "latam" | "anglo";

/** Reorderable content sections. Personal data is always first and fixed. */
export type SectionId =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages";

export const SECTION_IDS: SectionId[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
];

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  /** Job title shown under the name, e.g. "Desarrolladora Frontend". */
  headline: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  website: string;
  linkedin: string;
  /** Base64 data URL kept in localStorage; never uploaded anywhere. */
  photo: string | null;
  /** User-facing toggle; regions only set its initial value. */
  showPhoto: boolean;
  summary: string;
  /** Fields that only some regions expect. */
  birthDate: string;
  nationality: string;
  drivingLicense: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  /** "YYYY-MM" as produced by <input type="month">. */
  startDate: string;
  endDate: string;
  current: boolean;
  /** One achievement per line. */
  achievements: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

/** 1 = básico ... 5 = experto. */
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

export type LanguageLevel =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "nativo";

export interface LanguageItem {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface CvData {
  /** Bumped when the stored shape changes so old drafts can be migrated. */
  version: number;
  region: RegionId;
  templateId: string;
  /** Free-text industry key used to filter the phrase bank. */
  industry: string;
  accentColor: string;
  personal: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  sectionOrder: SectionId[];
  updatedAt: string;
}
