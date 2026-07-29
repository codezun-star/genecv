import Link from "next/link";

import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { ARTICLES } from "@/lib/articles";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Guías para hacer tu CV por país",
  description:
    "Cómo se escribe un currículum en España, México, Argentina, Colombia, Estados Unidos y Reino Unido: formato, foto, extensión y errores frecuentes.",
  path: "/articulos",
  keywords: ["como hacer un cv", "cv por país", "guía curriculum"],
});

export default function ArticlesPage() {
  return (
    <Container className="py-16">
      <Reveal className="max-w-2xl">
        <h1 className="text-4xl font-bold sm:text-5xl">Guías por país</h1>
        <p className="text-ink-soft mt-4 text-lg leading-relaxed">
          Lo que funciona en un mercado no siempre funciona en otro. Estas guías
          explican qué espera cada país y cómo configurar GeneCV para ese
          formato.
        </p>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((article) => (
          <RevealItem key={article.slug}>
            <Link
              href={`/articulos/${article.slug}`}
              className="group block h-full"
            >
              <Card className="group-hover:border-secondary-200 group-hover:shadow-lift h-full transition-[box-shadow,border-color] duration-200">
                <div className="flex items-center gap-2">
                  <Badge tone="secondary">{article.countryLabel}</Badge>
                  {!article.publishedAt && (
                    <Badge tone="warning">En preparación</Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary mt-4 text-lg transition-colors duration-150">
                  {article.title}
                </CardTitle>
                <CardText>{article.description}</CardText>
                <p className="text-ink-muted mt-4 text-xs">
                  {article.readingMinutes} min de lectura
                </p>
              </Card>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-14">
        <AdSlot slotId="articles-bottom" format="leaderboard" />
      </div>
    </Container>
  );
}
