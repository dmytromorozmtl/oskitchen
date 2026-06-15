import { ProductGridSectionClient } from "@/components/storefront/sections/product-grid-section-client";
import { featuredMenuSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import { getStorefrontProducts } from "@/services/storefront/storefront-product-service";

export async function ProductGridSection({
  contentJson,
  storeSlug,
  storefront,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  storeSlug: string;
  storefront: StorefrontPublicPayload;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(featuredMenuSectionSchema, contentJson, locale, defaultLocale);
  const menuId = c?.menuId?.trim() || storefront.activeMenuId;
  const products = await getStorefrontProducts(storefront.id, { take: 6, menuId });

  return (
    <ProductGridSectionClient
      contentJson={contentJson}
      storeSlug={storeSlug}
      storefront={storefront}
      locale={locale}
      defaultLocale={defaultLocale}
      products={products}
    />
  );
}
