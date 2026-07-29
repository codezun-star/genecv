import {
  EducationBlock,
  ExperienceBlock,
  LanguagesList,
  SectionHeading,
  SkillsText,
  Summary,
  type TemplateProps,
} from "@/components/cv/templates/shared";

/**
 * Single column, no colour blocks, no graphics. The safest option for any
 * automated parser: one linear reading order from top to bottom.
 */
export function ClasicaTemplate({ view }: TemplateProps) {
  const accent = "#1a1a1a";

  return (
    <div className="h-full px-[52px] py-[46px] font-sans">
      <header className="border-b border-[#1a1a1a] pb-3">
        <h1 className="text-[22px] leading-tight font-bold tracking-tight text-[#1a1a1a]">
          {view.fullName}
        </h1>
        <p className="mt-0.5 text-[11.5px] font-medium text-[#444]">
          {view.headline}
        </p>
        {view.contact.length > 0 && (
          <p className="mt-2 text-[9.5px] leading-relaxed text-[#555]">
            {view.contact.join("  |  ")}
          </p>
        )}
        {view.extras.length > 0 && (
          <p className="mt-0.5 text-[9.5px] text-[#555]">
            {view.extras.join("  |  ")}
          </p>
        )}
      </header>

      {view.sections.map((section) => (
        <section key={section.id}>
          <SectionHeading accent={accent} variant="underline">
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
  );
}
