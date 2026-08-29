import { AdBanner } from "@/components/ads/ad-banner";
import { NativeAd } from "@/components/ads/native-ad";
import { Hero } from "@/components/landing/hero";
import {
  Faq,
  Features,
  FinalCta,
  Formats,
  HowItWorks,
  TemplatesShowcase,
} from "@/components/landing/sections";
import { Container } from "@/components/layout/container";
import { HOME_STEPS, homeFaq } from "@/lib/landing-content";
import {
  absoluteUrl,
  buildMetadata,
  faqJsonLd,
  howToJsonLd,
  organizationJsonLd,
  publisherJsonLd,
  siteConfig,
  webSiteJsonLd,
} from "@/lib/site";

export const metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  keywords: [
    "generador de cv gratis",
    "crear curriculum online",
    "plantillas cv ats",
    "curriculum vitae pdf",
  ],
});

const jsonLd = [
  webSiteJsonLd,
  organizationJsonLd,
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteConfig.url}/#webapp`,
    name: siteConfig.name,
    url: `${siteConfig.url}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requiere JavaScript",
    description: siteConfig.description,
    image: absoluteUrl(siteConfig.logo),
    inLanguage: siteConfig.lang,
    publisher: publisherJsonLd,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    // Lo que sabe hacer la herramienta, en una lista y no repartido por seis
    // tarjetas: es de donde un asistente saca "¿qué hace GeneCV?".
    featureList: [
      "Vista previa del CV en tiempo real",
      "Verificador de compatibilidad con ATS",
      "Banco de frases por profesión",
      "Secciones reordenables",
      "Guardado automático en el navegador",
      "Exportación a PDF sin marca de agua",
      "Formatos de CV para Europa, Latinoamérica y el mundo anglosajón",
    ],
  },
  // El bloque de preguntas y los tres pasos ya están en la página; aquí se
  // declaran para que se puedan extraer sin interpretar el HTML.
  faqJsonLd(homeFaq()),
  howToJsonLd(HOME_STEPS),
].filter((schema): schema is Record<string, unknown> => schema !== null);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled payload. `<` is escaped anyway: a string
        // containing `</script>` would otherwise close the tag early and spill
        // the rest of the JSON into the page as markup.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      {/* Justo bajo el pliegue: es el hueco que más se ve de la portada. */}
      <Container className="pb-6">
        <AdBanner placement="banner" />
      </Container>
      <Features />
      <Formats />
      <Container className="py-12">
        <AdBanner placement="banner" />
      </Container>
      <HowItWorks />
      <TemplatesShowcase />
      {/* El nativo va aquí, con la vista puesta en las plantillas: es donde el
          visitante está eligiendo y donde una fila de piezas parecidas a
          tarjetas se lee como una recomendación más. */}
      <Container className="py-14">
        <NativeAd />
      </Container>
      <Faq />
      <Container className="pb-12">
        <AdBanner placement="banner" />
      </Container>
      <FinalCta />
    </>
  );
}
