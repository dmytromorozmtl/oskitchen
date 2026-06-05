import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  KbBreadcrumbs,
  KbLanguageSwitcher,
  KbRelatedArticles,
  KbSearchBox,
  KbSearchResults,
  KbSidebar,
} from "@/components/kb/kb-shell";
import { KbFeedbackButtons } from "@/components/kb/kb-feedback-buttons";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import {
  getKbArticle,
  getKbArticleFeedback,
  getKbBreadcrumbs,
  getKbTree,
  getRelatedArticles,
  localizedText,
  renderKbBody,
  resolveKbLocale,
  searchKbArticles,
} from "@/services/kb/knowledge-base-service";

export function kbArticleMetadata(slug: string, localeRaw?: string | null) {
  const locale = resolveKbLocale(localeRaw);
  const article = getKbArticle(slug, locale);
  if (!article) return marketingPageMetadata({ title: "Not found", description: "", path: `/kb/${slug}` });
  return marketingPageMetadata({
    title: `${localizedText(article.title, locale)} — OS Kitchen Knowledge Base`,
    description: localizedText(article.summary, locale),
    path: `/kb/${slug}`,
    keywords: article.tags,
  });
}

export function KbArticleView({
  slug,
  locale: localeRaw,
}: {
  slug: string;
  locale?: string | null;
}) {
  const locale = resolveKbLocale(localeRaw);
  const article = getKbArticle(slug, locale);
  if (!article) notFound();

  const breadcrumbs = getKbBreadcrumbs(slug, locale);
  const related = getRelatedArticles(slug, locale);
  const feedback = getKbArticleFeedback(slug);
  const tree = getKbTree(locale);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="hidden lg:block">
          <KbSidebar tree={tree} locale={locale} activeSlug={slug} />
        </aside>
        <main className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <KbBreadcrumbs crumbs={breadcrumbs} />
            <Suspense fallback={null}>
              <KbLanguageSwitcher locale={locale} />
            </Suspense>
          </div>

          <article data-testid="kb-article" className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {localizedText(article.title, locale)}
              </h1>
              <p className="text-muted-foreground">{localizedText(article.summary, locale)}</p>
            </header>

            <div
              className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: renderKbBody(localizedText(article.body, locale)),
              }}
            />

            <Suspense fallback={null}>
              <KbFeedbackButtons articleSlug={slug} initialStats={feedback} />
            </Suspense>

            <KbRelatedArticles articles={related} locale={locale} />
          </article>

          <p className="text-sm text-muted-foreground">
            Still stuck?{" "}
            <Link href="/book-demo" className="text-primary underline-offset-4 hover:underline">
              Book a demo
            </Link>{" "}
            or browse the legacy{" "}
            <Link href="/help" className="text-primary underline-offset-4 hover:underline">
              help center
            </Link>
            .
          </p>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

export function KbHomeView({
  locale: localeRaw,
  query,
  categoryId,
}: {
  locale?: string | null;
  query?: string | null;
  categoryId?: string | null;
}) {
  const locale = resolveKbLocale(localeRaw);
  const tree = getKbTree(locale);
  const filteredTree = categoryId
    ? tree.filter((section) => section.category.id === categoryId)
    : tree;
  const searchResults = query?.trim() ? searchKbArticles(query, locale) : [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="hidden lg:block">
          <KbSidebar tree={tree} locale={locale} />
        </aside>
        <main className="min-w-0 space-y-8" data-testid="kb-home">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Knowledge Base</h1>
              <p className="max-w-2xl text-muted-foreground">
                Self-serve guides for POS, kitchen operations, integrations, inventory, and billing.
              </p>
            </div>
            <Suspense fallback={null}>
              <KbLanguageSwitcher locale={locale} />
            </Suspense>
          </div>

          <KbSearchBox locale={locale} initialQuery={query ?? ""} />

          {query?.trim() ? (
            <KbSearchResults results={searchResults} locale={locale} query={query} />
          ) : (
            <div className="space-y-8">
              {filteredTree.map((section) => (
                <section key={section.category.id} data-testid={`kb-category-${section.category.id}`}>
                  <h2 className="text-lg font-semibold">
                    {section.category.title[locale] ?? section.category.title.en}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.category.description[locale] ?? section.category.description.en}
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {section.articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={
                            locale === "en"
                              ? `/kb/${article.slug}`
                              : `/kb/${article.slug}?lang=${locale}`
                          }
                          className="block rounded-xl border border-border/80 bg-card px-4 py-3 hover:bg-muted/30"
                        >
                          <p className="font-medium">{article.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
