import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  KB_ARTICLE_BY_SLUG,
  KB_ARTICLES,
  KB_CATEGORIES,
  KB_SUPPORTED_LOCALES,
  type KbArticle,
  type KbCategory,
  type KbLocale,
  type LocalizedString,
} from "@/lib/kb/knowledge-base-content";

export type KbBreadcrumb = { label: string; href: string };

export type KbSearchResult = {
  slug: string;
  title: string;
  summary: string;
  categoryId: string;
  score: number;
};

export type KbTreeSection = {
  category: KbCategory;
  articles: Array<{ slug: string; title: string; summary: string }>;
};

export type KbFeedbackStats = {
  helpful: number;
  notHelpful: number;
};

const FEEDBACK_PATH = join(process.cwd(), "data/kb-feedback.json");

function readFeedbackStore(): Record<string, KbFeedbackStats> {
  try {
    if (!existsSync(FEEDBACK_PATH)) return {};
    return JSON.parse(readFileSync(FEEDBACK_PATH, "utf8")) as Record<string, KbFeedbackStats>;
  } catch {
    return {};
  }
}

function writeFeedbackStore(store: Record<string, KbFeedbackStats>): void {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(FEEDBACK_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function resolveKbLocale(raw?: string | null): KbLocale {
  const code = raw?.toLowerCase().slice(0, 2);
  if (code === "fr" || code === "es" || code === "en") return code;
  return "en";
}

export function localizedText(value: LocalizedString, locale: KbLocale): string {
  return value[locale] ?? value.en;
}

export function slugPathToString(slugPath: string[] | undefined): string | null {
  if (!slugPath?.length) return null;
  return slugPath.join("/");
}

export function getKbArticle(slug: string, locale: KbLocale): KbArticle | null {
  const article = KB_ARTICLE_BY_SLUG.get(slug);
  if (!article) return null;
  return article;
}

export function getKbCategory(categoryId: string): KbCategory | null {
  return KB_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getKbTree(locale: KbLocale): KbTreeSection[] {
  return KB_CATEGORIES.map((category) => ({
    category,
    articles: category.articleSlugs
      .map((slug) => KB_ARTICLE_BY_SLUG.get(slug))
      .filter((article): article is KbArticle => Boolean(article))
      .map((article) => ({
        slug: article.slug,
        title: localizedText(article.title, locale),
        summary: localizedText(article.summary, locale),
      })),
  }));
}

export function getKbBreadcrumbs(slug: string, locale: KbLocale): KbBreadcrumb[] {
  const crumbs: KbBreadcrumb[] = [{ label: "Knowledge Base", href: "/kb" }];
  const article = KB_ARTICLE_BY_SLUG.get(slug);
  if (!article) return crumbs;

  const category = getKbCategory(article.categoryId);
  if (category) {
    crumbs.push({
      label: localizedText(category.title, locale),
      href: `/kb?category=${category.id}`,
    });
  }

  crumbs.push({
    label: localizedText(article.title, locale),
    href: `/kb/${slug}`,
  });

  return crumbs;
}

export function getRelatedArticles(slug: string, locale: KbLocale, take = 4): KbSearchResult[] {
  const article = KB_ARTICLE_BY_SLUG.get(slug);
  if (!article) return [];

  const related = article.relatedSlugs
    .map((relatedSlug) => KB_ARTICLE_BY_SLUG.get(relatedSlug))
    .filter((item): item is KbArticle => Boolean(item))
    .slice(0, take)
    .map((item) => ({
      slug: item.slug,
      title: localizedText(item.title, locale),
      summary: localizedText(item.summary, locale),
      categoryId: item.categoryId,
      score: 1,
    }));

  if (related.length >= take) return related;

  const sameCategory = KB_ARTICLES.filter(
    (item) => item.categoryId === article.categoryId && item.slug !== slug,
  )
    .slice(0, take - related.length)
    .map((item) => ({
      slug: item.slug,
      title: localizedText(item.title, locale),
      summary: localizedText(item.summary, locale),
      categoryId: item.categoryId,
      score: 0.5,
    }));

  return [...related, ...sameCategory].slice(0, take);
}

function scoreArticle(article: KbArticle, query: string, locale: KbLocale): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const haystack = [
    localizedText(article.title, locale),
    localizedText(article.summary, locale),
    localizedText(article.body, locale),
    ...article.tags,
    article.slug.replace(/\//g, " "),
  ]
    .join(" ")
    .toLowerCase();

  if (localizedText(article.title, locale).toLowerCase().includes(q)) return 3;
  if (article.tags.some((tag) => tag.includes(q))) return 2.5;
  if (localizedText(article.summary, locale).toLowerCase().includes(q)) return 2;
  if (haystack.includes(q)) return 1;
  return 0;
}

export function searchKbArticles(query: string, locale: KbLocale, take = 20): KbSearchResult[] {
  const q = query.trim();
  if (!q) {
    return KB_ARTICLES.slice(0, take).map((article) => ({
      slug: article.slug,
      title: localizedText(article.title, locale),
      summary: localizedText(article.summary, locale),
      categoryId: article.categoryId,
      score: 0,
    }));
  }

  return KB_ARTICLES.map((article) => ({
    slug: article.slug,
    title: localizedText(article.title, locale),
    summary: localizedText(article.summary, locale),
    categoryId: article.categoryId,
    score: scoreArticle(article, q, locale),
  }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}

export function listKbLocales() {
  return KB_SUPPORTED_LOCALES;
}

export function recordKbArticleFeedback(articleSlug: string, helpful: boolean): KbFeedbackStats {
  const store = readFeedbackStore();
  const current = store[articleSlug] ?? { helpful: 0, notHelpful: 0 };
  if (helpful) current.helpful += 1;
  else current.notHelpful += 1;
  store[articleSlug] = current;
  writeFeedbackStore(store);
  return current;
}

export function getKbArticleFeedback(articleSlug: string): KbFeedbackStats {
  const store = readFeedbackStore();
  return store[articleSlug] ?? { helpful: 0, notHelpful: 0 };
}

/** Render lightweight markdown-ish body (bold + paragraphs). */
export function renderKbBody(body: string): string {
  return body
    .split("\n\n")
    .map((paragraph) => {
      const html = paragraph
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      if (/^\d+\./.test(paragraph.trim())) {
        return `<p class="whitespace-pre-line">${html}</p>`;
      }
      return `<p>${html}</p>`;
    })
    .join("");
}

export function getAllKbSlugs(): string[] {
  return KB_ARTICLES.map((article) => article.slug);
}
