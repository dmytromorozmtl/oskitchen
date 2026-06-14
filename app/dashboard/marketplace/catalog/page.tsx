import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { MarketplaceEmptyState } from "@/components/marketplace/marketplace-empty-state";
import { MarketplaceCatalogOfflineSync } from "@/components/marketplace/marketplace-catalog-offline-sync";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { MarketplaceCatalogFilterBar } from "@/components/marketplace/marketplace-catalog-filter-bar";
import { MarketplaceCatalogToolbar } from "@/components/marketplace/marketplace-catalog-toolbar";
import { MarketplaceCatalogProductCard } from "@/components/marketplace/marketplace-catalog-product-card";
import { MarketplaceCategorySidebar } from "@/components/marketplace/marketplace-category-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  marketplaceCatalogFiltersToQuery,
  parseMarketplaceCatalogFilters,
} from "@/lib/marketplace/catalog-filters";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { loadMarketplaceCatalog } from "@/services/marketplace/marketplace-catalog-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

type MarketplaceCatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function MarketplaceCatalogPage(props: MarketplaceCatalogPageProps) {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceCatalogPageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceCatalogPageAsync({
  searchParams,
}: MarketplaceCatalogPageProps) {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.catalog.read",
    route: "/dashboard/marketplace/catalog",
  });
  if (!access.ok) return access.deny;

  const sp = await searchParams;
  const filters = parseMarketplaceCatalogFilters(sp);

  let catalog;
  try {
    catalog = await loadMarketplaceCatalog(filters);
  } catch (error) {
    console.error("[marketplace-catalog] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  const offlineProducts = catalog.items.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    vendorName: product.vendorName,
    basePrice: product.basePrice,
    currency: product.currency,
    cachedAt: new Date().toISOString(),
  }));

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.category) ||
    Boolean(filters.vendorId) ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.minRating != null ||
    filters.maxLeadDays != null ||
    filters.maxMoq != null ||
    filters.inStockOnly ||
    filters.page > 1;

  return (
    <div className="space-y-6 pb-8">
      <MarketplaceCatalogOfflineSync products={offlineProducts} />
      <PageHeader
        title="Catalog"
        description="Browse verified HoReCa products with filters for price, vendor rating, delivery time, MOQ, and stock."
        actions={
          <Badge variant="outline" className="rounded-full">
            {catalog.total} products
          </Badge>
        }
      />

      <MarketplaceCatalogFilterBar filters={filters} vendors={catalog.vendors} />

      <MarketplaceCatalogToolbar
        filters={filters}
        vendors={catalog.vendors}
        categories={catalog.categories}
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <MarketplaceCategorySidebar categories={catalog.categories} filters={filters} />

        <div className="space-y-4">
          {catalog.items.length === 0 ? (
            <MarketplaceEmptyState
              scenario={hasActiveFilters ? "catalog_filtered" : "catalog_empty"}
              variant="card"
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((product) => (
                  <MarketplaceCatalogProductCard
                    key={product.id}
                    product={product}
                    canAddToCart={access.canCartWrite}
                  />
                ))}
              </div>

              <PaginationBar
                basePath="/dashboard/marketplace/catalog"
                page={catalog.page}
                totalPages={catalog.totalPages}
                query={marketplaceCatalogFiltersToQuery(filters)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
