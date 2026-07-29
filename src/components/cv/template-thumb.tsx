import { isAtsSafe, type TemplateMeta } from "@/lib/cv/templates";
import { cn } from "@/lib/utils";

/**
 * Abstract miniature of a template, drawn from its design config so the
 * gallery always reflects what the renderer actually produces.
 */
export function TemplateThumb({
  template,
  className,
}: {
  template: TemplateMeta;
  className?: string;
}) {
  const accent = template.monochrome ? "#1a1a1a" : template.accent;
  const { layout, skills } = template.design;

  const sidebar = layout === "sidebar-left" || layout === "sidebar-right";

  return (
    <div
      className={cn("flex h-full w-full bg-white", className)}
      aria-hidden
      data-layout={layout}
    >
      {layout === "sidebar-left" && (
        <Sidebar accent={accent} skills={skills} filled />
      )}

      <div className="flex flex-1 flex-col p-2.5">
        {layout === "header-band" ? (
          <div
            className="-m-2.5 mb-2 p-2.5"
            style={{ backgroundColor: accent }}
          >
            <div className="mb-1 h-1.5 w-3/5 rounded-full bg-white/85" />
            <div className="h-1 w-2/5 rounded-full bg-white/45" />
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mb-1 h-1.5 rounded-full",
                layout === "split-header" ? "w-4/5" : "w-3/5",
              )}
              style={{ backgroundColor: accent }}
            />
            <div className="mb-1 h-1 w-2/5 rounded-full bg-[#c3cbd4]" />
            {layout === "split-header" && (
              <div
                className="mt-1 mb-2 h-[2px] w-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </>
        )}

        <div className={cn("flex-1", layout === "split-header" && "flex gap-2")}>
          <div className={layout === "split-header" ? "w-3/5" : undefined}>
            <Block accent={accent} lines={3} template={template} />
            <Block accent={accent} lines={2} template={template} />
            {!sidebar && layout !== "split-header" && (
              <Block accent={accent} lines={2} template={template} />
            )}
          </div>
          {layout === "split-header" && (
            <div className="w-2/5">
              <Block accent={accent} lines={2} template={template} />
              <Block accent={accent} lines={2} template={template} />
            </div>
          )}
        </div>
      </div>

      {layout === "sidebar-right" && (
        <Sidebar accent={accent} skills={skills} filled={false} />
      )}
    </div>
  );
}

function Sidebar({
  accent,
  skills,
  filled,
}: {
  accent: string;
  skills: TemplateMeta["design"]["skills"];
  filled: boolean;
}) {
  return (
    <div
      className={cn("shrink-0 p-2", filled ? "w-1/3" : "w-[30%] border-l border-[#e5e7eb]")}
      style={filled ? { backgroundColor: accent } : undefined}
    >
      {filled && <div className="mx-auto mb-2 size-6 rounded-full bg-white/35" />}
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 rounded-full"
            style={{
              backgroundColor: filled ? "rgba(255,255,255,0.32)" : "#dfe3e8",
              width: skills === "bars" && i > 1 ? `${100 - i * 12}%` : "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Block({
  accent,
  lines,
  template,
}: {
  accent: string;
  lines: number;
  template: TemplateMeta;
}) {
  const { heading, skills } = template.design;

  return (
    <div className="mb-2.5">
      {heading === "bar" ? (
        <div
          className="mb-1 h-[3px] w-1/2 rounded-[1px]"
          style={{ backgroundColor: accent }}
        />
      ) : heading === "boxed" ? (
        <div
          className="mb-1 h-[4px] w-1/2 rounded-[1px] border"
          style={{ borderColor: accent }}
        />
      ) : heading === "left-accent" ? (
        <div className="mb-1 flex items-center gap-1">
          <div
            className="h-[4px] w-[2px]"
            style={{ backgroundColor: accent }}
          />
          <div
            className="h-1 w-2/5 rounded-full opacity-70"
            style={{ backgroundColor: accent }}
          />
        </div>
      ) : heading === "caps-rule" ? (
        <div className="mb-1 flex items-center gap-1">
          <div
            className="h-1 w-1/3 rounded-full opacity-70"
            style={{ backgroundColor: accent }}
          />
          <div className="h-px flex-1" style={{ backgroundColor: `${accent}55` }} />
        </div>
      ) : (
        <div
          className={cn(
            "mb-1 h-1 w-1/3 rounded-full opacity-70",
            heading === "underline" && "border-b pb-0.5",
          )}
          style={{
            backgroundColor: accent,
            borderColor: heading === "underline" ? accent : undefined,
          }}
        />
      )}

      {skills === "pills" && lines === 2 ? (
        <div className="flex flex-wrap gap-[2px]">
          {[8, 12, 9, 11].map((w, i) => (
            <div
              key={i}
              className="h-[4px] rounded-full"
              style={{ width: w, backgroundColor: `${accent}33` }}
            />
          ))}
        </div>
      ) : (
        Array.from({ length: lines }).map((_, j) => (
          <div key={j} className="mb-0.5 h-0.5 rounded-full bg-[#e9eaec]" />
        ))
      )}
    </div>
  );
}

/** Small "ATS" pill shown next to parser-safe designs. */
export function atsBadgeVisible(template: TemplateMeta) {
  return isAtsSafe(template);
}
