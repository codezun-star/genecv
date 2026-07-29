/* eslint-disable jsx-a11y/alt-text -- @react-pdf's <Image> has no alt prop. */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { CvView } from "@/lib/cv/view";

/**
 * PDF counterparts of the on-screen templates.
 *
 * Typeface: Helvetica, one of the 14 fonts every PDF reader has built in. It
 * keeps the file small, needs no network fetch, and — the reason that matters
 * here — extracts as clean text, which is exactly what an ATS reads. The
 * on-screen preview uses Inter; both are neo-grotesques, so the layout and
 * line breaks match closely.
 *
 * Sizes are the preview's px values × 0.75 (96dpi → 72pt), so the proportions
 * carry over one to one.
 */

const GREY = "#555555";
const GREY_SOFT = "#666666";
const BODY = "#333333";
const DARK = "#1a1a1a";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: BODY,
    lineHeight: 1.5,
  },
  name: {
    fontSize: 16.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    letterSpacing: -0.3,
    // Explicit: the page's 1.5 leaves the following line sitting on the
    // descenders of the name.
    lineHeight: 1.2,
  },
  headline: { fontSize: 8.6, color: "#444444", marginTop: 3, lineHeight: 1.3 },
  contact: { fontSize: 7.1, color: GREY, marginTop: 5, lineHeight: 1.45 },
  extras: { fontSize: 7.1, color: GREY, marginTop: 2 },
  sectionHeading: {
    fontSize: 8.25,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginTop: 13,
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  itemTitle: { fontSize: 8.6, fontFamily: "Helvetica-Bold", color: DARK },
  itemDates: { fontSize: 7.1, color: GREY_SOFT },
  itemSubtitle: { fontSize: 7.9, fontFamily: "Helvetica-Bold", marginTop: 1 },
  itemLocation: { fontFamily: "Helvetica", color: GREY_SOFT },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 7, fontSize: 7.5 },
  bulletText: { flex: 1, fontSize: 7.5, lineHeight: 1.5 },
  body: { fontSize: 7.5, lineHeight: 1.6 },
});

function SectionHeading({
  children,
  color,
  underline = false,
}: {
  children: string;
  color: string;
  underline?: boolean;
}) {
  return (
    <Text
      style={[
        s.sectionHeading,
        { color },
        underline
          ? {
              borderBottomWidth: 0.75,
              borderBottomColor: color,
              paddingBottom: 3,
            }
          : {},
      ]}
    >
      {children}
    </Text>
  );
}

function Experience({ view, accent }: { view: CvView; accent: string }) {
  return (
    <View>
      {view.experience.map((item) => (
        <View key={item.id} style={{ marginBottom: 7 }} wrap={false}>
          <View style={s.itemHeader}>
            <Text style={s.itemTitle}>{item.position}</Text>
            {item.dates ? <Text style={s.itemDates}>{item.dates}</Text> : null}
          </View>
          <Text style={[s.itemSubtitle, { color: accent }]}>
            {item.company}
            {item.location ? (
              <Text style={s.itemLocation}> · {item.location}</Text>
            ) : null}
          </Text>
          {item.achievements.map((line, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={[s.bulletDot, { color: accent }]}>•</Text>
              <Text style={s.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Education({ view, accent }: { view: CvView; accent: string }) {
  return (
    <View>
      {view.education.map((item) => (
        <View key={item.id} style={{ marginBottom: 6 }} wrap={false}>
          <View style={s.itemHeader}>
            <Text style={s.itemTitle}>{item.degree}</Text>
            {item.dates ? <Text style={s.itemDates}>{item.dates}</Text> : null}
          </View>
          <Text style={[s.itemSubtitle, { color: accent }]}>
            {item.institution}
            {item.location ? (
              <Text style={s.itemLocation}> · {item.location}</Text>
            ) : null}
          </Text>
          {item.description ? (
            <Text style={[s.body, { marginTop: 1 }]}>{item.description}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SkillsText({ view }: { view: CvView }) {
  return (
    <Text style={s.body}>
      {view.skills.map((sk) => `${sk.name} (${sk.levelLabel})`).join(" · ")}
    </Text>
  );
}

function SkillsBars({
  view,
  onDark = false,
  accent,
}: {
  view: CvView;
  onDark?: boolean;
  accent: string;
}) {
  return (
    <View>
      {view.skills.map((skill) => (
        <View key={skill.id} style={{ marginBottom: 4 }}>
          <Text
            style={{ fontSize: 7.5, color: onDark ? "#ffffff" : BODY }}
          >
            {skill.name}
          </Text>
          <View
            style={{
              height: 2.25,
              marginTop: 1.5,
              borderRadius: 2,
              backgroundColor: onDark ? "rgba(255,255,255,0.25)" : "#e5e7eb",
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

function SkillsRows({ view }: { view: CvView }) {
  return (
    <View>
      {view.skills.map((skill) => (
        <View
          key={skill.id}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Text style={{ fontSize: 7.1, fontFamily: "Helvetica-Bold" }}>
            {skill.name}
          </Text>
          <Text style={{ fontSize: 7.1, color: "#777777" }}>
            {skill.levelLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Languages({ view, onDark = false }: { view: CvView; onDark?: boolean }) {
  return (
    <View>
      {view.languages.map((language) => (
        <View
          key={language.id}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Text
            style={{
              fontSize: 7.5,
              fontFamily: "Helvetica-Bold",
              color: onDark ? "#ffffff" : BODY,
            }}
          >
            {language.name}
          </Text>
          <Text
            style={{
              fontSize: 7.5,
              color: onDark ? "rgba(255,255,255,0.8)" : GREY_SOFT,
            }}
          >
            {language.levelLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Summary({ view }: { view: CvView }) {
  return (
    <Text style={[s.body, view.summaryIsPlaceholder ? { color: "#9ca3af" } : {}]}>
      {view.summary}
    </Text>
  );
}

/** Dispatches a section id to its renderer for the single-column layouts. */
function SectionBody({
  id,
  view,
  accent,
}: {
  id: string;
  view: CvView;
  accent: string;
}) {
  if (id === "summary") return <Summary view={view} />;
  if (id === "experience") return <Experience view={view} accent={accent} />;
  if (id === "education") return <Education view={view} accent={accent} />;
  if (id === "skills") return <SkillsText view={view} />;
  if (id === "languages") return <Languages view={view} />;
  return null;
}

/* ---------------------------------------------------------------- Clásica */

function Clasica({ view }: { view: CvView }) {
  const accent = DARK;

  return (
    <Page size="A4" style={[s.page, { paddingHorizontal: 39, paddingVertical: 34 }]}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: DARK,
          paddingBottom: 8,
        }}
      >
        <Text style={s.name}>{view.fullName}</Text>
        <Text style={s.headline}>{view.headline}</Text>
        {view.contact.length > 0 ? (
          <Text style={s.contact}>{view.contact.join("  |  ")}</Text>
        ) : null}
        {view.extras.length > 0 ? (
          <Text style={s.extras}>{view.extras.join("  |  ")}</Text>
        ) : null}
      </View>

      {view.sections.map((section) => (
        <View key={section.id}>
          <SectionHeading color={accent} underline>
            {section.heading}
          </SectionHeading>
          <SectionBody id={section.id} view={view} accent={accent} />
        </View>
      ))}
    </Page>
  );
}

/* ---------------------------------------------------------------- Moderna */

function Moderna({ view }: { view: CvView }) {
  const accent = view.accent;

  return (
    <Page size="A4" style={s.page}>
      <View
        style={{
          backgroundColor: accent,
          paddingHorizontal: 34,
          paddingVertical: 22,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {view.showPhoto && view.photo ? (
          <Image
            src={view.photo}
            style={{ width: 51, height: 51, borderRadius: 26, marginRight: 12 }}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: "#ffffff" }]}>{view.fullName}</Text>
          <Text style={[s.headline, { color: "rgba(255,255,255,0.9)" }]}>
            {view.headline}
          </Text>
          {view.contact.length > 0 ? (
            <Text style={[s.contact, { color: "rgba(255,255,255,0.85)" }]}>
              {view.contact.join("  ·  ")}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: 34, paddingVertical: 19 }}>
        {view.extras.length > 0 ? (
          <Text style={[s.extras, { marginTop: 0, marginBottom: 6 }]}>
            {view.extras.join("  ·  ")}
          </Text>
        ) : null}

        {view.sections.map((section) => (
          <View key={section.id}>
            <SectionHeading color={accent}>{section.heading}</SectionHeading>
            <SectionBody id={section.id} view={view} accent={accent} />
          </View>
        ))}
      </View>
    </Page>
  );
}

/* --------------------------------------------------------------- Creativa */

const SIDEBAR_IDS = new Set(["skills", "languages"]);

function Creativa({ view }: { view: CvView }) {
  const accent = view.accent;
  const sidebar = view.sections.filter((x) => SIDEBAR_IDS.has(x.id));
  const body = view.sections.filter((x) => !SIDEBAR_IDS.has(x.id));

  return (
    <Page size="A4" style={[s.page, { flexDirection: "row" }]}>
      <View
        style={{
          width: "34%",
          backgroundColor: accent,
          paddingHorizontal: 16,
          paddingVertical: 25,
          color: "#ffffff",
        }}
      >
        {view.showPhoto && view.photo ? (
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Image
              src={view.photo}
              style={{ width: 69, height: 69, borderRadius: 35 }}
            />
          </View>
        ) : null}

        <Text style={[s.name, { fontSize: 14, color: "#ffffff" }]}>
          {view.fullName}
        </Text>
        <Text style={[s.headline, { color: "rgba(255,255,255,0.9)" }]}>
          {view.headline}
        </Text>

        {view.contact.length > 0 ? (
          <>
            <Text
              style={[
                s.sectionHeading,
                { color: "rgba(255,255,255,0.9)", fontSize: 7.5 },
              ]}
            >
              CONTACTO
            </Text>
            {view.contact.map((line) => (
              <Text
                key={line}
                style={{
                  fontSize: 7.1,
                  color: "rgba(255,255,255,0.95)",
                  marginBottom: 1.5,
                }}
              >
                {line}
              </Text>
            ))}
          </>
        ) : null}

        {view.extras.map((line) => (
          <Text
            key={line}
            style={{
              fontSize: 6.8,
              color: "rgba(255,255,255,0.8)",
              marginTop: 2,
            }}
          >
            {line}
          </Text>
        ))}

        {sidebar.map((section) => (
          <View key={section.id}>
            <Text
              style={[
                s.sectionHeading,
                { color: "rgba(255,255,255,0.9)", fontSize: 7.5 },
              ]}
            >
              {section.heading.toUpperCase()}
            </Text>
            {section.id === "skills" ? (
              <SkillsBars view={view} accent={accent} onDark />
            ) : (
              <Languages view={view} onDark />
            )}
          </View>
        ))}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 22, paddingVertical: 25 }}>
        {body.map((section) => (
          <View key={section.id}>
            <SectionHeading color={accent} underline>
              {section.heading}
            </SectionHeading>
            <SectionBody id={section.id} view={view} accent={accent} />
          </View>
        ))}
      </View>
    </Page>
  );
}

/* -------------------------------------------------------------- Ejecutiva */

function Ejecutiva({ view }: { view: CvView }) {
  const accent = view.accent;
  const sidebar = view.sections.filter((x) => SIDEBAR_IDS.has(x.id));
  const body = view.sections.filter((x) => !SIDEBAR_IDS.has(x.id));

  return (
    <Page size="A4" style={s.page}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 33,
          paddingTop: 28,
          paddingBottom: 10,
        }}
      >
        {view.showPhoto && view.photo ? (
          <Image
            src={view.photo}
            style={{ width: 49, height: 49, borderRadius: 2, marginRight: 12 }}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              s.name,
              { fontSize: 18.75, color: accent, textTransform: "uppercase" },
            ]}
          >
            {view.fullName}
          </Text>
          <Text
            style={{
              fontSize: 8.25,
              color: GREY,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              marginTop: 3,
            }}
          >
            {view.headline}
          </Text>
        </View>
      </View>

      <View
        style={{ height: 1.5, backgroundColor: accent, marginHorizontal: 33 }}
      />

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 33,
          paddingTop: 10,
          paddingBottom: 28,
        }}
      >
        <View style={{ width: "64%", paddingRight: 18 }}>
          {body.map((section) => (
            <View key={section.id}>
              <SectionHeading color={accent}>{section.heading}</SectionHeading>
              <SectionBody id={section.id} view={view} accent={accent} />
            </View>
          ))}
        </View>

        <View
          style={{
            width: "36%",
            borderLeftWidth: 0.75,
            borderLeftColor: "#e5e7eb",
            paddingLeft: 14,
          }}
        >
          {view.contact.length > 0 ? (
            <>
              <SectionHeading color={accent}>Contacto</SectionHeading>
              {view.contact.map((line) => (
                <Text
                  key={line}
                  style={{ fontSize: 7.1, marginBottom: 1.5 }}
                >
                  {line}
                </Text>
              ))}
            </>
          ) : null}

          {view.extras.map((line) => (
            <Text
              key={line}
              style={{ fontSize: 6.8, color: GREY_SOFT, marginTop: 2 }}
            >
              {line}
            </Text>
          ))}

          {sidebar.map((section) => (
            <View key={section.id}>
              <SectionHeading color={accent}>{section.heading}</SectionHeading>
              {section.id === "skills" ? (
                <SkillsRows view={view} />
              ) : (
                <Languages view={view} />
              )}
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

const PAGES: Record<string, (props: { view: CvView }) => React.ReactElement> = {
  clasica: Clasica,
  moderna: Moderna,
  creativa: Creativa,
  ejecutiva: Ejecutiva,
};

export function CvDocument({
  view,
  templateId,
  title,
}: {
  view: CvView;
  templateId: string;
  title: string;
}) {
  const PageComponent = PAGES[templateId] ?? Clasica;

  return (
    <Document
      title={title}
      author={view.fullName}
      subject={view.headline}
      creator="GeneCV"
      producer="GeneCV"
    >
      <PageComponent view={view} />
    </Document>
  );
}
