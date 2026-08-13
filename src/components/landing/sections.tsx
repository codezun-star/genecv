import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { REGION_LIST } from "@/lib/cv/regions";
import { TemplateThumb } from "@/components/cv/template-thumb";
import { FREE_TEMPLATES, isAtsSafe } from "@/lib/cv/templates";
import { HOME_STEPS, homeFaq } from "@/lib/landing-content";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      {description && (
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">
          {description}
        </p>
      )}
    </Reveal>
  );
}

const FEATURES = [
  {
    title: "Vista previa en tiempo real",
    text: "Cada cambio se refleja al instante en el documento. Sin recargar, sin sorpresas al exportar.",
    icon: "M4 5h16v14H4z M4 9h16",
  },
  {
    title: "Verificador ATS",
    text: "Analizamos la plantilla y el contenido para avisarte de columnas, gráficos o campos que los filtros automáticos no leen bien.",
    icon: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z M9 12l2 2 4-4",
  },
  {
    title: "Banco de frases por profesión",
    text: "Sugerencias de logros redactados con verbos de acción para que no empieces desde una página en blanco.",
    icon: "M5 4h14v16l-7-3-7 3z",
  },
  {
    title: "Secciones reordenables",
    text: "Arrastra las secciones para destacar primero lo que más pesa en tu perfil.",
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    title: "Guardado automático",
    text: "Tu progreso queda en el navegador. Cierra la pestaña y continúa más tarde desde donde lo dejaste.",
    icon: "M5 4h11l3 3v13H5z M8 4v6h7V4 M8 20v-6h8v6",
  },
  {
    title: "Privado por diseño",
    text: "No hay cuentas ni base de datos: tus datos y tu foto nunca se envían a ningún servidor.",
    icon: "M6 11V8a6 6 0 0112 0v3 M5 11h14v9H5z",
  },
];

export function Features() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Qué incluye"
          title="Todo lo necesario para un CV que sí se lee"
          description="Desde el primer campo hasta el PDF final, sin plantillas de Word ni maquetación manual."
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title}>
              <Card className="hover:border-secondary-200 h-full transition-colors duration-200">
                <span className="bg-primary-soft text-primary grid size-10 place-items-center rounded-[0.6rem]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden
                  >
                    <path d={feature.icon} />
                  </svg>
                </span>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardText>{feature.text}</CardText>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export function Formats() {
  return (
    <section className="bg-canvas border-line border-y py-20">
      <Container>
        <SectionHeading
          eyebrow="Universal"
          title="Un CV distinto para cada mercado"
          description="El mismo contenido, adaptado automáticamente a lo que espera cada región: foto o sin foto, orden de secciones y terminología."
        />

        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3">
          {REGION_LIST.map((region) => (
            <RevealItem key={region.id}>
              <Card className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{region.label}</CardTitle>
                  <Badge tone="secondary">{region.shortName}</Badge>
                </div>
                <p className="text-ink-muted mt-1 text-xs">{region.markets}</p>
                <CardText>{region.description}</CardText>

                <dl className="border-line mt-5 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Fotografía</dt>
                    <dd className="text-ink font-medium">
                      {region.photo === "recommended"
                        ? "Habitual"
                        : region.photo === "optional"
                          ? "Opcional"
                          : "No recomendada"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Documento</dt>
                    <dd className="text-ink font-medium">
                      {region.documentName}
                    </dd>
                  </div>
                </dl>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading eyebrow="Cómo funciona" title="Tres pasos, sin cuenta" />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {HOME_STEPS.map((step, i) => (
            <RevealItem key={step.title}>
              <div className="relative h-full">
                <span className="bg-primary text-canvas font-display grid size-11 place-items-center rounded-full text-lg font-bold">
                  {i + 1}
                </span>
                <h3 className="font-display mt-5 text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-ink-soft mt-2 leading-relaxed">{step.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export function TemplatesShowcase() {
  return (
    <section className="bg-canvas border-line border-y py-20">
      <Container>
        <SectionHeading
          eyebrow="Plantillas"
          title="Tres diseños gratuitos"
          description="Las tres son de una sola columna, así que pasan bien por los filtros automáticos. Cambia de plantilla cuando quieras: tu contenido se mantiene intacto."
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_TEMPLATES.map((template) => (
            <RevealItem key={template.id}>
              <Link
                href={`/crear?plantilla=${template.id}`}
                className="group focus-visible:outline-primary block h-full"
              >
                <Card className="group-hover:shadow-lift group-hover:border-secondary-200 h-full transition-[box-shadow,border-color,transform] duration-200 group-hover:-translate-y-1">
                  <div className="bg-surface border-line mb-4 aspect-[3/4] overflow-hidden rounded-lg border">
                    <TemplateThumb template={template} />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {isAtsSafe(template) && <Badge tone="success">ATS</Badge>}
                  </div>
                  <CardText className="line-clamp-3">
                    {template.description}
                  </CardText>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 text-center">
          <Link href="/plantillas" className={buttonStyles({ variant: "outline" })}>
            Ver todas las plantillas
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

export function Faq() {
  return (
    <section className="py-20">
      <Container size="narrow">
        <SectionHeading eyebrow="Dudas" title="Preguntas frecuentes" />

        <RevealGroup className="mt-10 space-y-3">
          {homeFaq().map((item) => (
            <RevealItem key={item.q}>
              <details className="border-line bg-canvas group rounded-card border p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="font-display flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="text-secondary size-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="text-ink-soft mt-3 leading-relaxed">{item.a}</p>
              </details>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="pb-20">
      <Container>
        <Reveal>
          <div className="bg-primary rounded-card px-8 py-14 text-center">
            <h2 className="text-canvas text-3xl font-bold sm:text-4xl">
              Tu próximo CV está a diez minutos
            </h2>
            <p className="text-primary-100 mx-auto mt-4 max-w-xl text-lg">
              {/* «Sin tarjeta» a secas deja de ser cierto en cuanto las premium
                  se cobran, y es la última frase que alguien lee antes de
                  entrar al editor. Atada a las gratuitas se sostiene siempre. */}
              Sin registro y sin cuenta: las tres plantillas gratuitas se
              descargan sin marca de agua ni tarjeta. Empieza ahora y descarga
              el PDF cuando lo tengas listo.
            </p>
            <Link
              href="/crear"
              className={buttonStyles({
                size: "lg",
                className:
                  "text-primary mt-8 bg-white shadow-none hover:bg-canvas-dark",
              })}
            >
              Crear mi CV gratis
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
