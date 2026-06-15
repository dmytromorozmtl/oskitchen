import { Suspense } from "react";
import { notFound } from "next/navigation";

import { StoreCartClient } from "@/components/storefront/store-cart-client";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { buildStorefrontCommerceMetadata } from "@/lib/storefront/page-metadata";
import { getStorefrontForPublicFromRequest, isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { getSessionUser } from "@/lib/auth";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  return buildStorefrontCommerceMetadata(storeSlug, "cart", user?.id ?? null);
}

export default async function StorefrontCartPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const marketQ = typeof sp.market === "string" ? sp.market : undefined;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  const data = await loadStorefrontMenuCatalogForPage(storeSlug, marketQ);
  if (!sf?.activeMenu || !data) notFound();

  const orderingPaused = isStorefrontInClosureWindow(sf);

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading cart…</p>}>
      <StoreCartClient
        slug={storeSlug}
        currency={data.currency}
        products={data.catalog.products}
        priceVersion={data.catalog.priceVersion}
        orderingPaused={orderingPaused}
      />
    </Suspense>
  );
}
