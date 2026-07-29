import {
  EducationBlock,
  ExperienceBlock,
  LanguagesList,
  Photo,
  SectionHeading,
  Summary,
  type TemplateProps,
} from "@/components/cv/templates/shared";

/**
 * Narrow tinted sidebar and a high-contrast serif-weight name. Aimed at senior
 * profiles with a long track record: the body column gets most of the width.
 */
export function EjecutivaTemplate({ view }: TemplateProps) {
  const accent = view.accent;

  const sidebarIds = new Set(["skills", "languages"]);
  const sidebar = view.sections.filter((s) => sidebarIds.has(s.id));
  const body = view.sections.filter((s) => !sidebarIds.has(s.id));

  return (
    <div className="h-full font-sans">
      <header className="flex items-center gap-4 px-[44px] pt-[38px] pb-4">
        <Photo view={view} size={66} rounded={false} />
        <div className="min-w-0 flex-1">
          <h1
            style={{ color: accent }}
            className="text-[25px] leading-none font-extrabold tracking-[-0.02em] uppercase"
          >
            {view.fullName}
          </h1>
          <p className="mt-1.5 text-[11px] font-medium tracking-[0.06em] text-[#555] uppercase">
            {view.headline}
          </p>
        </div>
      </header>

      <div style={{ backgroundColor: accent }} className="mx-[44px] h-[2px]" />

      <div className="flex px-[44px] pt-4 pb-[38px]">
        <div className="w-[64%] pr-6">
          {body.map((section) => (
            <section key={section.id}>
              <SectionHeading accent={accent} variant="plain">
                {section.heading}
              </SectionHeading>

              {section.id === "summary" && <Summary view={view} />}
              {section.id === "experience" && (
                <ExperienceBlock view={view} accent={accent} compact />
              )}
              {section.id === "education" && (
                <EducationBlock view={view} accent={accent} />
              )}
            </section>
          ))}
        </div>

        <aside className="w-[36%] border-l border-[#e5e7eb] pl-5">
          {view.contact.length > 0 && (
            <>
              <SectionHeading accent={accent} variant="plain">
                Contacto
              </SectionHeading>
              <ul className="space-y-1">
                {view.contact.map((line) => (
                  <li
                    key={line}
                    className="text-[9.5px] leading-snug break-words text-[#333]"
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
                <li key={line} className="text-[9px] leading-snug text-[#666]">
                  {line}
                </li>
              ))}
            </ul>
          )}

          {sidebar.map((section) => (
            <div key={section.id}>
              <SectionHeading accent={accent} variant="plain">
                {section.heading}
              </SectionHeading>
              {section.id === "skills" && (
                // Text, not bars: keeps the level readable for a parser.
                <ul className="space-y-0.5">
                  {view.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex justify-between gap-2 text-[9.5px] text-[#333]"
                    >
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-[#777]">{skill.levelLabel}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.id === "languages" && <LanguagesList view={view} />}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
