import { EditorShell } from "@/components/editor/editor-shell";
import { Container } from "@/components/layout/container";
import { REGION_LIST } from "@/lib/cv/regions";
import { FREE_TEMPLATES, PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { HOME_STEPS } from "@/lib/landing-content";
import {
  breadcrumbJsonLd,
  buildMetadata,
  howToJsonLd,
  publisherJsonLd,
  siteConfig,
} from "@/lib/site";

export const metadata = buildMetadata({
  title: "Crear mi CV gratis",
  description:
    "Editor guiado de currículum: elige el formato de tu país, completa el formulario paso a paso, comprueba la compatibilidad ATS y descarga el PDF.",
  path: "/crear",
  keywords: ["crear cv online", "editor de curriculum", "cv gratis pdf"],
});

const TOTAL_TEMPLATES = FREE_TEMPLATES.length + PREMIUM_TEMPLATES.length;

/**
 * La cabecera del editor, y por qué existe.
 *
 * `EditorShell` es un componente de cliente que hasta que no hidrata pinta
 * «Cargando tu borrador…», así que lo que un rastreador se encontraba en
 * /crear era una página indexable, con prioridad 0,9 en el sitemap y
 * apuntando a «crear cv online», cuyo HTML no tenía ni un `<h1>` ni una sola
 * frase sobre lo que hace: los únicos encabezados del documento eran los del
 * pie. Este bloque se renderiza en el servidor, así que viaja en el HTML
 * inicial y describe la herramienta antes de que arranque el JavaScript.
 *
 * Va deliberadamente corto: es el editor lo que se ha venido a usar, y un
 * muro de texto por encima solo empujaría el formulario fuera de la pantalla.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteConfig.url}/crear#app`,
    name: `${siteConfig.name} — Editor de CV`,
    url: `${siteConfig.url}/crear`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requiere JavaScript",
    description:
      "Editor de currículum en el navegador: formulario paso a paso, vista previa en tiempo real, verificador ATS y exportación a PDF.",
    inLanguage: siteConfig.lang,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    publisher: publisherJsonLd,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  howToJsonLd(HOME_STEPS),
  breadcrumbJsonLd([{ name: "Crear mi CV", path: "/crear" }]),
];

export default function CreatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Container size="wide" className="pt-10 pb-2">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Crear mi CV</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Rellena el formulario paso a paso y ve tu currículum tomando forma
            al lado, en tiempo real. Elige entre {TOTAL_TEMPLATES} plantillas,
            comprueba que pasará los filtros ATS y descarga el PDF sin marca de
            agua, sin registrarte y sin pagar nada.
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-relaxed">
            Formatos disponibles:{" "}
            {REGION_LIST.map((region) => region.label).join(", ")}. Todo se
            guarda solo en este navegador: ni tus datos ni tu foto salen del
            dispositivo.
          </p>
        </div>
      </Container>

      <EditorShell />
    </>
  );
}
