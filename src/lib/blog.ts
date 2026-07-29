import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { cache } from "react";
import { unified } from "unified";

import type { RegionId } from "@/lib/cv/types";

/**
 * File-based blog. Articles are plain Markdown in `content/articulos`, parsed
 * at build time — no database, no CMS. Dropping a new `.md` file in that
 * directory is all it takes to publish.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "articulos");

export interface FaqEntry {
  q: string;
  a: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  /** Meta description — keep it around 150-160 characters. */
  description: string;
  /** Shorter headline used in listings when the SEO title is long. */
  cardTitle: string;
  country: string;
  countryCode: string;
  /** Which CV preset this market maps to, used for the "create" CTA. */
  region: RegionId;
  /** Grouping bucket for the index page. */
  group: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  faq: FaqEntry[];
  related: string[];
}

export interface Heading {
  id: string;
  text: string;
}

export interface Article extends ArticleMeta {
  /** Rendered HTML body. */
  html: string;
  /** Top-level headings, for the table of contents. */
  headings: Heading[];
  wordCount: number;
}

function readFrontmatter(fileName: string): { meta: ArticleMeta; body: string } {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    body: content,
    meta: {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      cardTitle: String(data.cardTitle ?? data.title ?? slug),
      country: String(data.country ?? ""),
      countryCode: String(data.countryCode ?? ""),
      region: (data.region ?? "europa") as RegionId,
      group: String(data.group ?? "Otros"),
      keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
      publishedAt: String(data.publishedAt ?? ""),
      updatedAt: String(data.updatedAt ?? data.publishedAt ?? ""),
      // Trust the frontmatter when present, otherwise ~200 wpm.
      readingMinutes: Number(data.readingMinutes ?? Math.ceil(words / 200)),
      faq: Array.isArray(data.faq)
        ? data.faq.map((entry: { q: string; a: string }) => ({
            q: String(entry.q),
            a: String(entry.a),
          }))
        : [],
      related: Array.isArray(data.related) ? data.related.map(String) : [],
    },
  };
}

/** All articles, newest first. Cached per request. */
export const getAllArticles = cache((): ArticleMeta[] => {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => readFrontmatter(file).meta)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

/** Articles bucketed by their `group`, preserving a sensible reading order. */
export const getArticlesByGroup = cache(() => {
  const order = [
    "España y Europa",
    "Latinoamérica",
    "Mercado anglosajón",
    "Guías generales",
  ];
  const articles = getAllArticles();

  return order
    .map((group) => ({
      group,
      articles: articles.filter((article) => article.group === group),
    }))
    .filter((bucket) => bucket.articles.length > 0);
});

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  // Stable heading ids so the table of contents can link to them.
  .use(rehypeSlug)
  .use(rehypeStringify);

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const { meta, body } = readFrontmatter(`${slug}.md`);

  // Wrap tables so wide comparison tables scroll inside their own box instead
  // of forcing the whole page to scroll sideways on a phone.
  const html = String(await processor.process(body)).replace(
    /<table>/g,
    '<div class="article-table"><table>',
  ).replace(/<\/table>/g, "</table></div>");

  // Pull the table of contents straight out of the rendered markup so it can
  // never drift from the ids rehype-slug actually emitted.
  const headings: Heading[] = [];
  const pattern = /<h2 id="([^"]+)">(.*?)<\/h2>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    headings.push({
      id: match[1],
      text: match[2].replace(/<[^>]+>/g, "").trim(),
    });
  }

  return {
    ...meta,
    html,
    headings,
    wordCount: body.split(/\s+/).filter(Boolean).length,
  };
});

export function getRelated(article: ArticleMeta, limit = 3): ArticleMeta[] {
  const all = getAllArticles();
  const bySlug = new Map(all.map((a) => [a.slug, a]));

  const explicit = article.related
    .map((slug) => bySlug.get(slug))
    .filter((a): a is ArticleMeta => Boolean(a));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Fill the remainder with other articles from the same group.
  const fallback = all.filter(
    (a) =>
      a.slug !== article.slug &&
      a.group === article.group &&
      !explicit.some((e) => e.slug === a.slug),
  );

  return [...explicit, ...fallback].slice(0, limit);
}
