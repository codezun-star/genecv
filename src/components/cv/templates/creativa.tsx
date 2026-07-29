import {
  EducationBlock,
  ExperienceBlock,
  LanguagesList,
  Photo,
  SectionHeading,
  SkillsBars,
  Summary,
  type TemplateProps,
} from "@/components/cv/templates/shared";

/**
 * Coloured sidebar with photo, contact, skills and languages; main column for
 * the narrative sections. Two columns and level bars, so the ATS checker flags
 * it — by design, this one is for direct applications.
 */
export function CreativaTemplate({ view }: TemplateProps) {
  const accent = view.accent;

  // Sidebar takes the short sections; the body keeps the long-form ones.
  const sidebarIds = new Set(["skills", "languages"]);
  const sidebar = view.sections.filter((s) => sidebarIds.has(s.id));
  const body = view.sections.filter((s) => !sidebarIds.has(s.id));

  return (
    <div className="flex h-full font-sans">
      <aside
        style={{ backgroundColor: accent }}
        className="w-[34%] shrink-0 px-[22px] py-[34px] text-white"
      >
        {view.showPhoto && (
          <div className="mb-4 flex justify-center">
            <Photo view={view} size={92} />
          </div>
        )}

        <h1 className="text-[19px] leading-[1.15] font-bold tracking-tight">
          {view.fullName}
        </h1>
        <p className="mt-1 text-[10.5px] font-medium opacity-90">
          {view.headline}
        </p>

        {view.contact.length > 0 && (
          <>
            <SectionHeading accent={accent} variant="inverted">
              Contacto
            </SectionHeading>
            <ul className="space-y-1">
              {view.contact.map((line) => (
                <li
                  key={line}
                  className="text-[9.5px] leading-snug break-words opacity-95"
                >
                  {line}
                </li>
              ))}
            </ul>
          </>
        )}

        {view.extras.length > 0 && (
          <ul className="mt-2 space-y-1">
            {view.extras.map((line) => (
              <li key={line} className="text-[9px] leading-snug opacity-80">
                {line}
              </li>
            ))}
          </ul>
        )}

        {sidebar.map((section) => (
          <div key={section.id}>
            <SectionHeading accent={accent} variant="inverted">
              {section.heading}
            </SectionHeading>
            {section.id === "skills" && (
              <SkillsBars view={view} accent={accent} onDark />
            )}
            {section.id === "languages" && (
              <LanguagesList view={view} onDark />
            )}
          </div>
        ))}
      </aside>

      <div className="flex-1 px-[30px] py-[34px]">
        {body.map((section) => (
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
          </section>
        ))}
      </div>
    </div>
  );
}
