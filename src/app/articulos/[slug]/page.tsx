import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { ARTICLES, getArticle } from "@/lib/articles";
import { buildMetadata, siteConfig } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return buildMetadata({
      title: "Artículo no encontrado",
      description: "Esta guía no existe o ha cambiado de dirección.",
      path: `/articulos/${slug}`,
      index: false,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/articulos/${article.slug}`,
    // Keep drafts out of the index until the body is written.
    index: article.publishedAt !== null,
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "es",
    url: `${siteConfig.url}/articulos/${article.slug}`,
    publisher: { "@type": "Organization", name: siteConfig.name },
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
  };

  return (
    <Container size="narrow" className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/articulos"
        className="text-secondary hover:text-primary text-sm font-medium transition-colors duration-150"
      >
        ← Todas las guías
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="secondary">{article.countryLabel}</Badge>
        {!article.publishedAt && <Badge tone="warning">En preparación</Badge>}
      </div>

      <h1 className="mt-4 text-4xl font-bold sm:text-[2.75rem]">
        {article.title}
      </h1>
      <p className="text-ink-soft mt-4 text-lg leading-relaxed">
        {article.description}
      </p>

      <div className="my-10">
        <AdSlot slotId={`article-${article.slug}`} format="leaderboard" />
      </div>

      {article.body ? (
        <div className="prose-genecv text-ink-soft leading-relaxed">
          {article.body}
        </div>
      ) : (
        <div className="border-line bg-canvas rounded-card border border-dashed p-8 text-center">
          <p className="font-display text-ink font-semibold">
            Estamos escribiendo esta guía
          </p>
          <p className="text-ink-soft mx-auto mt-2 max-w-md text-sm leading-relaxed">
            Mientras tanto puedes empezar tu CV: al elegir el formato de{" "}
            {article.countryLabel} ajustamos la foto, el orden de las secciones y
            la terminología automáticamente.
          </p>
          <Link href="/crear" className={buttonStyles({ className: "mt-6" })}>
            Crear mi CV
          </Link>
        </div>
      )}
    </Container>
  );
}
