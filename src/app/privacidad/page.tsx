import { Container } from "@/components/layout/container";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacidad",
  description:
    "GeneCV no tiene cuentas ni base de datos: tu CV y tu foto se guardan únicamente en el almacenamiento local de tu navegador.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <Container size="narrow" className="py-16">
      <h1 className="text-4xl font-bold">Privacidad</h1>
      <div className="text-ink-soft mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Dónde se guardan tus datos
          </h2>
          <p className="mt-2">
            Todo lo que escribes en el editor —incluida la fotografía, si decides
            añadirla— se guarda en el <code>localStorage</code> de tu navegador.
            No se envía a ningún servidor de {siteConfig.name} ni a terceros, y
            no existe ninguna cuenta de usuario asociada.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Cómo borrar tus datos
          </h2>
          <p className="mt-2">
            Puedes usar el botón «Borrar borrador» dentro del editor, o limpiar
            los datos de sitio de tu navegador. En ambos casos la eliminación es
            inmediata y definitiva: no conservamos copias.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Generación del PDF
          </h2>
          <p className="mt-2">
            El PDF se genera en tu propio dispositivo. El archivo no pasa por
            ningún servicio externo antes de descargarse.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-display text-xl font-semibold">
            Publicidad y analítica
          </h2>
          <p className="mt-2">
            El sitio reserva espacios para publicidad. Cuando se integre una red
            de anuncios, esta sección detallará qué proveedor se utiliza y qué
            cookies instala. A día de hoy no hay anuncios ni analítica activos.
          </p>
        </section>
      </div>
    </Container>
  );
}
