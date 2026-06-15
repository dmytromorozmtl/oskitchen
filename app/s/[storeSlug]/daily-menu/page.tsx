import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreMenuClient } from "@/components/storefront/store-menu-client";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { buildStorefrontCommerceMetadata } from "@/lib/storefront/page-metadata";
import { getSessionUser } from "@/lib/auth";

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

export default async function DailyMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const table = typeof sp.table === "string" ? sp.table : undefined;

  const data = await loadStorefrontMenuCatalogForPage(storeSlug);
  if (!data) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold capitalize">{storeSlug.replace(/-/g, " ")}</h1>
        <p className="text-muted-foreground">Daily menu</p>
        {table ? (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            🪑 Table {table}
          </p>
        ) : null}
      </div>

      <StoreMenuClient
        slug={storeSlug}
        currency={data.currency}
        products={data.catalog.products}
        priceVersion={data.catalog.priceVersion}
      />

      <p className="text-center text-xs text-muted-foreground">
        <Link href={`/s/${storeSlug}/cart`} className="underline underline-offset-2">
          View cart
        </Link>
      </p>
    </div>
  );
}
