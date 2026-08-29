import Link from "next/link";
import { Fragment } from "react";

import { AdBanner } from "@/components/ads/ad-banner";
import { NativeAd } from "@/components/ads/native-ad";
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

        <AdBanner placement="banner" className="mt-10" />

        {groups.map((bucket, groupIndex) => (
          <section key={bucket.group} className="mt-14">
            <Reveal>
              <h2 className="text-2xl font-bold">{bucket.group}</h2>
            </Reveal>

            <RevealGroup className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bucket.articles.map((article, index) => (
                <Fragment key={article.slug}>
                  {/* Una celda de la rejilla, al empezar la segunda fila: el
                      rectángulo mide justo lo que una tarjeta y no descoloca
                      nada. Solo en el primer grupo y solo si hay tarjetas de
                      sobra, para no dejar una rejilla que es casi toda
                      anuncio. */}
                  {groupIndex === 0 &&
                    index === 3 &&
                    bucket.articles.length > 4 && (
                      <RevealItem className="flex items-center justify-center sm:col-span-2 lg:col-span-1">
                        <AdBanner placement="block" />
                      </RevealItem>
                    )}
                  <RevealItem>
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
                </Fragment>
              ))}
            </RevealGroup>

            {/* El nativo va tras el primer grupo, que es hasta donde llega la
                mayoría; los grupos de en medio llevan franja, y los dos
                últimos —de un artículo cada uno— se quedan con la del pie. */}
            {groupIndex === 0 ? (
              <NativeAd className="mt-12" />
            ) : (
              groupIndex <= 2 && (
                <AdBanner placement="banner" className="mt-12" />
              )
            )}
          </section>
        ))}

        <AdBanner placement="banner" className="mt-16" />
      </Container>
    </>
  );
}
