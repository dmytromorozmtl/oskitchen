"use client";

import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";
import { usePublicTheme } from "@/components/storefront/public-theme-provider";
import { Button } from "@/components/ui/button";
import { featuredMenuSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import type { StorefrontPublicProduct } from "@/services/storefront/storefront-product-service";

export function ProductGridSectionClient({
  contentJson,
  storeSlug,
  storefront,
  locale,
  defaultLocale,
  products,
}: {
  contentJson: unknown;
  storeSlug: string;
  storefront: StorefrontPublicPayload;
  locale: string;
  defaultLocale: string;
  products: StorefrontPublicProduct[];
}) {
  const theme = usePublicTheme();
  const c = parseSectionContentForLocale(featuredMenuSectionSchema, contentJson, locale, defaultLocale);
  if (products.length === 0) return null;

  const title = c?.heading?.trim() || "This week's picks";
  const description = c?.subheading?.trim() || "Highlights from the rotating menu.";
  const menuHref = `/s/${storeSlug}/menu`;

  const catalogProducts: StorefrontCatalogProduct[] = products.map((p) => ({
    id: p.id,
    publicSlug: p.publicSlug,
    title: p.title,
    description: p.description,
    price: p.price,
    preparedDate: "",
    image: p.imageUrl,
    maxStorefrontQuantity: null,
    soldOut: false,
    availableQty: null,
    canAddToCart: true,
    variants: [],
    modifierGroups: [],
  }));

  return (
    <section className="space-y-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full dark:border-gray-700">
          <Link href={menuHref}>{c?.ctaLabel?.trim() || "Full menu"}</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalogProducts.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            storeSlug={storeSlug}
            currency={storefront.currency}
            theme={theme ?? undefined}
            extras={{ isNew: idx === 0 }}
          />
        ))}
      </div>
    </section>
  );
}
