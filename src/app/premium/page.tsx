import Link from "next/link";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { buildMetadata } from "@/lib/site";

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

export default function PremiumPage() {
  return (
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
    </Container>
  );
}
