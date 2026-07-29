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

/**
 * "2021-03" -> "Marzo 2021" (es) / "March 2021" (en).
 *
 * Built from the month name alone rather than a full date format because
 * Spanish locales render "septiembre de 2018", and the connector reads badly
 * inside a CV date range.
 */
function formatMonth(value: string, locale: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year) return "";
  if (!month) return year;

  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  const name = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  const capitalised = name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);

  return `${capitalised} ${year}`;
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

/**
 * Trims and collapses runs of whitespace.
 *
 * People paste from Word and LinkedIn constantly, which brings double spaces,
 * non-breaking spaces and stray line breaks. Left alone they show up as gaps
 * in the rendered CV and as odd spacing in the extracted PDF text, so every
 * string entering the view goes through here.
 */
function clean(value: string | undefined | null): string {
  if (!value) return "";
  return value
    // JS \s already covers NBSP; zero-width characters it does not.
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same as `clean`, but keeps paragraph breaks in multi-line fields. */
function cleanMultiline(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Joins non-empty parts with a separator. */
function join(parts: (string | undefined)[], separator = " · ") {
  return parts.map(clean).filter(Boolean).join(separator);
}

export function buildCvView(cv: CvData): CvView {
  const region = getRegion(cv.region);
  const locale = region.dateLocale;
  const presentLabel = cv.region === "anglo" ? "Present" : "Actualidad";
  const p = cv.personal;

  const hasName = Boolean(clean(p.firstName) || clean(p.lastName));
  const fullName = hasName
    ? join([p.firstName, p.lastName], " ")
    : `${PREVIEW_PLACEHOLDERS.firstName} ${PREVIEW_PLACEHOLDERS.lastName}`;

  const contact = [
    clean(p.email),
    clean(p.phone),
    join([p.city, p.country], ", "),
    clean(p.linkedin),
    clean(p.website),
  ].filter(Boolean);

  const extras: string[] = [];
  if (region.personalFields.birthDate && clean(p.birthDate)) {
    extras.push(`Fecha de nacimiento: ${clean(p.birthDate)}`);
  }
  if (region.personalFields.nationality && clean(p.nationality)) {
    extras.push(`Nacionalidad: ${clean(p.nationality)}`);
  }
  if (region.personalFields.drivingLicense && clean(p.drivingLicense)) {
    extras.push(`Carnet de conducir: ${clean(p.drivingLicense)}`);
  }

  const summaryText = cleanMultiline(p.summary);

  const experience: ExperienceView[] = cv.experience
    .filter(
      (item) =>
        clean(item.position) ||
        clean(item.company) ||
        item.achievements.some((a) => clean(a)),
    )
    .map((item) => ({
      id: item.id,
      position: clean(item.position) || PREVIEW_PLACEHOLDERS.position,
      company: clean(item.company) || PREVIEW_PLACEHOLDERS.company,
      location: clean(item.location),
      dates: formatRange(
        item.startDate,
        item.endDate,
        item.current,
        locale,
        presentLabel,
      ),
      achievements: item.achievements.map(clean).filter(Boolean),
      isPlaceholder: false,
    }));

  const education: EducationView[] = cv.education
    .filter((item) => clean(item.degree) || clean(item.institution))
    .map((item) => ({
      id: item.id,
      degree: clean(item.degree) || PREVIEW_PLACEHOLDERS.degree,
      institution: clean(item.institution) || PREVIEW_PLACEHOLDERS.institution,
      location: clean(item.location),
      dates: formatRange(
        item.startDate,
        item.endDate,
        item.current,
        locale,
        presentLabel,
      ),
      description: clean(item.description),
      isPlaceholder: false,
    }));

  const skills = cv.skills
    .filter((skill) => clean(skill.name))
    .map((skill) => ({
      id: skill.id,
      name: clean(skill.name),
      level: skill.level,
      levelLabel: SKILL_LEVEL_LABELS[skill.level],
    }));

  const languages = cv.languages
    .filter((language) => clean(language.name))
    .map((language) => ({
      id: language.id,
      name: clean(language.name),
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
    headline: clean(p.headline) || PREVIEW_PLACEHOLDERS.headline,
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
