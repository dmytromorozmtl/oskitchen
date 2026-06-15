import { notFound } from "next/navigation";
import { Suspense } from "react";

import { StoreMenuClient } from "@/components/storefront/store-menu-client";
import { StorefrontMarketSync } from "@/components/storefront/storefront-market-sync";
import { StorefrontMarketSwitcher } from "@/components/storefront/storefront-market-switcher";
import { getSessionUser } from "@/lib/auth";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { buildStorefrontCommerceMetadata } from "@/lib/storefront/page-metadata";

/** ISR: menu catalog refreshes every 60s; admin publish still revalidateTag on publish. */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  return buildStorefrontCommerceMetadata(storeSlug, "menu", user?.id ?? null);
}

export default async function StorefrontMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const marketQ = typeof sp.market === "string" ? sp.market : undefined;

  const data = await loadStorefrontMenuCatalogForPage(storeSlug, marketQ);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <StorefrontMarketSync />
      </Suspense>
      <StorefrontMarketSwitcher
        storeSlug={storeSlug}
        markets={data.markets}
        activeMarketId={data.marketId}
      />
      {data.marketBanner ? (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm">
          {data.marketBanner}
        </p>
      ) : null}
      <StoreMenuClient
        slug={storeSlug}
        currency={data.currency}
        products={data.catalog.products}
        priceVersion={data.catalog.priceVersion}
      />
    </div>
  );
}
