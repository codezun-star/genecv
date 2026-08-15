import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { getAllArticles, getArticlesByGroup } from "@/lib/blog";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Guías para hacer tu CV por país",
  description:
    "Cómo se escribe un currículum en España, México, Argentina, Colombia, Chile, Alemania, Estados Unidos y más: formato, foto, extensión y errores que descartan.",
  path: "/articulos",
  keywords: [
    "como hacer un cv",
    "curriculum por país",
    "guía curriculum vitae",
    "formato cv internacional",
  ],
});

export default function ArticlesPage() {
  const groups = getArticlesByGroup();
  const all = getAllArticles();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guías para hacer tu CV por país",
    url: `${siteConfig.url}/articulos`,
    inLanguage: "es",
    hasPart: all.map((article) => ({
      "@type": "Article",
      headline: article.title,
      url: `${siteConfig.url}/articulos/${article.slug}`,
      datePublished: article.publishedAt,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-16">
        <Reveal className="max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Guías por país</h1>
          <p className="text-ink-soft mt-4 text-lg leading-relaxed">
            Lo que funciona en un mercado descarta en otro: la foto, la
            extensión, los datos personales y hasta el nombre del documento
            cambian. Estas {all.length} guías explican qué espera cada país y
            cómo configurar GeneCV para ese formato.
          </p>
        </Reveal>

        {groups.map((bucket) => (
          <section key={bucket.group} className="mt-14">
            <Reveal>
              <h2 className="text-2xl font-bold">{bucket.group}</h2>
            </Reveal>

            <RevealGroup className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bucket.articles.map((article) => (
                <RevealItem key={article.slug}>
                  <Link
                    href={`/articulos/${article.slug}`}
                    className="group block h-full"
                  >
                    <Card className="group-hover:border-secondary-200 group-hover:shadow-lift h-full transition-[box-shadow,border-color] duration-200">
                      <Badge tone="secondary">{article.country}</Badge>
                      <CardTitle className="group-hover:text-primary mt-4 text-lg transition-colors duration-150">
                        {article.cardTitle}
                      </CardTitle>
                      <CardText className="line-clamp-3">
                        {article.description}
                      </CardText>
                      <p className="text-ink-muted mt-4 text-xs">
                        {article.readingMinutes} min de lectura
                      </p>
                    </Card>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ))}
      </Container>
    </>
  );
}
