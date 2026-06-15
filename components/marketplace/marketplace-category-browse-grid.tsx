import Link from "next/link";

import { MarketplaceCategoryIconTile } from "@/components/marketplace/marketplace-category-icon";
import { MARKETPLACE_CATEGORY_ICON_META } from "@/lib/marketplace/category-icons";
import { cn } from "@/lib/utils";

export function MarketplaceCategoryBrowseGrid({ className }: { className?: string }) {
  return (
    <div
      data-testid="marketplace-category-browse-grid"
      className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {MARKETPLACE_CATEGORY_ICON_META.map((category) => (
        <Link
          key={category.slug}
          href={`/dashboard/marketplace/catalog?category=${category.slug}`}
          className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40"
        >
          <MarketplaceCategoryIconTile slug={category.slug} />
          <span className="min-w-0 text-sm font-medium leading-snug group-hover:text-primary">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
