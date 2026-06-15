"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { KbSearchResult, KbTreeSection } from "@/services/kb/knowledge-base-service";
import type { KbLocale } from "@/lib/kb/knowledge-base-content";
import { cn } from "@/lib/utils";

function langHref(path: string, locale: KbLocale): string {
  return locale === "en" ? path : `${path}?lang=${locale}`;
}

export function KbSearchBox({
  locale,
  initialQuery = "",
}: {
  locale: KbLocale;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);

  return (
    <form
      data-testid="kb-search-form"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (locale !== "en") params.set("lang", locale);
        const qs = params.toString();
        router.push(qs ? `/kb?${qs}` : "/kb");
      }}
    >
      <label className="sr-only" htmlFor="kb-search">
        Search knowledge base
      </label>
      <input
        id="kb-search"
        data-testid="kb-search-input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search POS, integrations, billing…"
        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
      />
    </form>
  );
}

export function KbLanguageSwitcher({ locale }: { locale: KbLocale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname.startsWith("/kb") ? pathname : "/kb";
  const q = searchParams.get("q");
  const category = searchParams.get("category");

  function hrefFor(code: KbLocale) {
    const params = new URLSearchParams();
    if (code !== "en") params.set("lang", code);
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div data-testid="kb-language-switcher" className="flex flex-wrap gap-2 text-xs">
      {(["en", "fr", "es"] as const).map((code) => (
        <Link
          key={code}
          href={hrefFor(code)}
          className={cn(
            "rounded-full border px-2.5 py-1 uppercase",
            locale === code ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          {code}
        </Link>
      ))}
    </div>
  );
}

export function KbSidebar({
  tree,
  locale,
  activeSlug,
}: {
  tree: KbTreeSection[];
  locale: KbLocale;
  activeSlug?: string | null;
}) {
  return (
    <nav data-testid="kb-sidebar" aria-label="Knowledge base sections" className="space-y-6">
      {tree.map((section) => (
        <div key={section.category.id}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.category.title[locale] ?? section.category.title.en}
          </p>
          <ul className="mt-2 space-y-1">
            {section.articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={langHref(`/kb/${article.slug}`, locale)}
                  className={cn(
                    "block rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
                    activeSlug === article.slug
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function KbBreadcrumbs({
  crumbs,
}: {
  crumbs: Array<{ label: string; href: string }>;
}) {
  return (
    <ol
      data-testid="kb-breadcrumbs"
      className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      {crumbs.map((crumb, index) => (
        <li key={crumb.href} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {index === crumbs.length - 1 ? (
            <span className="text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}

export function KbSearchResults({
  results,
  locale,
  query,
}: {
  results: KbSearchResult[];
  locale: KbLocale;
  query: string;
}) {
  if (!query.trim()) return null;

  return (
    <section data-testid="kb-search-results" className="space-y-3">
      <h2 className="text-sm font-semibold">
        {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
      </h2>
      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles matched. Try another keyword.</p>
      ) : (
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={result.slug}>
              <Link
                href={langHref(`/kb/${result.slug}`, locale)}
                className="block rounded-xl border border-border/80 bg-card px-4 py-3 hover:bg-muted/30"
              >
                <p className="font-medium">{result.title}</p>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function KbRelatedArticles({
  articles,
  locale,
}: {
  articles: KbSearchResult[];
  locale: KbLocale;
}) {
  if (!articles.length) return null;

  return (
    <section data-testid="kb-related-articles" className="space-y-3">
      <h2 className="text-sm font-semibold">Related articles</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={langHref(`/kb/${article.slug}`, locale)}
              className="block rounded-xl border border-border/80 px-4 py-3 text-sm hover:bg-muted/30"
            >
              <p className="font-medium">{article.title}</p>
              <p className="mt-1 text-muted-foreground">{article.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
