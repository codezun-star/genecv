import Link from "next/link";
import { notFound } from "next/navigation";

import { AdBanner } from "@/components/ads/ad-banner";
import { NativeAd } from "@/components/ads/native-ad";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import {
  getAllArticles,
  getArticle,
  getRelated,
  splitBodyIntoSections,
} from "@/lib/blog";
import { getRegion } from "@/lib/cv/regions";
import {
  OG_IMAGE,
  breadcrumbJsonLd,
  buildMetadata,
  publisherJsonLd,
  siteConfig,
} from "@/lib/site";
import { cn } from "@/lib/utils";

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

  // `metaDescription` es la versión que cabe en un resultado de búsqueda; la
  // larga se queda para la entradilla que se ve en la página.
  const base = buildMetadata({
    title: article.title,
    description: article.metaDescription,
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

/**
 * Cada cuántas secciones se intercala un anuncio dentro del texto.
 *
 * Las guías son largas —de ocho a quince encabezados— y son la página con más
 * tráfico del sitio, así que el inventario de verdad está aquí dentro y no en
 * los extremos del artículo. Uno cada dos secciones deja siempre un tramo de
 * lectura entre medias, y la entradilla se queda limpia: un anuncio antes del
 * primer encabezado es lo que hace que una guía parezca otra cosa.
 */
const AD_EVERY = 2;

function adAfterSection(index: number, total: number): boolean {
  // Ni en la entradilla ni tras el último trozo, donde ya van el nativo y la
  // llamada a la acción.
  if (index === 0 || index === total - 1) return false;
  return index % AD_EVERY === 0;
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
  const sections = splitBodyIntoSections(article.html);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      inLanguage: siteConfig.lang,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      // Google pide `image` en los datos de un artículo, y sin ella la guía
      // queda fuera de los resultados que llevan miniatura. No hay una imagen
      // por guía, así que va la del sitio: es la misma que ya viaja en la
      // tarjeta social de esta página, no una que no exista.
      image: [OG_IMAGE.url],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      wordCount: article.wordCount,
      keywords: article.keywords.join(", "),
      articleSection: article.group,
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      publisher: publisherJsonLd,
    },
    // Las mismas migas que pinta la navegación de abajo, con el helper
    // compartido en lugar de una copia a mano que ya se había desviado: la
    // suya apuntaba a `siteConfig.url` sin barra final para «Inicio», y la de
    // las demás páginas del sitio la lleva.
    breadcrumbJsonLd([
      { name: "Artículos", path: "/articulos" },
      { name: article.cardTitle, path: `/articulos/${article.slug}` },
    ]),
    ...(article.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: siteConfig.lang,
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/*
        El artículo sigue midiendo lo mismo —48rem, lo que se lee cómodo—. El
        contenedor se ensancha solo para colgar, a partir de 1280 px, una
        columna de 160 px con un rascacielos fijo: es el formato con más
        visibilidad de todos, porque acompaña al lector los diez minutos que
        dura la guía en vez de aparecer una vez y perderse hacia arriba.
      */}
      <Container size="wide" className="py-12">
        <div className="mx-auto grid max-w-3xl gap-8 xl:max-w-none xl:grid-cols-[minmax(0,48rem)_10rem] xl:justify-center">
          <div className="min-w-0">
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

            {/* Encima del índice: se ve sin desplazar y no parte la lectura,
                que aún no ha empezado. */}
            <AdBanner placement="banner" className="my-10" />

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

            {/* Body is authored Markdown from this repository, not user
                input. Va troceado por encabezados para intercalar publicidad
                entre secciones; cada trozo conserva su propio `.article-body`
                porque el CSS de tipografía usa selectores de hijo directo y un
                envoltorio común se los llevaría por delante. */}
            {sections.map((section, index) => (
              <div key={index}>
                <div
                  className={cn("article-body", index === 0 && "mt-10")}
                  dangerouslySetInnerHTML={{ __html: section }}
                />
                {adAfterSection(index, sections.length) && (
                  <AdBanner
                    placement={index % 4 === 0 ? "block" : "banner"}
                    className="my-12"
                  />
                )}
              </div>
            ))}

            {/* Terminado el texto y antes de la llamada a la acción: el lector ya
                ha resuelto su duda y es justo cuando se va. */}
            <NativeAd className="mt-12" />

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

            <AdBanner placement="banner" className="mt-14" />

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
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AdBanner placement="tower" />
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
