import Link from "next/link";

import { AdBanner } from "@/components/ads/ad-banner";
import { NativeAd } from "@/components/ads/native-ad";
import { TemplateThumb } from "@/components/cv/template-thumb";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PREMIUM_TEMPLATES, isAtsSafe } from "@/lib/cv/templates";
import { breadcrumbJsonLd, buildMetadata, siteConfig } from "@/lib/site";

/**
 * Los diseños premium.
 *
 * «Premium» describe la maquetación —barras laterales, líneas de tiempo,
 * retículas editoriales—, no un precio: se descargan igual que el resto, gratis
 * y sin marca de agua.
 *
 * La URL se mantiene en /premium aunque no haya nada que cobrar. «Plantilla de
 * CV premium gratis» es una búsqueda real y con volumen, y cambiar la ruta
 * tiraría a la basura el posicionamiento que ya tenga por perseguir una
 * coherencia que solo existe dentro del repositorio.
 */

export const metadata = buildMetadata({
  title: "Plantillas de CV premium, gratis y sin marca de agua",
  description: `${PREMIUM_TEMPLATES.length} diseños premium de CV: barras laterales, líneas de tiempo y retículas editoriales. Gratis, sin registro y sin marca de agua.`,
  path: "/premium",
  keywords: [
    "plantilla cv premium gratis",
    "curriculum profesional gratis",
    "plantillas cv dos columnas",
  ],
});

const STEPS = [
  {
    title: "Montas tu CV",
    text: "El editor es el mismo para todos los diseños: rellenas una vez y lo ves aplicado al instante.",
  },
  {
    title: "Pruebas los que quieras",
    text: "Cambia de plantilla las veces que haga falta. El contenido no se toca al cambiar el diseño.",
  },
  {
    title: "Descargas el PDF",
    text: "Sin coste, sin marca de agua y sin crear ninguna cuenta. El archivo lleva tu nombre.",
  },
];

/**
 * El catálogo premium, como lista.
 *
 * La página no llevaba ningún dato estructurado: ni migas de pan ni catálogo,
 * cuando /plantillas —que enseña estos mismos diseños— sí los tenía. El
 * `description` de cada elemento dice en voz alta lo que el resto de la página
 * repite en prosa, que aquí «premium» es la maquetación y no el precio: es lo
 * que evita que un asistente conteste que hay diseños de pago.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Plantillas de CV premium de GeneCV",
    url: `${siteConfig.url}/premium`,
    description:
      "Diseños de currículum con maquetación avanzada: barras laterales, líneas de tiempo y retículas editoriales. Gratis y sin marca de agua.",
    inLanguage: siteConfig.lang,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Plantillas de currículum premium",
      numberOfItems: PREMIUM_TEMPLATES.length,
      itemListElement: PREMIUM_TEMPLATES.map((template, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: template.name,
        url: `${siteConfig.url}/crear?plantilla=${template.id}`,
        description: `${template.description} Gratis, sin marca de agua. ${
          isAtsSafe(template)
            ? "Compatible con ATS."
            : "No recomendada para filtros ATS."
        }`,
      })),
    },
  },
  breadcrumbJsonLd([{ name: "Premium", path: "/premium" }]),
];

export default function PremiumPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Container className="py-16">
        <Reveal className="max-w-2xl">
          <Badge tone="success">Gratis</Badge>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Diseños premium
          </h1>
          <p className="text-ink-soft mt-4 text-lg leading-relaxed">
            {PREMIUM_TEMPLATES.length} diseños con maquetación más trabajada para
            perfiles que necesitan destacar.{" "}
            <strong className="text-ink font-semibold">
              «Premium» se refiere al diseño, no al precio
            </strong>
            : se descargan igual que los demás, sin coste y sin marca de agua.
          </p>
          <p className="text-ink-soft mt-3 leading-relaxed">
            No hay cuentas, ni contraseñas, ni pasarela de pago. Montas tu CV en
            el navegador y te llevas el PDF.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="border-primary-200 bg-primary-soft rounded-card border p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-primary font-semibold">
                  Todo el catálogo, sin coste
                </p>
                <p className="text-ink-soft mt-1 text-sm">
                  Elige el diseño que quieras y descárgalo en la misma sesión.
                </p>
              </div>
              <Link href="/crear" className={buttonStyles()}>
                Crear mi CV
              </Link>
            </div>
          </div>
        </Reveal>

        <AdBanner placement="banner" className="mt-10" />

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <RevealItem key={step.title}>
              <div>
                <span className="bg-primary text-canvas font-display grid size-10 place-items-center rounded-full font-bold">
                  {i + 1}
                </span>
                <h2 className="font-display mt-4 text-lg font-semibold">
                  {step.title}
                </h2>
                <p className="text-ink-soft mt-2 leading-relaxed">{step.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Antes de la rejilla de diseños, que es lo que se ha venido a ver:
            se cruza sí o sí de camino. */}
        <NativeAd className="mt-14" />

        <Reveal className="mt-16">
          <h2 className="text-2xl font-bold">Los diseños</h2>
        </Reveal>

        <RevealGroup className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PREMIUM_TEMPLATES.map((template) => (
            <RevealItem key={template.id}>
              <Link
                href={`/crear?plantilla=${template.id}`}
                className="group block h-full"
              >
                <Card className="group-hover:border-secondary-200 group-hover:shadow-lift h-full transition-[box-shadow,border-color] duration-200">
                  <div className="bg-surface border-line mb-4 aspect-[3/4] overflow-hidden rounded-lg border">
                    <TemplateThumb template={template} />
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardText>{template.description}</CardText>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14">
          <p className="text-ink-soft">
            ¿Prefieres algo más sobrio?{" "}
            <Link
              href="/plantillas"
              className="text-primary font-semibold underline"
            >
              Mira el catálogo completo
            </Link>
            , con los diseños de una sola columna pensados para filtros ATS.
          </p>
        </Reveal>

          <AdBanner placement="banner" className="mt-14" />
      </Container>
    </>
  );
}
