import { Hero } from "@/components/landing/hero";
import {
  Faq,
  Features,
  FinalCta,
  Formats,
  HowItWorks,
  TemplatesShowcase,
} from "@/components/landing/sections";
import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import {
  absoluteUrl,
  buildMetadata,
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
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled payload.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Container className="pb-4">
        <AdSlot slotId="home-top" format="leaderboard" />
      </Container>
      <Features />
      <Formats />
      <HowItWorks />
      <TemplatesShowcase />
      <Container className="py-12">
        <AdSlot slotId="home-mid" format="leaderboard" />
      </Container>
      <Faq />
      <FinalCta />
    </>
  );
}
