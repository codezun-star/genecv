import type {
  Density,
  HeadingStyle,
  NameStyle,
  PhotoShape,
  SkillStyle,
  TemplateMeta,
} from "@/lib/cv/templates";
import type { CvView } from "@/lib/cv/view";

/**
 * Presentation pieces shared by every template.
 *
 * These render inside the A4 sheet, which is scaled with a CSS transform, so
 * sizes are absolute px rather than the app's spacing scale.
 */

export interface Style {
  accent: string;
  design: TemplateMeta["design"];
  density: DensityTokens;
}

export interface DensityTokens {
  padX: number;
  padY: number;
  sectionGap: number;
  itemGap: number;
  body: number;
  heading: number;
  name: number;
  line: number;
}

export const DENSITY: Record<Density, DensityTokens> = {
  airy: {
    padX: 56,
    padY: 52,
    sectionGap: 26,
    itemGap: 16,
    body: 10,
    heading: 11,
    name: 24,
    line: 1.7,
  },
  normal: {
    padX: 48,
    padY: 44,
    sectionGap: 20,
    itemGap: 13,
    body: 10,
    heading: 11,
    name: 22,
    line: 1.55,
  },
  compact: {
    padX: 42,
    padY: 36,
    sectionGap: 14,
    itemGap: 9,
    body: 9.3,
    heading: 10,
    name: 20,
    line: 1.45,
  },
};

const INK = "#1a1a1a";
const BODY = "#333333";
const MUTED = "#666666";

/* --------------------------------------------------------------- Headings */

export function Heading({
  children,
  style,
  onDark = false,
}: {
  children: React.ReactNode;
  style: Style;
  onDark?: boolean;
}) {
  const { accent, density } = style;
  const variant: HeadingStyle = style.design.heading;
  const color = onDark ? "rgba(255,255,255,0.92)" : accent;
  const base = {
    fontSize: density.heading,
    marginTop: density.sectionGap,
    marginBottom: 8,
  };

  if (variant === "bar" && !onDark) {
    return (
      <h2
        style={{ ...base, backgroundColor: accent, color: "#fff" }}
        className="rounded-[2px] px-2 py-[3px] font-bold tracking-[0.12em] uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  if (variant === "boxed" && !onDark) {
    return (
      <h2
        style={{ ...base, color, borderColor: accent }}
        className="inline-block rounded-[2px] border px-2 py-[2px] font-bold tracking-[0.12em] uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  if (variant === "left-accent") {
    return (
      <h2
        style={{ ...base, color, borderColor: color }}
        className="border-l-[3px] pl-2 font-bold tracking-[0.12em] uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  if (variant === "caps-rule") {
    return (
      <h2
        style={{ ...base, color }}
        className="flex items-center gap-3 font-semibold tracking-[0.22em] uppercase first:mt-0"
      >
        <span className="whitespace-nowrap">{children}</span>
        <span
          style={{ backgroundColor: color, opacity: 0.35 }}
          className="h-px flex-1"
        />
      </h2>
    );
  }

  if (variant === "underline") {
    return (
      <h2
        style={{ ...base, color, borderColor: color }}
        className="border-b pb-1 font-bold tracking-[0.14em] uppercase first:mt-0"
      >
        {children}
      </h2>
    );
  }

  return (
    <h2
      style={{ ...base, color }}
      className="font-bold tracking-[0.14em] uppercase first:mt-0"
    >
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------- Name */

export function NameBlock({
  view,
  style,
  onDark = false,
  align = "left",
}: {
  view: CvView;
  style: Style;
  onDark?: boolean;
  align?: "left" | "center";
}) {
  const variant: NameStyle = style.design.name;
  const { density, accent } = style;
  const color = onDark ? "#fff" : variant === "large-light" ? accent : INK;

  const nameClass =
    variant === "uppercase-wide"
      ? "font-extrabold uppercase tracking-[-0.01em]"
      : variant === "large-light"
        ? "font-semibold tracking-[-0.02em]"
        : "font-bold tracking-[-0.02em]";

  return (
    <div className={align === "center" ? "text-center" : undefined}>
      <h1
        style={{ fontSize: density.name, color, lineHeight: 1.12 }}
        className={nameClass}
      >
        {view.fullName}
      </h1>
      <p
        style={{
          fontSize: density.body + 1.5,
          color: onDark ? "rgba(255,255,255,0.9)" : MUTED,
          marginTop: 3,
        }}
        className={
          variant === "uppercase-wide"
            ? "font-medium tracking-[0.08em] uppercase"
            : "font-medium"
        }
      >
        {view.headline}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Content */

export function Summary({ view, style }: { view: CvView; style: Style }) {
  return (
    <p
      style={{
        fontSize: style.density.body,
        lineHeight: style.density.line,
        color: view.summaryIsPlaceholder ? "#9ca3af" : BODY,
      }}
    >
      {view.summary}
    </p>
  );
}

export function ExperienceList({
  view,
  style,
}: {
  view: CvView;
  style: Style;
}) {
  const { density, accent } = style;
  const timeline = style.design.layout === "timeline";

  return (
    <div
      style={timeline ? { borderColor: `${accent}33` } : undefined}
      className={timeline ? "border-l pl-4" : undefined}
    >
      {view.experience.map((item, i) => (
        <div
          key={item.id}
          style={{ marginTop: i === 0 ? 0 : density.itemGap }}
          className={timeline ? "relative" : undefined}
        >
          {timeline && (
            <span
              style={{ backgroundColor: accent, left: -21, top: 4 }}
              className="absolute size-[7px] rounded-full ring-2 ring-white"
            />
          )}
          <div className="flex items-baseline justify-between gap-3">
            <h3
              style={{ fontSize: density.body + 1.5, color: INK }}
              className="font-bold"
            >
              {item.position}
            </h3>
            {item.dates && (
              <span
                style={{ fontSize: density.body - 0.5, color: MUTED }}
                className="shrink-0"
              >
                {item.dates}
              </span>
            )}
          </div>
          <p
            style={{ fontSize: density.body + 0.5, color: accent }}
            className="font-semibold"
          >
            {item.company}
            {item.location && (
              <span style={{ color: MUTED }} className="font-normal">
                {" "}
                · {item.location}
              </span>
            )}
          </p>
          {item.achievements.length > 0 && (
            <ul style={{ marginTop: 3 }}>
              {item.achievements.map((line, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: density.body,
                    lineHeight: density.line,
                    color: BODY,
                  }}
                  className="relative pl-3"
                >
                  <span
                    style={{ backgroundColor: accent, top: 6 }}
                    className="absolute left-0 size-[3px] rounded-full"
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

export function EducationList({ view, style }: { view: CvView; style: Style }) {
  const { density, accent } = style;

  return (
    <div>
      {view.education.map((item, i) => (
        <div key={item.id} style={{ marginTop: i === 0 ? 0 : density.itemGap }}>
          <div className="flex items-baseline justify-between gap-3">
            <h3
              style={{ fontSize: density.body + 1.5, color: INK }}
              className="font-bold"
            >
              {item.degree}
            </h3>
            {item.dates && (
              <span
                style={{ fontSize: density.body - 0.5, color: MUTED }}
                className="shrink-0"
              >
                {item.dates}
              </span>
            )}
          </div>
          <p
            style={{ fontSize: density.body + 0.5, color: accent }}
            className="font-semibold"
          >
            {item.institution}
            {item.location && (
              <span style={{ color: MUTED }} className="font-normal">
                {" "}
                · {item.location}
              </span>
            )}
          </p>
          {item.description && (
            <p
              style={{
                fontSize: density.body,
                lineHeight: density.line,
                color: BODY,
              }}
            >
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function Skills({
  view,
  style,
  onDark = false,
}: {
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  const { density, accent } = style;
  const variant: SkillStyle = style.design.skills;
  const textColor = onDark ? "rgba(255,255,255,0.95)" : BODY;

  if (variant === "bars") {
    return (
      <div className="space-y-[6px]">
        {view.skills.map((skill) => (
          <div key={skill.id}>
            <p
              style={{ fontSize: density.body, color: textColor }}
              className="font-medium"
            >
              {skill.name}
            </p>
            <div
              style={{
                backgroundColor: onDark ? "rgba(255,255,255,0.25)" : "#e5e7eb",
              }}
              className="mt-[2px] h-[3px] w-full rounded-full"
            >
              <div
                style={{
                  width: `${skill.level * 20}%`,
                  backgroundColor: onDark ? "#fff" : accent,
                }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className="flex flex-wrap gap-[4px]">
        {view.skills.map((skill) => (
          <span
            key={skill.id}
            style={{
              fontSize: density.body - 0.7,
              color: onDark ? "#fff" : accent,
              backgroundColor: onDark ? "rgba(255,255,255,0.18)" : `${accent}14`,
              borderColor: onDark ? "rgba(255,255,255,0.3)" : `${accent}33`,
            }}
            className="rounded-full border px-[7px] py-[2px] font-medium"
          >
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  if (variant === "rows") {
    return (
      <ul className="space-y-[2px]">
        {view.skills.map((skill) => (
          <li
            key={skill.id}
            style={{ fontSize: density.body, color: textColor }}
            className="flex justify-between gap-2"
          >
            <span className="font-medium">{skill.name}</span>
            <span style={{ opacity: 0.7 }}>{skill.levelLabel}</span>
          </li>
        ))}
      </ul>
    );
  }

  // "text" — the ATS-safe presentation: level written out, no graphics.
  return (
    <p
      style={{
        fontSize: density.body,
        lineHeight: density.line,
        color: textColor,
      }}
    >
      {view.skills.map((s) => `${s.name} (${s.levelLabel})`).join(" · ")}
    </p>
  );
}

export function Languages({
  view,
  style,
  onDark = false,
}: {
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  return (
    <ul className="space-y-[2px]">
      {view.languages.map((language) => (
        <li
          key={language.id}
          style={{
            fontSize: style.density.body,
            color: onDark ? "rgba(255,255,255,0.95)" : BODY,
          }}
          className="flex justify-between gap-2"
        >
          <span className="font-medium">{language.name}</span>
          <span style={{ opacity: 0.72 }}>{language.levelLabel}</span>
        </li>
      ))}
    </ul>
  );
}

export function ContactList({
  view,
  style,
  onDark = false,
}: {
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  return (
    <ul className="space-y-[3px]">
      {view.contact.map((line) => (
        <li
          key={line}
          style={{
            fontSize: style.density.body - 0.5,
            color: onDark ? "rgba(255,255,255,0.95)" : BODY,
          }}
          className="leading-snug break-words"
        >
          {line}
        </li>
      ))}
      {view.extras.map((line) => (
        <li
          key={line}
          style={{
            fontSize: style.density.body - 1,
            color: onDark ? "rgba(255,255,255,0.8)" : MUTED,
          }}
          className="leading-snug break-words"
        >
          {line}
        </li>
      ))}
    </ul>
  );
}

/* eslint-disable @next/next/no-img-element -- the photo is a local data URL,
   never a remote asset, so next/image adds nothing here. */
export function Photo({
  view,
  size,
  shape,
}: {
  view: CvView;
  size: number;
  shape: PhotoShape;
}) {
  if (!view.showPhoto || !view.photo) return null;

  const radius =
    shape === "circle" ? "9999px" : shape === "rounded" ? "8px" : "3px";

  return (
    <img
      src={view.photo}
      alt=""
      style={{ width: size, height: size, borderRadius: radius }}
      className="shrink-0 object-cover"
    />
  );
}
