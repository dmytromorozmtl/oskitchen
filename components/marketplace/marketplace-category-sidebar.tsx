import Link from "next/link";

import {
  marketplaceCatalogFiltersToQuery,
  type MarketplaceCatalogCategoryNode,
  type MarketplaceCatalogFilters,
} from "@/lib/marketplace/catalog-filters";
import { cn } from "@/lib/utils";

function categoryHref(filters: MarketplaceCatalogFilters, slug: string | null): string {
  const query = marketplaceCatalogFiltersToQuery({
    ...filters,
    category: slug ?? "",
    page: 1,
  });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/dashboard/marketplace/catalog?${qs}` : "/dashboard/marketplace/catalog";
}

function CategoryLinks({
  nodes,
  filters,
  activeSlug,
  depth = 0,
}: {
  nodes: MarketplaceCatalogCategoryNode[];
  filters: MarketplaceCatalogFilters;
  activeSlug: string;
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "space-y-1" : "mt-1 space-y-1 border-l border-border/60 pl-3"}>
      {nodes.map((node) => {
        const active = activeSlug === node.slug;
        return (
          <li key={node.id}>
            <Link
              href={categoryHref(filters, node.slug)}
              className={cn(
                "block rounded-lg px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {node.name}
            </Link>
            {node.children.length > 0 ? (
              <CategoryLinks
                nodes={node.children}
                filters={filters}
                activeSlug={activeSlug}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function MarketplaceCategorySidebar({
  categories,
  filters,
}: {
  categories: MarketplaceCatalogCategoryNode[];
  filters: MarketplaceCatalogFilters;
}) {
  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Categories</h2>
        {filters.category ? (
          <Link
            href={categoryHref(filters, null)}
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </div>
      <Link
        href={categoryHref(filters, null)}
        className={cn(
          "mb-2 block rounded-lg px-2 py-1.5 text-sm transition-colors",
          !filters.category
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        All categories
      </Link>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Run <span className="font-mono">npm run db:seed:marketplace-categories</span> to populate categories.
        </p>
      ) : (
        <CategoryLinks nodes={categories} filters={filters} activeSlug={filters.category} />
      )}
    </aside>
  );
}
