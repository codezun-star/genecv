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
import { buildMetadata, siteConfig } from "@/lib/site";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

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
