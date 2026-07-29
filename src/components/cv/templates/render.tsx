import {
  ContactList,
  DENSITY,
  EducationList,
  ExperienceList,
  Heading,
  Languages,
  NameBlock,
  Photo,
  Skills,
  Summary,
  type Style,
} from "@/components/cv/templates/parts";
import type { TemplateMeta } from "@/lib/cv/templates";
import type { SectionId } from "@/lib/cv/types";
import type { CvView } from "@/lib/cv/view";

/**
 * Renders any catalogued template from its design config. Six layout
 * archetypes cover the whole catalogue; everything else (headings, name,
 * density, skill presentation, photo shape) is a parameter.
 */
export function TemplateRenderer({
  view,
  template,
}: {
  view: CvView;
  template: TemplateMeta;
}) {
  const style: Style = {
    // Monochrome designs ignore the user's accent on purpose.
    accent: template.monochrome ? "#1a1a1a" : view.accent,
    design: template.design,
    density: DENSITY[template.design.density],
  };

  switch (template.design.layout) {
    case "header-band":
      return <HeaderBand view={view} style={style} />;
    case "sidebar-left":
      return <SidebarLeft view={view} style={style} />;
    case "sidebar-right":
      return <SidebarRight view={view} style={style} />;
    case "split-header":
      return <SplitHeader view={view} style={style} />;
    default:
      return <SingleColumn view={view} style={style} />;
  }
}

/** Renders one section's body. */
function SectionBody({
  id,
  view,
  style,
  onDark = false,
}: {
  id: SectionId;
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  if (id === "summary") return <Summary view={view} style={style} />;
  if (id === "experience") return <ExperienceList view={view} style={style} />;
  if (id === "education") return <EducationList view={view} style={style} />;
  if (id === "skills") return <Skills view={view} style={style} onDark={onDark} />;
  if (id === "languages")
    return <Languages view={view} style={style} onDark={onDark} />;
  return null;
}

function Sections({
  sections,
  view,
  style,
  onDark = false,
}: {
  sections: CvView["sections"];
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id}>
          <Heading style={style} onDark={onDark}>
            {section.heading}
          </Heading>
          <SectionBody
            id={section.id}
            view={view}
            style={style}
            onDark={onDark}
          />
        </section>
      ))}
    </>
  );
}

/** Splits sections between the sidebar and the main column. */
function splitSections(view: CvView, style: Style) {
  const ids = new Set(style.design.sidebarSections ?? []);
  return {
    sidebar: view.sections.filter((s) => ids.has(s.id as "skills" | "languages")),
    body: view.sections.filter(
      (s) => !ids.has(s.id as "skills" | "languages"),
    ),
  };
}

/* ------------------------------------------------------- Single column */

function SingleColumn({ view, style }: { view: CvView; style: Style }) {
  const { density } = style;

  return (
    <div
      style={{ paddingLeft: density.padX, paddingRight: density.padX, paddingTop: density.padY, paddingBottom: density.padY }}
      className="h-full font-sans"
    >
      <header
        style={{ borderColor: style.accent }}
        className="flex items-center gap-5 border-b pb-3"
      >
        <div className="min-w-0 flex-1">
          <NameBlock view={view} style={style} />
          <div style={{ marginTop: 8 }}>
            <ContactInline view={view} style={style} />
          </div>
        </div>
        <Photo view={view} size={78} shape={style.design.photo} />
      </header>

      <Sections sections={view.sections} view={view} style={style} />
    </div>
  );
}

/** Contact rendered as one wrapped line — used by the header layouts. */
function ContactInline({
  view,
  style,
  onDark = false,
}: {
  view: CvView;
  style: Style;
  onDark?: boolean;
}) {
  if (view.contact.length === 0 && view.extras.length === 0) return null;

  return (
    <>
      <p
        style={{
          fontSize: style.density.body - 0.5,
          color: onDark ? "rgba(255,255,255,0.88)" : "#555555",
          lineHeight: 1.5,
        }}
      >
        {view.contact.join("  |  ")}
      </p>
      {view.extras.length > 0 && (
        <p
          style={{
            fontSize: style.density.body - 0.5,
            color: onDark ? "rgba(255,255,255,0.75)" : "#666666",
          }}
        >
          {view.extras.join("  |  ")}
        </p>
      )}
    </>
  );
}

/* ---------------------------------------------------------- Header band */

function HeaderBand({ view, style }: { view: CvView; style: Style }) {
  const { density } = style;

  return (
    <div className="h-full font-sans">
      <header
        style={{
          backgroundColor: style.accent,
          paddingLeft: density.padX,
          paddingRight: density.padX,
          paddingTop: density.padY * 0.7,
          paddingBottom: density.padY * 0.7,
        }}
        className="flex items-center gap-4 text-white"
      >
        <Photo view={view} size={68} shape={style.design.photo} />
        <div className="min-w-0">
          <NameBlock view={view} style={style} onDark />
          <div style={{ marginTop: 7 }}>
            <ContactInline view={view} style={style} onDark />
          </div>
        </div>
      </header>

      <div
        style={{
          paddingLeft: density.padX,
          paddingRight: density.padX,
          paddingTop: density.padY * 0.55,
          paddingBottom: density.padY * 0.6,
        }}
      >
        <Sections sections={view.sections} view={view} style={style} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Sidebar left */

function SidebarLeft({ view, style }: { view: CvView; style: Style }) {
  const { density } = style;
  const { sidebar, body } = splitSections(view, style);

  return (
    <div className="flex h-full font-sans">
      <aside
        style={{
          backgroundColor: style.accent,
          paddingLeft: 22,
          paddingRight: 22,
          paddingTop: density.padY * 0.8,
          paddingBottom: density.padY * 0.8,
        }}
        className="w-[34%] shrink-0 text-white"
      >
        {view.showPhoto && (
          <div className="mb-4 flex justify-center">
            <Photo view={view} size={92} shape={style.design.photo} />
          </div>
        )}

        <NameBlock view={view} style={style} onDark />

        {(view.contact.length > 0 || view.extras.length > 0) && (
          <>
            <Heading style={style} onDark>
              Contacto
            </Heading>
            <ContactList view={view} style={style} onDark />
          </>
        )}

        <Sections sections={sidebar} view={view} style={style} onDark />
      </aside>

      <div
        style={{
          paddingLeft: 30,
          paddingRight: 30,
          paddingTop: density.padY * 0.8,
          paddingBottom: density.padY * 0.8,
        }}
        className="flex-1"
      >
        <Sections sections={body} view={view} style={style} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- Sidebar right */

function SidebarRight({ view, style }: { view: CvView; style: Style }) {
  const { density } = style;
  const { sidebar, body } = splitSections(view, style);

  return (
    <div className="h-full font-sans">
      <header
        style={{
          paddingLeft: density.padX,
          paddingRight: density.padX,
          paddingTop: density.padY * 0.85,
        }}
        className="flex items-center gap-4 pb-3"
      >
        <Photo view={view} size={66} shape={style.design.photo} />
        <div className="min-w-0 flex-1">
          <NameBlock view={view} style={style} />
        </div>
      </header>

      <div
        style={{
          backgroundColor: style.accent,
          marginLeft: density.padX,
          marginRight: density.padX,
        }}
        className="h-[2px]"
      />

      <div
        style={{
          paddingLeft: density.padX,
          paddingRight: density.padX,
          paddingTop: 14,
          paddingBottom: density.padY * 0.85,
        }}
        className="flex"
      >
        <div className="w-[64%] pr-6">
          <Sections sections={body} view={view} style={style} />
        </div>

        <aside className="w-[36%] border-l border-[#e5e7eb] pl-5">
          {(view.contact.length > 0 || view.extras.length > 0) && (
            <>
              <Heading style={style}>Contacto</Heading>
              <ContactList view={view} style={style} />
            </>
          )}
          <Sections sections={sidebar} view={view} style={style} />
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Split header */

function SplitHeader({ view, style }: { view: CvView; style: Style }) {
  const { density } = style;
  const { sidebar, body } = splitSections(view, style);

  return (
    <div
      style={{
        paddingLeft: density.padX,
        paddingRight: density.padX,
        paddingTop: density.padY,
        paddingBottom: density.padY,
      }}
      className="h-full font-sans"
    >
      <header>
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <NameBlock view={view} style={style} />
          </div>
          <Photo view={view} size={76} shape={style.design.photo} />
        </div>
        <div
          style={{ backgroundColor: style.accent, marginTop: 12 }}
          className="h-[3px] w-full"
        />
        <div style={{ marginTop: 8 }}>
          <ContactInline view={view} style={style} />
        </div>
      </header>

      <div className="mt-2 flex gap-7">
        <div className="w-[62%]">
          <Sections sections={body} view={view} style={style} />
        </div>
        <div className="w-[38%]">
          <Sections sections={sidebar} view={view} style={style} />
        </div>
      </div>
    </div>
  );
}
