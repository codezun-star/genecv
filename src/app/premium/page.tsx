import Link from "next/link";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Plantillas premium — próximamente, pago en USDT",
  description:
    "Diecisiete diseños premium de CV: barras laterales, líneas de tiempo y retículas editoriales. Pruébalos gratis con tu contenido; la descarga se desbloqueará con un pago único en USDT.",
  path: "/premium",
});

const STEPS = [
  {
    title: "La pruebas gratis",
    text: "Selecciónala en el editor y mira tu CV real con ese diseño, con marca de agua.",
  },
  {
    title: "Pagas en USDT",
    text: "Un pago único por plantilla, sin suscripción ni datos bancarios.",
  },
  {
    title: "Se desbloquea al instante",
    text: "La plantilla queda disponible en este navegador y exporta sin marca de agua.",
  },
];

export default function PremiumPage() {
  return (
    <Container className="py-16">
      <Reveal className="max-w-2xl">
        <Badge tone="premium">Próximamente</Badge>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Plantillas premium
        </h1>
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">
          Diecisiete diseños con maquetación más trabajada para perfiles que
          necesitan destacar. Puedes probarlos ahora mismo en el editor y ver tu
          CV con cualquiera de ellos. El pago se hará{" "}
          <strong className="text-ink font-semibold">en USDT</strong>, con un
          cobro único por plantilla.
        </p>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Todavía no hay pasarela de pago conectada, así que de momento las
          plantillas premium se pueden previsualizar pero no descargar. Las tres
          plantillas gratuitas seguirán siendo gratuitas y sin marca de agua.
        </p>
      </Reveal>

      {/* Placeholder for the future checkout — no wallet, no payment logic. */}
      <Reveal className="mt-10">
        <div className="border-primary-200 bg-primary-soft rounded-card border border-dashed p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-primary font-semibold">
                Pago en USDT — pendiente de integrar
              </p>
              <p className="text-ink-soft mt-1 text-sm">
                Aquí aparecerán la red (TRC-20 / ERC-20), el importe y el código
                QR de pago.
              </p>
            </div>
            <button
              type="button"
              disabled
              className={buttonStyles({ className: "cursor-not-allowed" })}
            >
              Pagar con USDT
            </button>
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
