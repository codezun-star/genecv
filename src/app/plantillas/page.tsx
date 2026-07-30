import Link from "next/link";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import {
  FREE_TEMPLATES,
  PREMIUM_TEMPLATES,
  isAtsSafe,
  type TemplateMeta,
} from "@/lib/cv/templates";
import { FREE_LAUNCH_COPY, isFreeLaunch } from "@/lib/payments/mode";
import { breadcrumbJsonLd, buildMetadata, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Plantillas de CV gratuitas y compatibles con ATS",
  description:
    "Tres plantillas gratuitas de una sola columna —Clásica ATS, Moderna y Minimal— más diecisiete diseños premium. Pruébalas todas con tu contenido y cambia cuando quieras.",
  path: "/plantillas",
  keywords: [
    "plantillas de cv",
    "plantilla curriculum ats",
    "plantilla cv gratis",
  ],
});

function PremiumCard({ template }: { template: TemplateMeta }) {
  const free = isFreeLaunch();

  const card = (
    <Card
      className={cn(
        "h-full",
        free
          ? "group-hover:border-secondary-200 group-hover:shadow-lift transition-[box-shadow,border-color] duration-200"
          : "opacity-90",
      )}
    >
      <div className="bg-surface border-line relative mb-4 aspect-[3/4] overflow-hidden rounded-lg border">
        <div className={free ? undefined : "blur-[1.5px]"}>
          <TemplateThumb template={template} />
        </div>
        {!free && (
          <div className="bg-primary-900/25 absolute inset-0 grid place-items-center">
            <span className="bg-canvas text-primary shadow-soft grid size-10 place-items-center rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                className="size-4"
                aria-hidden
              >
                <path d="M7 10V7a5 5 0 0110 0v3M5 10h14v10H5z" />
              </svg>
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle className="text-base">{template.name}</CardTitle>
        <Badge tone="premium">Premium</Badge>
        {free && <Badge tone="success">{FREE_LAUNCH_COPY.badge}</Badge>}
      </div>
      <CardText>{template.description}</CardText>
    </Card>
  );

  if (!free) return card;

  return (
    <Link
      href={`/crear?plantilla=${template.id}`}
      className="group block h-full"
    >
      {card}
    </Link>
  );
}

/**
 * El catálogo, como lista. Un asistente al que le preguntan "¿qué plantillas
 * de CV tiene GeneCV?" puede contestar con los nombres y con cuáles pasan un
 * ATS sin descargar la página entera ni interpretar la retícula de tarjetas.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Plantillas de CV de GeneCV",
    url: `${siteConfig.url}/plantillas`,
    inLanguage: siteConfig.lang,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Plantillas de currículum",
      numberOfItems: FREE_TEMPLATES.length + PREMIUM_TEMPLATES.length,
      itemListElement: [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES].map(
        (template, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: template.name,
          url: `${siteConfig.url}/crear?plantilla=${template.id}`,
          description: `${template.isPremium ? "Plantilla premium" : "Plantilla gratuita"}. ${
            isAtsSafe(template) ? "Compatible con ATS." : "No recomendada para filtros ATS."
          }`,
        }),
      ),
    },
  },
  breadcrumbJsonLd([{ name: "Plantillas", path: "/plantillas" }]),
];

export default function TemplatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Container className="py-14">
        <Reveal className="max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Plantillas</h1>
          <p className="text-ink-soft mt-4 text-lg leading-relaxed">
            Tres diseños gratuitos y diecisiete premium. Todos comparten el
            mismo contenido: elige uno, cámbialo cuando quieras y exporta el
            mismo PDF nítido. Los marcados como ATS usan una sola columna, que
            es lo que mejor leen los filtros automáticos.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_TEMPLATES.map((template) => (
            <RevealItem key={template.id}>
              <Link
                href={`/crear?plantilla=${template.id}`}
                className="group block h-full"
              >
                <Card className="group-hover:shadow-lift group-hover:border-secondary-200 h-full transition-[box-shadow,border-color,transform] duration-200 group-hover:-translate-y-1">
                  <div className="bg-surface border-line mb-4 aspect-[3/4] overflow-hidden rounded-lg border">
                    <TemplateThumb template={template} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {isAtsSafe(template) && <Badge tone="success">ATS</Badge>}
                  </div>
                  <CardText>{template.description}</CardText>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <li
                        key={tag}
                        className="bg-surface text-ink-muted rounded-full px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <Container className="pb-8">
        <AdSlot slotId="templates-mid" format="leaderboard" />
      </Container>

      <section className="bg-canvas border-line border-t py-16">
        <Container>
          <Reveal className="max-w-2xl">
            <Badge tone={isFreeLaunch() ? "success" : "premium"}>
              {isFreeLaunch() ? FREE_LAUNCH_COPY.badge : "Próximamente"}
            </Badge>
            <h2 className="mt-4 text-3xl font-bold">Plantillas premium</h2>
            <p className="text-ink-soft mt-3 leading-relaxed">
              Diecisiete diseños con maquetación más trabajada: barras
              laterales, líneas de tiempo, retículas editoriales y versiones
              compactas.{" "}
              {isFreeLaunch()
                ? FREE_LAUNCH_COPY.landingLead
                : "Puedes seleccionarlos en el editor y ver tu CV con ellos; lo que se paga es la descarga sin marca de agua, una vez por descarga."}
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PREMIUM_TEMPLATES.map((template) => (
              <RevealItem key={template.id}>
                {/* Durante el lanzamiento la premium se usa gratis, así que la
                    tarjeta enlaza al editor y no lleva candado ni desenfoque:
                    sería mentirle al usuario sobre lo que puede hacer. */}
                <PremiumCard template={template} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="mt-10">
            <Link href="/premium" className={buttonStyles({ variant: "outline" })}>
              Saber más sobre premium
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
