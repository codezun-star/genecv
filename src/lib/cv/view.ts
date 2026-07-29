import { PREVIEW_PLACEHOLDERS } from "@/lib/cv/defaults";
import { getRegion } from "@/lib/cv/regions";
import type {
  CvData,
  LanguageLevel,
  SectionId,
  SkillLevel,
} from "@/lib/cv/types";

/**
 * Normalises the raw form data into everything a template needs to render.
 *
 * Both the HTML preview and the PDF document consume this, so headings, date
 * formats and empty-state fallbacks stay identical between what the user sees
 * and what they download.
 */

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  1: "Básico",
  2: "Elemental",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto",
};

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  A1: "A1 · Inicial",
  A2: "A2 · Básico",
  B1: "B1 · Intermedio",
  B2: "B2 · Intermedio alto",
  C1: "C1 · Avanzado",
  C2: "C2 · Dominio",
  nativo: "Nativo",
};

export interface ExperienceView {
  id: string;
  position: string;
  company: string;
  location: string;
  dates: string;
  achievements: string[];
  /** True when nothing was typed and we are showing placeholders. */
  isPlaceholder: boolean;
}

export interface EducationView {
  id: string;
  degree: string;
  institution: string;
  location: string;
  dates: string;
  description: string;
  isPlaceholder: boolean;
}

export interface CvView {
  fullName: string;
  headline: string;
  /** Contact lines already filtered of empty values. */
  contact: string[];
  /** Region-specific extras (birth date, nationality, licence). */
  extras: string[];
  photo: string | null;
  showPhoto: boolean;
  summary: string;
  summaryIsPlaceholder: boolean;
  experience: ExperienceView[];
  education: EducationView[];
  skills: { id: string; name: string; level: SkillLevel; levelLabel: string }[];
  languages: { id: string; name: string; levelLabel: string }[];
  /** Ordered sections that actually have something to show. */
  sections: { id: SectionId; heading: string }[];
  accent: string;
  documentName: string;
}

/** "2021-03" -> "mar 2021" (es) / "Mar 2021" (en). */
function formatMonth(value: string, locale: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year) return "";
  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  const label = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);

  return label.replace(/\./g, "");
}

function formatRange(
  start: string,
  end: string,
  current: boolean,
  locale: string,
  presentLabel: string,
): string {
  const from = formatMonth(start, locale);
  const to = current ? presentLabel : formatMonth(end, locale);

  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} — ${to}`;
}

/** Joins non-empty parts with a separator. */
function join(parts: (string | undefined)[], separator = " · ") {
  return parts.filter((part) => part && part.trim()).join(separator);
}

export function buildCvView(cv: CvData): CvView {
  const region = getRegion(cv.region);
  const locale = region.dateLocale;
  const presentLabel = cv.region === "anglo" ? "Present" : "Actualidad";
  const p = cv.personal;

  const hasName = Boolean(p.firstName.trim() || p.lastName.trim());
  const fullName = hasName
    ? join([p.firstName.trim(), p.lastName.trim()], " ")
    : `${PREVIEW_PLACEHOLDERS.firstName} ${PREVIEW_PLACEHOLDERS.lastName}`;

  const contact = [
    p.email.trim(),
    p.phone.trim(),
    join([p.city.trim(), p.country.trim()], ", "),
    p.linkedin.trim(),
    p.website.trim(),
  ].filter(Boolean);

  const extras: string[] = [];
  if (region.personalFields.birthDate && p.birthDate.trim()) {
    extras.push(`Fecha de nacimiento: ${p.birthDate.trim()}`);
  }
  if (region.personalFields.nationality && p.nationality.trim()) {
    extras.push(`Nacionalidad: ${p.nationality.trim()}`);
  }
  if (region.personalFields.drivingLicense && p.drivingLicense.trim()) {
    extras.push(`Carnet de conducir: ${p.drivingLicense.trim()}`);
  }

  const summaryText = p.summary.trim();

  const experience: ExperienceView[] = cv.experience
    .filter(
      (item) =>
        item.position.trim() ||
        item.company.trim() ||
        item.achievements.some((a) => a.trim()),
    )
    .map((item) => ({
      id: item.id,
      position: item.position.trim() || PREVIEW_PLACEHOLDERS.position,
      company: item.company.trim() || PREVIEW_PLACEHOLDERS.company,
      location: item.location.trim(),
      dates: formatRange(
        item.startDate,
        item.endDate,
        item.current,
        locale,
        presentLabel,
      ),
      achievements: item.achievements
        .map((line) => line.trim())
        .filter(Boolean),
      isPlaceholder: false,
    }));

  const education: EducationView[] = cv.education
    .filter((item) => item.degree.trim() || item.institution.trim())
    .map((item) => ({
      id: item.id,
      degree: item.degree.trim() || PREVIEW_PLACEHOLDERS.degree,
      institution: item.institution.trim() || PREVIEW_PLACEHOLDERS.institution,
      location: item.location.trim(),
      dates: formatRange(
        item.startDate,
        item.endDate,
        item.current,
        locale,
        presentLabel,
      ),
      description: item.description.trim(),
      isPlaceholder: false,
    }));

  const skills = cv.skills
    .filter((skill) => skill.name.trim())
    .map((skill) => ({
      id: skill.id,
      name: skill.name.trim(),
      level: skill.level,
      levelLabel: SKILL_LEVEL_LABELS[skill.level],
    }));

  const languages = cv.languages
    .filter((language) => language.name.trim())
    .map((language) => ({
      id: language.id,
      name: language.name.trim(),
      levelLabel: LANGUAGE_LEVEL_LABELS[language.level],
    }));

  // An empty CV still shows the summary block so the page is never blank.
  const hasContent: Record<SectionId, boolean> = {
    summary: true,
    experience: experience.length > 0,
    education: education.length > 0,
    skills: skills.length > 0,
    languages: languages.length > 0,
  };

  const sections = cv.sectionOrder
    .filter((id) => hasContent[id])
    .map((id) => ({ id, heading: region.terms[id] }));

  return {
    fullName,
    headline: p.headline.trim() || PREVIEW_PLACEHOLDERS.headline,
    contact,
    extras,
    photo: p.photo,
    // Regions that discourage photos never render one, even if data survives.
    showPhoto: p.showPhoto && region.photo !== "discouraged" && Boolean(p.photo),
    summary: summaryText || PREVIEW_PLACEHOLDERS.summary,
    summaryIsPlaceholder: summaryText.length === 0,
    experience,
    education,
    skills,
    languages,
    sections,
    accent: cv.accentColor,
    documentName: region.documentName,
  };
}
