import { PackageSearch } from "lucide-react";

import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceCatalogOfflineSync } from "@/components/marketplace/marketplace-catalog-offline-sync";
import { MarketplaceCatalogFilterBar } from "@/components/marketplace/marketplace-catalog-filter-bar";
import { MarketplaceCatalogProductCard } from "@/components/marketplace/marketplace-catalog-product-card";
import { MarketplaceCategorySidebar } from "@/components/marketplace/marketplace-category-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  marketplaceCatalogFiltersToQuery,
  parseMarketplaceCatalogFilters,
} from "@/lib/marketplace/catalog-filters";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { loadMarketplaceCatalog } from "@/services/marketplace/marketplace-catalog-service";

export default async function MarketplaceCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseMarketplaceCatalogFilters(sp);
  const [access, catalog] = await Promise.all([
    resolveMarketplaceHubAccess(),
    loadMarketplaceCatalog(filters),
  ]);

  const offlineProducts = catalog.items.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    vendorName: product.vendorName,
    basePrice: product.basePrice,
    currency: product.currency,
    cachedAt: new Date().toISOString(),
  }));

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

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <MarketplaceCategorySidebar categories={catalog.categories} filters={filters} />

        <div className="space-y-4">
          {catalog.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match your filters"
              description="Try clearing category or price filters, or seed marketplace categories and vendor catalogs."
              primaryLabel="Reset filters"
              primaryHref="/dashboard/marketplace/catalog"
              secondaryLabel="Marketplace home"
              secondaryHref="/dashboard/marketplace"
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
