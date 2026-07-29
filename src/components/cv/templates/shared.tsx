import type { CvView } from "@/lib/cv/view";

/**
 * Building blocks reused by the on-screen templates.
 *
 * These render inside the A4 sheet, which is scaled with a CSS transform, so
 * everything here uses absolute px units rather than the app's spacing scale.
 */

export interface TemplateProps {
  view: CvView;
}

export function SectionHeading({
  children,
  accent,
  variant = "underline",
}: {
  children: React.ReactNode;
  accent: string;
  variant?: "underline" | "plain" | "bar" | "inverted";
}) {
  if (variant === "inverted") {
    return (
      <h2
        style={{ color: "#fff" }}
        className="mt-5 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase opacity-90 first:mt-0"
      >
        {children}
      </h2>
    );
  }

  if (variant === "bar") {
    return (
      <h2
        style={{ backgroundColor: accent }}
        className="mt-5 mb-3 rounded-[2px] px-2 py-1 text-[10.5px] font-bold tracking-[0.12em] text-white uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  if (variant === "plain") {
    return (
      <h2
        style={{ color: accent }}
        className="mt-5 mb-2 text-[11px] font-bold tracking-[0.14em] uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  return (
    <h2
      style={{ color: accent, borderColor: accent }}
      className="mt-5 mb-2.5 border-b pb-1 text-[11px] font-bold tracking-[0.14em] uppercase first:mt-0"
    >
      {children}
    </h2>
  );
}

export function ExperienceBlock({
  view,
  accent,
  compact = false,
}: {
  view: CvView;
  accent: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2.5" : "space-y-3.5"}>
      {view.experience.map((item) => (
        <div key={item.id}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[11.5px] font-bold text-[#1a1a1a]">
              {item.position}
            </h3>
            {item.dates && (
              <span className="shrink-0 text-[9.5px] text-[#666]">
                {item.dates}
              </span>
            )}
          </div>
          <p style={{ color: accent }} className="text-[10.5px] font-semibold">
            {item.company}
            {item.location && (
              <span className="font-normal text-[#666]"> · {item.location}</span>
            )}
          </p>
          {item.achievements.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {item.achievements.map((line, i) => (
                <li
                  key={i}
                  className="relative pl-3 text-[10px] leading-[1.5] text-[#333]"
                >
                  <span
                    style={{ backgroundColor: accent }}
                    className="absolute top-[6px] left-0 size-[3px] rounded-full"
                  />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function EducationBlock({
  view,
  accent,
}: {
  view: CvView;
  accent: string;
}) {
  return (
    <div className="space-y-2.5">
      {view.education.map((item) => (
        <div key={item.id}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[11.5px] font-bold text-[#1a1a1a]">
              {item.degree}
            </h3>
            {item.dates && (
              <span className="shrink-0 text-[9.5px] text-[#666]">
                {item.dates}
              </span>
            )}
          </div>
          <p style={{ color: accent }} className="text-[10.5px] font-semibold">
            {item.institution}
            {item.location && (
              <span className="font-normal text-[#666]"> · {item.location}</span>
            )}
          </p>
          {item.description && (
            <p className="mt-0.5 text-[10px] leading-[1.5] text-[#333]">
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Skills as plain text — the ATS-safe presentation. */
export function SkillsText({ view }: { view: CvView }) {
  return (
    <p className="text-[10px] leading-[1.6] text-[#333]">
      {view.skills
        .map((skill) => `${skill.name} (${skill.levelLabel})`)
        .join(" · ")}
    </p>
  );
}

/** Skills with a level bar — looks better, but the level is invisible to ATS. */
export function SkillsBars({
  view,
  accent,
  onDark = false,
}: {
  view: CvView;
  accent: string;
  onDark?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {view.skills.map((skill) => (
        <div key={skill.id}>
          <p
            className="text-[10px] font-medium"
            style={{ color: onDark ? "rgba(255,255,255,0.95)" : "#333" }}
          >
            {skill.name}
          </p>
          <div
            className="mt-0.5 h-[3px] w-full rounded-full"
            style={{
              backgroundColor: onDark ? "rgba(255,255,255,0.25)" : "#e5e7eb",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${skill.level * 20}%`,
                backgroundColor: onDark ? "#fff" : accent,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LanguagesList({
  view,
  onDark = false,
}: {
  view: CvView;
  onDark?: boolean;
}) {
  return (
    <ul className="space-y-1">
      {view.languages.map((language) => (
        <li
          key={language.id}
          className="flex justify-between gap-2 text-[10px]"
          style={{ color: onDark ? "rgba(255,255,255,0.95)" : "#333" }}
        >
          <span className="font-medium">{language.name}</span>
          <span style={{ opacity: 0.75 }}>{language.levelLabel}</span>
        </li>
      ))}
    </ul>
  );
}

export function Summary({
  view,
  className = "",
}: {
  view: CvView;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] leading-[1.6] ${className}`}
      style={{ color: view.summaryIsPlaceholder ? "#9ca3af" : "#333" }}
    >
      {view.summary}
    </p>
  );
}

/* eslint-disable @next/next/no-img-element -- the photo is a local data URL,
   never a remote asset, so next/image adds nothing here. */
export function Photo({
  view,
  size = 72,
  rounded = true,
}: {
  view: CvView;
  size?: number;
  rounded?: boolean;
}) {
  if (!view.showPhoto || !view.photo) return null;

  return (
    <img
      src={view.photo}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 object-cover ${rounded ? "rounded-full" : "rounded-[3px]"}`}
    />
  );
}
