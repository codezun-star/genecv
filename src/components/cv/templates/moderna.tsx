import {
  EducationBlock,
  ExperienceBlock,
  LanguagesList,
  Photo,
  SectionHeading,
  SkillsText,
  Summary,
  type TemplateProps,
} from "@/components/cv/templates/shared";

/**
 * Coloured header band over a single-column body. Looks current without
 * introducing a sidebar, so it still parses cleanly.
 */
export function ModernaTemplate({ view }: TemplateProps) {
  const accent = view.accent;

  return (
    <div className="h-full font-sans">
      <header
        style={{ backgroundColor: accent }}
        className="flex items-center gap-4 px-[46px] py-[30px] text-white"
      >
        <Photo view={view} size={68} />
        <div className="min-w-0">
          <h1 className="text-[23px] leading-tight font-bold tracking-tight">
            {view.fullName}
          </h1>
          <p className="mt-0.5 text-[11.5px] font-medium opacity-90">
            {view.headline}
          </p>
          {view.contact.length > 0 && (
            <p className="mt-2 text-[9px] leading-relaxed opacity-85">
              {view.contact.join("  ·  ")}
            </p>
          )}
        </div>
      </header>

      <div className="px-[46px] py-[26px]">
        {view.extras.length > 0 && (
          <p className="mb-3 text-[9.5px] text-[#666]">
            {view.extras.join("  ·  ")}
          </p>
        )}

        {view.sections.map((section) => (
          <section key={section.id}>
            <SectionHeading accent={accent} variant="plain">
              {section.heading}
            </SectionHeading>

            {section.id === "summary" && <Summary view={view} />}
            {section.id === "experience" && (
              <ExperienceBlock view={view} accent={accent} />
            )}
            {section.id === "education" && (
              <EducationBlock view={view} accent={accent} />
            )}
            {section.id === "skills" && <SkillsText view={view} />}
            {section.id === "languages" && <LanguagesList view={view} />}
          </section>
        ))}
      </div>
    </div>
  );
}
