import { AdBanner } from "@/components/ads/ad-banner";
import { Container } from "@/components/layout/container";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacidad",
  description:
    "GeneCV no tiene cuentas ni base de datos: tu CV y tu foto se guardan únicamente en el almacenamiento local de tu navegador. Qué datos ve la red de publicidad y cuáles no.",
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
            El sitio muestra publicidad de una red externa —los dominios{" "}
            <code>highrevenueformat.com</code> y{" "}
            <code>profitableratecpmnetwork.com</code>—, que es lo que paga que
            todo lo demás sea gratis. Cada anuncio va rotulado como
            «Publicidad».
          </p>
          <p className="mt-2">
            Esos anuncios los sirve la red directamente en tu navegador, así
            que recibe lo que recibe cualquier servidor al que tu navegador
            pide algo: tu dirección IP, el navegador y sistema que usas y la
            página desde la que se pide el anuncio. Puede además instalar
            cookies o identificadores propios para no repetirte el mismo
            anuncio y para contar cuántas veces se ha visto. Esas cookies son
            suyas, no nuestras, y se rigen por su política.
          </p>
          <p className="mt-2">
            Lo que <strong className="text-ink font-semibold">no</strong> sale
            de tu navegador es tu CV. La red no recibe ni tus datos, ni tu foto,
            ni el PDF: nada de lo que escribes en el editor se le envía, porque
            nunca sale de tu dispositivo. Tampoco hay analítica propia: no
            medimos ni guardamos tus visitas.
          </p>
          <p className="mt-2">
            Si usas un bloqueador de anuncios no pasa nada: el editor, las
            plantillas y la descarga del PDF funcionan igual, y no se te va a
            pedir que lo desactives.
          </p>
        </section>
      </div>

      <AdBanner placement="banner" className="mt-14" />
    </Container>
  );
}
