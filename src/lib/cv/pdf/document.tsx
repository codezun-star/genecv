/* eslint-disable jsx-a11y/alt-text -- @react-pdf's <Image> has no alt prop. */
import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import { getTemplate, type TemplateMeta } from "@/lib/cv/templates";
import type { SectionId } from "@/lib/cv/types";
import type { CvView } from "@/lib/cv/view";

/** @react-pdf exports `Styles` (a map); a single rule is its value type. */
type PdfStyle = NonNullable<React.ComponentProps<typeof View>["style"]>;

/**
 * PDF counterpart of the on-screen renderer, driven by the same design config
 * so a template can only ever look one way.
 *
 * Typeface: Helvetica, one of the 14 fonts every PDF reader has built in. It
 * keeps the file small, needs no network fetch, and — the reason that matters
 * here — extracts as clean text, which is exactly what an ATS reads. The
 * preview uses Inter; both are neo-grotesques, so line breaks match closely.
 *
 * Sizes are the preview's px values × 0.75 (96dpi → 72pt).
 */

const PT = 0.75;
const INK = "#1a1a1a";
const BODY = "#333333";
const MUTED = "#666666";
const RULE = "#e5e7eb";

interface Tokens {
  padX: number;
  padY: number;
  sectionGap: number;
  itemGap: number;
  body: number;
  heading: number;
  name: number;
  line: number;
}

const DENSITY: Record<TemplateMeta["design"]["density"], Tokens> = {
  airy: {
    padX: 56 * PT,
    padY: 52 * PT,
    sectionGap: 26 * PT,
    itemGap: 16 * PT,
    body: 10 * PT,
    heading: 11 * PT,
    name: 24 * PT,
    line: 1.7,
  },
  normal: {
    padX: 48 * PT,
    padY: 44 * PT,
    sectionGap: 20 * PT,
    itemGap: 13 * PT,
    body: 10 * PT,
    heading: 11 * PT,
    name: 22 * PT,
    line: 1.55,
  },
  compact: {
    padX: 42 * PT,
    padY: 36 * PT,
    sectionGap: 14 * PT,
    itemGap: 9 * PT,
    body: 9.3 * PT,
    heading: 10 * PT,
    name: 20 * PT,
    line: 1.45,
  },
};

interface Ctx {
  view: CvView;
  design: TemplateMeta["design"];
  accent: string;
  t: Tokens;
}

/* -------------------------------------------------------------- Headings */

function Heading({
  children,
  ctx,
  onDark = false,
}: {
  children: string;
  ctx: Ctx;
  onDark?: boolean;
}) {
  const { t, accent, design } = ctx;
  const color = onDark ? "rgba(255,255,255,0.92)" : accent;
  const base: PdfStyle = {
    fontSize: t.heading,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: t.sectionGap,
    marginBottom: 6,
    color,
  };

  if (design.heading === "bar" && !onDark) {
    return (
      <Text
        style={{
          ...base,
          color: "#ffffff",
          backgroundColor: accent,
          paddingHorizontal: 5,
          paddingVertical: 2.5,
          borderRadius: 1.5,
        }}
      >
        {children}
      </Text>
    );
  }

  if (design.heading === "boxed" && !onDark) {
    return (
      <Text
        style={{
          ...base,
          borderWidth: 0.75,
          borderColor: accent,
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderRadius: 1.5,
          alignSelf: "flex-start",
        }}
      >
        {children}
      </Text>
    );
  }

  if (design.heading === "left-accent") {
    return (
      <Text
        style={{
          ...base,
          borderLeftWidth: 2.25,
          borderLeftColor: color,
          paddingLeft: 5,
        }}
      >
        {children}
      </Text>
    );
  }

  if (design.heading === "underline") {
    return (
      <Text
        style={{
          ...base,
          letterSpacing: 1.2,
          borderBottomWidth: 0.75,
          borderBottomColor: color,
          paddingBottom: 3,
        }}
      >
        {children}
      </Text>
    );
  }

  if (design.heading === "caps-rule") {
    // A hairline can't sit inline with text in @react-pdf, so the rule goes
    // underneath at low opacity — visually equivalent to the preview.
    return (
      <View style={{ marginTop: t.sectionGap, marginBottom: 6 }}>
        <Text
          style={{
            fontSize: t.heading,
            fontFamily: "Helvetica-Bold",
            letterSpacing: 2,
            textTransform: "uppercase",
            color,
          }}
        >
          {children}
        </Text>
        <View
          style={{ height: 0.5, backgroundColor: color, opacity: 0.35, marginTop: 3 }}
        />
      </View>
    );
  }

  return <Text style={base}>{children}</Text>;
}

/* ------------------------------------------------------------------ Name */

function NameBlock({ ctx, onDark = false }: { ctx: Ctx; onDark?: boolean }) {
  const { t, view, design, accent } = ctx;
  const color = onDark
    ? "#ffffff"
    : design.name === "large-light"
      ? accent
      : INK;

  return (
    <View>
      <Text
        style={{
          fontSize: t.name,
          fontFamily: "Helvetica-Bold",
          color,
          // Explicit: the inherited page leading leaves the next line sitting
          // on the descenders of the name.
          lineHeight: 1.2,
          letterSpacing: design.name === "uppercase-wide" ? -0.1 : -0.3,
          textTransform:
            design.name === "uppercase-wide" ? "uppercase" : "none",
        }}
      >
        {view.fullName}
      </Text>
      <Text
        style={{
          fontSize: t.body + 1.5 * PT,
          color: onDark ? "rgba(255,255,255,0.9)" : MUTED,
          marginTop: 2.5,
          lineHeight: 1.3,
          letterSpacing: design.name === "uppercase-wide" ? 0.6 : 0,
          textTransform:
            design.name === "uppercase-wide" ? "uppercase" : "none",
        }}
      >
        {view.headline}
      </Text>
    </View>
  );
}

/* --------------------------------------------------------------- Content */

function Summary({ ctx }: { ctx: Ctx }) {
  const { t, view } = ctx;
  return (
    <Text
      style={{
        fontSize: t.body,
        lineHeight: t.line,
        color: view.summaryIsPlaceholder ? "#9ca3af" : BODY,
      }}
    >
      {view.summary}
    </Text>
  );
}

function ExperienceList({ ctx }: { ctx: Ctx }) {
  const { t, view, accent, design } = ctx;
  const timeline = design.layout === "timeline";

  return (
    <View
      style={
        timeline
          ? { borderLeftWidth: 0.75, borderLeftColor: `${accent}55`, paddingLeft: 10 }
          : {}
      }
    >
      {view.experience.map((item, i) => (
        <View key={item.id} style={{ marginTop: i === 0 ? 0 : t.itemGap }} wrap={false}>
          {timeline && (
            <View
              style={{
                position: "absolute",
                left: -12.6,
                top: 3,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: accent,
              }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Text
              style={{
                fontSize: t.body + 1.5 * PT,
                fontFamily: "Helvetica-Bold",
                color: INK,
              }}
            >
              {item.position}
            </Text>
            {item.dates ? (
              <Text style={{ fontSize: t.body - 0.5 * PT, color: MUTED }}>
                {item.dates}
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              fontSize: t.body + 0.5 * PT,
              fontFamily: "Helvetica-Bold",
              color: accent,
              marginTop: 1,
            }}
          >
            {item.company}
            {item.location ? (
              <Text style={{ fontFamily: "Helvetica", color: MUTED }}>
                {" "}
                · {item.location}
              </Text>
            ) : null}
          </Text>
          {item.achievements.map((line, j) => (
            <View key={j} style={{ flexDirection: "row", marginTop: 2 }}>
              <Text style={{ width: 7, fontSize: t.body, color: accent }}>•</Text>
              <Text style={{ flex: 1, fontSize: t.body, lineHeight: t.line, color: BODY }}>
                {line}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function EducationList({ ctx }: { ctx: Ctx }) {
  const { t, view, accent } = ctx;

  return (
    <View>
      {view.education.map((item, i) => (
        <View key={item.id} style={{ marginTop: i === 0 ? 0 : t.itemGap }} wrap={false}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Text
              style={{
                fontSize: t.body + 1.5 * PT,
                fontFamily: "Helvetica-Bold",
                color: INK,
              }}
            >
              {item.degree}
            </Text>
            {item.dates ? (
              <Text style={{ fontSize: t.body - 0.5 * PT, color: MUTED }}>
                {item.dates}
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              fontSize: t.body + 0.5 * PT,
              fontFamily: "Helvetica-Bold",
              color: accent,
              marginTop: 1,
            }}
          >
            {item.institution}
            {item.location ? (
              <Text style={{ fontFamily: "Helvetica", color: MUTED }}>
                {" "}
                · {item.location}
              </Text>
            ) : null}
          </Text>
          {item.description ? (
            <Text style={{ fontSize: t.body, lineHeight: t.line, color: BODY }}>
              {item.description}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function Skills({ ctx, onDark = false }: { ctx: Ctx; onDark?: boolean }) {
  const { t, view, accent, design } = ctx;
  const color = onDark ? "#ffffff" : BODY;

  if (design.skills === "bars") {
    return (
      <View>
        {view.skills.map((skill) => (
          <View key={skill.id} style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: t.body, color }}>{skill.name}</Text>
            <View
              style={{
                height: 2.25,
                marginTop: 1.5,
                borderRadius: 2,
                backgroundColor: onDark ? "rgba(255,255,255,0.25)" : RULE,
              }}
            >
              <View
                style={{
                  height: 2.25,
                  borderRadius: 2,
                  width: `${skill.level * 20}%`,
                  backgroundColor: onDark ? "#ffffff" : accent,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (design.skills === "pills") {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {view.skills.map((skill) => (
          <Text
            key={skill.id}
            style={{
              fontSize: t.body - 0.7 * PT,
              color: onDark ? "#ffffff" : accent,
              backgroundColor: onDark ? "rgba(255,255,255,0.18)" : `${accent}14`,
              borderWidth: 0.5,
              borderColor: onDark ? "rgba(255,255,255,0.3)" : `${accent}44`,
              borderRadius: 6,
              paddingHorizontal: 4,
              paddingVertical: 1.5,
              marginRight: 3,
              marginBottom: 3,
            }}
          >
            {skill.name}
          </Text>
        ))}
      </View>
    );
  }

  if (design.skills === "rows") {
    return (
      <View>
        {view.skills.map((skill) => (
          <View
            key={skill.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: t.body, fontFamily: "Helvetica-Bold", color }}>
              {skill.name}
            </Text>
            <Text style={{ fontSize: t.body, color, opacity: 0.7 }}>
              {skill.levelLabel}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Text style={{ fontSize: t.body, lineHeight: t.line, color }}>
      {view.skills.map((s) => `${s.name} (${s.levelLabel})`).join(" · ")}
    </Text>
  );
}

function Languages({ ctx, onDark = false }: { ctx: Ctx; onDark?: boolean }) {
  const { t, view } = ctx;
  const color = onDark ? "#ffffff" : BODY;

  return (
    <View>
      {view.languages.map((language) => (
        <View
          key={language.id}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Text style={{ fontSize: t.body, fontFamily: "Helvetica-Bold", color }}>
            {language.name}
          </Text>
          <Text style={{ fontSize: t.body, color, opacity: 0.72 }}>
            {language.levelLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ContactList({ ctx, onDark = false }: { ctx: Ctx; onDark?: boolean }) {
  const { t, view } = ctx;

  return (
    <View>
      {view.contact.map((line) => (
        <Text
          key={line}
          style={{
            fontSize: t.body - 0.5 * PT,
            color: onDark ? "rgba(255,255,255,0.95)" : BODY,
            marginBottom: 1.5,
          }}
        >
          {line}
        </Text>
      ))}
      {view.extras.map((line) => (
        <Text
          key={line}
          style={{
            fontSize: t.body - 1 * PT,
            color: onDark ? "rgba(255,255,255,0.8)" : MUTED,
            marginTop: 1.5,
          }}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

function ContactInline({ ctx, onDark = false }: { ctx: Ctx; onDark?: boolean }) {
  const { t, view } = ctx;
  if (view.contact.length === 0 && view.extras.length === 0) return null;

  return (
    <View>
      <Text
        style={{
          fontSize: t.body - 0.5 * PT,
          color: onDark ? "rgba(255,255,255,0.88)" : "#555555",
          lineHeight: 1.5,
        }}
      >
        {view.contact.join("  |  ")}
      </Text>
      {view.extras.length > 0 ? (
        <Text
          style={{
            fontSize: t.body - 0.5 * PT,
            color: onDark ? "rgba(255,255,255,0.75)" : MUTED,
            marginTop: 1.5,
          }}
        >
          {view.extras.join("  |  ")}
        </Text>
      ) : null}
    </View>
  );
}

function SectionBody({
  id,
  ctx,
  onDark = false,
}: {
  id: SectionId;
  ctx: Ctx;
  onDark?: boolean;
}) {
  if (id === "summary") return <Summary ctx={ctx} />;
  if (id === "experience") return <ExperienceList ctx={ctx} />;
  if (id === "education") return <EducationList ctx={ctx} />;
  if (id === "skills") return <Skills ctx={ctx} onDark={onDark} />;
  if (id === "languages") return <Languages ctx={ctx} onDark={onDark} />;
  return null;
}

function Sections({
  sections,
  ctx,
  onDark = false,
}: {
  sections: CvView["sections"];
  ctx: Ctx;
  onDark?: boolean;
}) {
  return (
    <View>
      {sections.map((section) => (
        <View key={section.id}>
          <Heading ctx={ctx} onDark={onDark}>
            {section.heading}
          </Heading>
          <SectionBody id={section.id} ctx={ctx} onDark={onDark} />
        </View>
      ))}
    </View>
  );
}

function splitSections(ctx: Ctx) {
  const ids = new Set(ctx.design.sidebarSections ?? []);
  return {
    sidebar: ctx.view.sections.filter((s) =>
      ids.has(s.id as "skills" | "languages"),
    ),
    body: ctx.view.sections.filter(
      (s) => !ids.has(s.id as "skills" | "languages"),
    ),
  };
}

function photoRadius(shape: TemplateMeta["design"]["photo"], size: number) {
  if (shape === "circle") return size / 2;
  if (shape === "rounded") return 6;
  return 2;
}

/* --------------------------------------------------------------- Layouts */

const pageBase = (t: Tokens): PdfStyle => ({
  fontFamily: "Helvetica",
  fontSize: t.body,
  color: BODY,
  lineHeight: t.line,
});

function SingleColumn({ ctx }: { ctx: Ctx }) {
  const { t, accent } = ctx;

  return (
    <Page
      size="A4"
      style={{
        ...pageBase(t),
        paddingHorizontal: t.padX,
        paddingVertical: t.padY,
      }}
    >
      <View style={{ borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 6 }}>
        <NameBlock ctx={ctx} />
        <View style={{ marginTop: 6 }}>
          <ContactInline ctx={ctx} />
        </View>
      </View>
      <Sections sections={ctx.view.sections} ctx={ctx} />
    </Page>
  );
}

function HeaderBand({ ctx }: { ctx: Ctx }) {
  const { t, accent, view, design } = ctx;
  const size = 51;

  return (
    <Page size="A4" style={pageBase(t)}>
      <View
        style={{
          backgroundColor: accent,
          paddingHorizontal: t.padX,
          paddingVertical: t.padY * 0.7,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {view.showPhoto && view.photo ? (
          <Image
            src={view.photo}
            style={{
              width: size,
              height: size,
              borderRadius: photoRadius(design.photo, size),
              marginRight: 12,
            }}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <NameBlock ctx={ctx} onDark />
          <View style={{ marginTop: 5 }}>
            <ContactInline ctx={ctx} onDark />
          </View>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: t.padX,
          paddingTop: t.padY * 0.55,
          paddingBottom: t.padY * 0.6,
        }}
      >
        <Sections sections={view.sections} ctx={ctx} />
      </View>
    </Page>
  );
}

function SidebarLeft({ ctx }: { ctx: Ctx }) {
  const { t, accent, view, design } = ctx;
  const { sidebar, body } = splitSections(ctx);
  const size = 69;

  return (
    <Page size="A4" style={{ ...pageBase(t), flexDirection: "row" }}>
      <View
        style={{
          width: "34%",
          backgroundColor: accent,
          paddingHorizontal: 16,
          paddingVertical: t.padY * 0.8,
        }}
      >
        {view.showPhoto && view.photo ? (
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Image
              src={view.photo}
              style={{
                width: size,
                height: size,
                borderRadius: photoRadius(design.photo, size),
              }}
            />
          </View>
        ) : null}

        <NameBlock ctx={ctx} onDark />

        {view.contact.length > 0 || view.extras.length > 0 ? (
          <>
            <Heading ctx={ctx} onDark>
              Contacto
            </Heading>
            <ContactList ctx={ctx} onDark />
          </>
        ) : null}

        <Sections sections={sidebar} ctx={ctx} onDark />
      </View>

      <View
        style={{ flex: 1, paddingHorizontal: 22, paddingVertical: t.padY * 0.8 }}
      >
        <Sections sections={body} ctx={ctx} />
      </View>
    </Page>
  );
}

function SidebarRight({ ctx }: { ctx: Ctx }) {
  const { t, accent, view, design } = ctx;
  const { sidebar, body } = splitSections(ctx);
  const size = 49;

  return (
    <Page size="A4" style={pageBase(t)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: t.padX,
          paddingTop: t.padY * 0.85,
          paddingBottom: 8,
        }}
      >
        {view.showPhoto && view.photo ? (
          <Image
            src={view.photo}
            style={{
              width: size,
              height: size,
              borderRadius: photoRadius(design.photo, size),
              marginRight: 12,
            }}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <NameBlock ctx={ctx} />
        </View>
      </View>

      <View
        style={{ height: 1.5, backgroundColor: accent, marginHorizontal: t.padX }}
      />

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: t.padX,
          paddingTop: 10,
          paddingBottom: t.padY * 0.85,
        }}
      >
        <View style={{ width: "64%", paddingRight: 18 }}>
          <Sections sections={body} ctx={ctx} />
        </View>
        <View
          style={{
            width: "36%",
            borderLeftWidth: 0.75,
            borderLeftColor: RULE,
            paddingLeft: 14,
          }}
        >
          {view.contact.length > 0 || view.extras.length > 0 ? (
            <>
              <Heading ctx={ctx}>Contacto</Heading>
              <ContactList ctx={ctx} />
            </>
          ) : null}
          <Sections sections={sidebar} ctx={ctx} />
        </View>
      </View>
    </Page>
  );
}

function SplitHeader({ ctx }: { ctx: Ctx }) {
  const { t, accent } = ctx;
  const { sidebar, body } = splitSections(ctx);

  return (
    <Page
      size="A4"
      style={{
        ...pageBase(t),
        paddingHorizontal: t.padX,
        paddingVertical: t.padY,
      }}
    >
      <NameBlock ctx={ctx} />
      <View style={{ height: 2.25, backgroundColor: accent, marginTop: 9 }} />
      <View style={{ marginTop: 6 }}>
        <ContactInline ctx={ctx} />
      </View>

      <View style={{ flexDirection: "row", marginTop: 2 }}>
        <View style={{ width: "62%", paddingRight: 20 }}>
          <Sections sections={body} ctx={ctx} />
        </View>
        <View style={{ width: "38%" }}>
          <Sections sections={sidebar} ctx={ctx} />
        </View>
      </View>
    </Page>
  );
}

export function CvDocument({
  view,
  templateId,
  title,
}: {
  view: CvView;
  templateId: string;
  title: string;
}) {
  const template = getTemplate(templateId);
  const ctx: Ctx = {
    view,
    design: template.design,
    accent: template.monochrome ? INK : view.accent,
    t: DENSITY[template.design.density],
  };

  const layouts = {
    "header-band": HeaderBand,
    "sidebar-left": SidebarLeft,
    "sidebar-right": SidebarRight,
    "split-header": SplitHeader,
    single: SingleColumn,
    timeline: SingleColumn,
  } as const;

  const Layout = layouts[template.design.layout] ?? SingleColumn;

  return (
    <Document
      title={title}
      author={view.fullName}
      subject={view.headline}
      creator="GeneCV"
      producer="GeneCV"
    >
      <Layout ctx={ctx} />
    </Document>
  );
}
