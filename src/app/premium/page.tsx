import Link from "next/link";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { PASS_COPY, PASS_PRICE } from "@/lib/payments/copy";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: `Plantillas premium — las diecisiete por ${PASS_PRICE.label}`,
  description: `Diecisiete diseños premium de CV: barras laterales, líneas de tiempo y retículas editoriales. Un pago de ${PASS_PRICE.label} las desbloquea todas para que compares; el pase se consume al descargar el PDF.`,
  path: "/premium",
});

const STEPS = [
  {
    title: "Las pruebas gratis",
    text: "Elige cualquiera en el editor y mira tu CV real con ese diseño, con marca de agua.",
  },
  {
    title: "Desbloqueas las diecisiete",
    text: `Un pago único de ${PASS_PRICE.label} a través de Paddle, sin suscripción ni cuenta. Las diecisiete quedan disponibles para que compares con calma.`,
  },
  {
    title: "Descargas la que elijas",
    text: "El PDF sin marca de agua se genera al momento. Ahí se consume el pase: descargar otra vez requiere pagar de nuevo.",
  },
];

export default function PremiumPage() {
  return (
    <Container className="py-16">
      <Reveal className="max-w-2xl">
        <Badge tone="premium">
          {PASS_COPY.name} · {PASS_PRICE.label}
        </Badge>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Plantillas premium
        </h1>
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">
          Diecisiete diseños con maquetación más trabajada para perfiles que
          necesitan destacar.{" "}
          Puedes probarlos ahora mismo en el editor y ver tu CV con cualquiera
          de ellos. No se compra un diseño suelto:{" "}
          <strong className="text-ink font-semibold">
            un solo pago de {PASS_PRICE.label} los desbloquea los diecisiete
          </strong>{" "}
          para que compares sin prisa. Ese pase se consume al descargar el PDF,
          así que un segundo PDF requiere pagar de nuevo.
        </p>
        <p className="text-ink-soft mt-3 leading-relaxed">
          No hay cuentas, ni contraseñas, ni formulario: pulsas y pagas. El
          correo te lo pide Paddle en la propia ventana de pago, solo para
          emitir la factura. Las tres plantillas gratuitas seguirán siendo
          gratuitas y sin marca de agua.
        </p>
      </Reveal>

      <Reveal className="mt-10">
        <div className="border-primary-200 bg-primary-soft rounded-card border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-primary font-semibold">
                {PASS_COPY.name} — {PASS_PRICE.label}
              </p>
              <p className="text-ink-soft mt-1 text-sm">
                Monta tu CV y paga en el último paso: se desbloquean las
                diecisiete y descargas la que prefieras en esa misma sesión.
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
            <Card className="h-full">
              <div className="bg-surface border-line mb-4 aspect-[3/4] overflow-hidden rounded-lg border">
                <div className="blur-[1.5px]">
                  <TemplateThumb template={template} />
                </div>
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardText>{template.description}</CardText>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-14">
        <p className="text-ink-soft">
          Mientras tanto,{" "}
          <Link href="/crear" className="text-primary font-semibold underline">
            crea tu CV con las plantillas gratuitas
          </Link>
          .
        </p>
      </Reveal>
    </Container>
  );
}
