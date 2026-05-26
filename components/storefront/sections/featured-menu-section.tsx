import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import type { featuredMenuSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { buildStorefrontMenuCatalog } from "@/services/storefront/storefront-menu-catalog-service";
import type { z } from "zod";

type Content = z.infer<typeof featuredMenuSectionSchema>;

export async function FeaturedMenuSection({
  storefrontId,
  storeSlug,
  currency,
  activeMenuId,
  content,
}: {
  storefrontId: string;
  storeSlug: string;
  currency: string;
  activeMenuId: string | null;
  content: Content;
}) {
  const menuId = content.menuId?.trim() || activeMenuId;
  if (!menuId) {
    return (
      <p className="text-sm text-muted-foreground">
        Add an active menu in storefront settings to show menu highlights.
      </p>
    );
  }

  const catalog = await buildStorefrontMenuCatalog({
    storefrontId,
    storeSlug,
    menuId,
    currency,
    marketId: null,
    marketProductIds: null,
  });

  const products = (catalog?.products ?? []).slice(0, 6);
  const menuHref = `/s/${storeSlug}/menu`;
  const ctaHref = content.ctaHref?.trim() ? resolveMenuHref(content.ctaHref, storeSlug) : menuHref;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {content.heading?.trim() || "Menu highlights"}
          </h2>
          {content.subheading ? (
            <p className="mt-2 text-muted-foreground">{content.subheading}</p>
          ) : null}
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={ctaHref}>{content.ctaLabel?.trim() || "Full menu"}</Link>
        </Button>
      </div>
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} currency={currency} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground dark:bg-gray-900/40">
          No products on this menu yet.
        </p>
      )}
    </div>
  );
}

function resolveMenuHref(href: string, storeSlug: string): string {
  const h = href.trim();
  const base = `/s/${storeSlug}`;
  if (!h || h === "/") return `${base}/menu`;
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("/")) return h;
  return `${base}/${h}`;
}
