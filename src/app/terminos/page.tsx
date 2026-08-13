import { Container } from "@/components/layout/container";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Términos de uso",
  description: `Condiciones de uso de ${siteConfig.name}, el generador de currículums gratuito de Codezun.`,
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <Container size="narrow" className="py-16">
      <h1 className="text-4xl font-bold">Términos de uso</h1>
      <div className="text-ink-soft mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            El servicio
          </h2>
          <p className="mt-2">
            {siteConfig.name} es una herramienta gratuita para crear currículums.
            Se ofrece «tal cual», sin garantía de disponibilidad continua ni de
            resultados en tus procesos de selección.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Tu contenido
          </h2>
          <p className="mt-2">
            El contenido que introduces es tuyo. Como no se almacena en nuestros
            servidores, eres responsable de conservar una copia del PDF que
            descargues.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Plantillas premium
          </h2>
          <p className="mt-2">
            {"Las plantillas premium se venden como un pase de descarga: un pago único desbloquea todas las plantillas premium y da derecho a generar un (1) PDF sin marca de agua. El pase se consume en el momento de la descarga y no constituye un acceso permanente ni reutilizable; para obtener un PDF adicional hay que adquirir un pase nuevo. El cobro lo procesa Paddle, que actúa como comerciante registrado y emite la factura. Para reembolsos, escríbenos indicando el identificador de la transacción."}
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Uso aceptable
          </h2>
          <p className="mt-2">
            No utilices el servicio para generar documentos fraudulentos ni para
            suplantar la identidad de otra persona.
          </p>
        </section>
      </div>
    </Container>
  );
}
