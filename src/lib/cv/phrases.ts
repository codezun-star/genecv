import phraseBank from "@/data/phrases.json";

export interface Industry {
  id: string;
  label: string;
  /** Openers for the professional summary. */
  summaries: string[];
  /** Achievement templates for the experience bullets. */
  achievements: string[];
}

export const INDUSTRIES: Industry[] = phraseBank.industries;

export const DEFAULT_INDUSTRY = "general";

export function getIndustry(id: string | undefined): Industry {
  return (
    INDUSTRIES.find((industry) => industry.id === id) ??
    INDUSTRIES.find((industry) => industry.id === DEFAULT_INDUSTRY)!
  );
}

/**
 * Suggestions for a field, always padded with the generic ones so a niche
 * industry never shows a short list.
 */
export function getSuggestions(
  industryId: string | undefined,
  kind: "summaries" | "achievements",
): string[] {
  const industry = getIndustry(industryId);
  const generic = getIndustry(DEFAULT_INDUSTRY);

  if (industry.id === generic.id) return industry[kind];
  return [...industry[kind], ...generic[kind]];
}
