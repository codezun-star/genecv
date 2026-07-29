import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getAllArticles, getArticle, getRelated } from "@/lib/blog";
import { getRegion } from "@/lib/cv/regions";
import { buildMetadata, siteConfig } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return buildMetadata({
      title: "Artículo no encontrado",
      description: "Esta guía no existe o ha cambiado de dirección.",
      path: `/articulos/${slug}`,
      index: false,
    });
  }

  const base = buildMetadata({
    title: article.title,
    description: article.description,
    path: `/articulos/${article.slug}`,
    keywords: article.keywords,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ["GeneCV"],
      tags: article.keywords,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const url = `${siteConfig.url}/articulos/${article.slug}`;
  const related = getRelated(article);
  const region = getRegion(article.region);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      inLanguage: "es",
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      wordCount: article.wordCount,
      keywords: article.keywords.join(", "),
      author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Artículos",
          item: `${siteConfig.url}/articulos`,
        },
        { "@type": "ListItem", position: 3, name: article.cardTitle, item: url },
      ],
    },
    ...(article.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faq.map((entry) => ({
              "@type": "Question",
              name: entry.q,
              acceptedAnswer: { "@type": "Answer", text: entry.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container size="narrow" className="py-12">
        {/* Breadcrumbs mirror the BreadcrumbList above. */}
        <nav aria-label="Migas de pan" className="text-ink-muted text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary transition-colors duration-150">
                Inicio
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href="/articulos"
                className="hover:text-primary transition-colors duration-150"
              >
                Artículos
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink-soft">{article.country}</li>
          </ol>
        </nav>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="secondary">{article.country}</Badge>
            <span className="text-ink-muted text-xs">
              {article.readingMinutes} min de lectura
            </span>
          </div>

          <h1 className="mt-4 text-4xl leading-[1.12] font-bold sm:text-[2.75rem]">
            {article.title}
          </h1>

          <p className="text-ink-soft mt-4 text-lg leading-relaxed">
            {article.description}
          </p>

          <p className="text-ink-muted mt-5 text-xs">
            Publicado el {formatDate(article.publishedAt)}
            {article.updatedAt !== article.publishedAt && (
              <> · Actualizado el {formatDate(article.updatedAt)}</>
            )}
          </p>
        </header>

        <div className="my-8">
          <AdSlot slotId={`article-top-${article.slug}`} format="leaderboard" />
        </div>

        {article.headings.length > 2 && (
          <nav
            aria-label="Contenido del artículo"
            className="border-line bg-canvas rounded-card border p-5"
          >
            <h2 className="font-display text-ink text-sm font-semibold">
              En esta guía
            </h2>
            <ol className="mt-3 space-y-1.5">
              {article.headings.map((heading, i) => (
                <li key={heading.id} className="flex gap-2 text-sm">
                  <span className="text-ink-muted tabular-nums">{i + 1}.</span>
                  <a
                    href={`#${heading.id}`}
                    className="text-secondary hover:text-primary transition-colors duration-150"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body is authored Markdown from this repository, not user input. */}
        <div
          className="article-body mt-10"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* Contextual CTA: preselects the format this guide is about. */}
        <aside className="bg-primary rounded-card mt-12 p-7 text-center">
          <h2 className="text-canvas text-2xl font-bold">
            Crea tu {region.documentName} para {article.country}
          </h2>
          <p className="text-primary-100 mx-auto mt-3 max-w-md leading-relaxed">
            GeneCV aplica el formato de {region.label} automáticamente: foto,
            orden de secciones y terminología. Gratis y sin registro.
          </p>
          <Link
            href={`/crear?formato=${article.region}`}
            className={buttonStyles({
              size: "lg",
              className: "text-primary mt-6 bg-white shadow-none hover:bg-canvas-dark",
            })}
          >
            Crear mi CV gratis
          </Link>
        </aside>

        {article.faq.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
            <div className="mt-5 space-y-3">
              {article.faq.map((entry) => (
                <details
                  key={entry.q}
                  className="border-line bg-canvas group rounded-card border p-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="font-display flex cursor-pointer items-center justify-between gap-4 font-semibold">
                    {entry.q}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      className="text-secondary size-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                      aria-hidden
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="text-ink-soft mt-3 leading-relaxed">{entry.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Sigue leyendo</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/articulos/${item.slug}`}
                  className="group block"
                >
                  <Card className="group-hover:border-secondary-200 group-hover:shadow-lift h-full transition-[border-color,box-shadow] duration-200">
                    <Badge tone="secondary">{item.country}</Badge>
                    <CardTitle className="group-hover:text-primary mt-3 text-base transition-colors duration-150">
                      {item.cardTitle}
                    </CardTitle>
                    <CardText className="line-clamp-2">
                      {item.description}
                    </CardText>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14">
          <AdSlot
            slotId={`article-bottom-${article.slug}`}
            format="leaderboard"
          />
        </div>
      </Container>
    </>
  );
}
