"use client";

import Link from "next/link";
import { Heart, Scale, X } from "lucide-react";

import { useMarketplaceCatalogTray } from "@/hooks/use-marketplace-catalog-tray";
import type {
  MarketplaceCatalogCategoryNode,
  MarketplaceCatalogFilters,
  MarketplaceCatalogVendorOption,
} from "@/lib/marketplace/catalog-filters";
import {
  buildMarketplaceCatalogFilterChips,
  buildMarketplaceCompareHref,
  MARKETPLACE_CATALOG_PATH,
  MARKETPLACE_CATALOG_TOOLBAR_TEST_ID,
  MARKETPLACE_COMPARE_LIMIT,
  MARKETPLACE_COMPARE_PATH,
  MARKETPLACE_WISHLIST_PATH,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";
import { readMarketplaceCompareSlugs } from "@/lib/marketplace/marketplace-compare-storage";
import { MARKETPLACE_TOUCH_BUTTON_CLASS } from "@/lib/marketplace/mobile-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function flattenCategoryNames(
  nodes: readonly MarketplaceCatalogCategoryNode[],
): Map<string, string> {
  const map = new Map<string, string>();
  function walk(list: readonly MarketplaceCatalogCategoryNode[]) {
    for (const node of list) {
      map.set(node.slug, node.name);
      walk(node.children);
    }
  }
  walk(nodes);
  return map;
}

export type MarketplaceCatalogToolbarProps = {
  filters: MarketplaceCatalogFilters;
  vendors: readonly MarketplaceCatalogVendorOption[];
  categories?: readonly MarketplaceCatalogCategoryNode[];
  className?: string;
};

/**
 * DES-16 — catalog toolbar: active filter chips + compare / wishlist tray links.
 */
export function MarketplaceCatalogToolbar({
  filters,
  vendors,
  categories = [],
  className,
}: MarketplaceCatalogToolbarProps) {
  const { compareCount, wishlistCount } = useMarketplaceCatalogTray();
  const categoryNames = flattenCategoryNames(categories);
  const chips = buildMarketplaceCatalogFilterChips(filters, { vendors, categoryNames });
  const compareHref =
    compareCount > 0
      ? buildMarketplaceCompareHref(readMarketplaceCompareSlugs())
      : MARKETPLACE_COMPARE_PATH;

  return (
    <div
      data-testid={MARKETPLACE_CATALOG_TOOLBAR_TEST_ID}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-3 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tray
        </span>
        <Button
          asChild
          variant={compareCount > 0 ? "default" : "outline"}
          size="sm"
          className={cn("rounded-full gap-1.5", MARKETPLACE_TOUCH_BUTTON_CLASS)}
        >
          <Link href={compareHref} data-testid="marketplace-catalog-compare-link">
            <Scale className="h-4 w-4" aria-hidden />
            Compare
            {compareCount > 0 ? (
              <Badge variant="secondary" className="ml-0.5 rounded-full px-1.5 tabular-nums">
                {compareCount}/{MARKETPLACE_COMPARE_LIMIT}
              </Badge>
            ) : null}
          </Link>
        </Button>
        <Button
          asChild
          variant={wishlistCount > 0 ? "secondary" : "outline"}
          size="sm"
          className={cn("rounded-full gap-1.5", MARKETPLACE_TOUCH_BUTTON_CLASS)}
        >
          <Link href={MARKETPLACE_WISHLIST_PATH} data-testid="marketplace-catalog-wishlist-link">
            <Heart className="h-4 w-4" aria-hidden />
            Wish list
            {wishlistCount > 0 ? (
              <Badge variant="outline" className="ml-0.5 rounded-full px-1.5 tabular-nums">
                {wishlistCount}
              </Badge>
            ) : null}
          </Link>
        </Button>
        {chips.length > 0 ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn("ml-auto rounded-full text-xs", MARKETPLACE_TOUCH_BUTTON_CLASS)}
          >
            <Link href={MARKETPLACE_CATALOG_PATH}>Clear all filters</Link>
          </Button>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          data-testid="marketplace-catalog-filter-chips"
          aria-label="Active catalog filters"
        >
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={chip.href}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
              data-testid={`marketplace-catalog-filter-chip-${chip.key}`}
            >
              {chip.label}
              <X className="h-3 w-3 opacity-60" aria-hidden />
              <span className="sr-only">Remove filter</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
