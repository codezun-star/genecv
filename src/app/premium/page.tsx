import Link from "next/link";

import { TemplateThumb } from "@/components/cv/template-thumb";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { FREE_LAUNCH_COPY, isFreeLaunch } from "@/lib/payments/mode";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: isFreeLaunch()
    ? "Plantillas premium — gratis durante el lanzamiento"
    : "Plantillas premium — pruébalas gratis, paga solo la descarga",
  description: isFreeLaunch()
    ? "Diecisiete diseños premium de CV: barras laterales, líneas de tiempo y retículas editoriales. Durante el lanzamiento se descargan gratis y sin marca de agua."
    : "Diecisiete diseños premium de CV: barras laterales, líneas de tiempo y retículas editoriales. Pruébalos gratis con tu contenido y paga solo cuando descargues el PDF sin marca de agua.",
  path: "/premium",
});

const PAID_STEPS = [
  {
    title: "La pruebas gratis",
    text: "Selecciónala en el editor y mira tu CV real con ese diseño, con marca de agua.",
  },
  {
    title: "Pagas esa descarga",
    text: "Un pago único con tarjeta a través de Paddle. Sin suscripción y sin crear ninguna cuenta.",
  },
  {
    title: "Descargas al instante",
    text: "El PDF sin marca de agua se genera y descarga en la misma sesión, sin esperas.",
  },
];

const FREE_LAUNCH_STEPS = [
  {
    title: "Montas tu CV",
    text: "El editor es el mismo para todas las plantillas, gratuitas y premium.",
  },
  {
    title: "Eliges un diseño premium",
    text: "Lo ves aplicado a tu contenido real en la vista previa, sin marca de agua.",
  },
  {
    title: "Descargas gratis",
    text: "Durante el lanzamiento no hay pago ni registro. Más adelante estas plantillas pasarán a ser de pago.",
  },
];

const STEPS = isFreeLaunch() ? FREE_LAUNCH_STEPS : PAID_STEPS;

export default function PremiumPage() {
  return (
    <Container className="py-16">
      <Reveal className="max-w-2xl">
        <Badge tone={isFreeLaunch() ? "success" : "premium"}>
          {isFreeLaunch() ? FREE_LAUNCH_COPY.badge : "Próximamente"}
        </Badge>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Plantillas premium
        </h1>
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">
          Diecisiete diseños con maquetación más trabajada para perfiles que
          necesitan destacar.{" "}
          {isFreeLaunch() ? (
            <strong className="text-ink font-semibold">
              {FREE_LAUNCH_COPY.landingLead}
            </strong>
          ) : (
            <>
              Puedes probarlos ahora mismo en el editor y ver tu CV con
              cualquiera de ellos. Lo que se paga es{" "}
              <strong className="text-ink font-semibold">
                una descarga concreta
              </strong>
              , no un acceso permanente: si más adelante quieres otro PDF, se
              paga de nuevo.
            </>
          )}
        </p>
        <p className="text-ink-soft mt-3 leading-relaxed">
          {isFreeLaunch()
            ? "No hay cuentas, ni contraseñas, ni pasarela de pago activa: montas tu CV y lo descargas. Las tres plantillas gratuitas seguirán siendo gratuitas siempre."
            : "No hay cuentas ni contraseñas: el correo se pide solo porque la pasarela lo necesita para emitir la factura. Las tres plantillas gratuitas seguirán siendo gratuitas y sin marca de agua."}
        </p>
      </Reveal>

      <Reveal className="mt-10">
        <div className="border-primary-200 bg-primary-soft rounded-card border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-primary font-semibold">
                {isFreeLaunch()
                  ? "Ahora mismo son gratis"
                  : "El pago ocurre dentro del editor"}
              </p>
              <p className="text-ink-soft mt-1 text-sm">
                {isFreeLaunch()
                  ? "Monta tu CV, elige un diseño premium y descárgalo sin coste ni marca de agua."
                  : "Monta tu CV, elige un diseño premium y paga en el último paso. El PDF se descarga en esa misma sesión."}
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
                <div className={isFreeLaunch() ? undefined : "blur-[1.5px]"}>
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
