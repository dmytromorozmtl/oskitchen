import Link from "next/link";
import { AlertCircle, Package, ShoppingBag, Store, Truck } from "lucide-react";

import { MarketplaceEmptyState } from "@/components/marketplace/marketplace-empty-state";
import { MetricCard } from "@/components/data-display/metric-card";
import { MarketplaceCategoryBrowseGrid } from "@/components/marketplace/marketplace-category-browse-grid";
import { MarketplaceHeroBanner } from "@/components/marketplace/marketplace-hero-banner";
import {
  MarketplaceFeaturedVendorCard,
  MarketplaceOrderAgainCard,
  MarketplacePendingActionsList,
  MarketplaceProductGridCard,
} from "@/components/marketplace/marketplace-dashboard-sections";
import { MarketplaceSearchBar } from "@/components/marketplace/marketplace-search-bar";
import { SupplierMarketplaceLanes } from "@/components/marketplace/supplier-marketplace-lanes";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { loadMarketplaceDashboard } from "@/services/marketplace/marketplace-dashboard-service";
import { loadSupplierMarketplaceDashboard } from "@/services/marketplace/supplier-marketplace-service";

type MarketplaceDashboardAsyncSectionProps = {
  workspaceId: string;
  dataUserId: string;
  access: MarketplaceHubAccess;
};

export async function MarketplaceDashboardAsyncSection({
  workspaceId,
  dataUserId,
  access,
}: MarketplaceDashboardAsyncSectionProps) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });

  let model;
  let supplierMarketplace;
  try {
    [model, supplierMarketplace] = await Promise.all([
      loadMarketplaceDashboard(workspaceId, profile?.kitchenSettings?.businessType ?? null),
      loadSupplierMarketplaceDashboard(workspaceId),
    ]);
  } catch (error) {
    console.error("[marketplace-dashboard] load failed", error);
    return (
      <MarketplaceEmptyState scenario="dashboard_unavailable" variant="card" />
    );
  }

  return (
    <>
      <MarketplaceSearchBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Spend this month"
          value={formatCurrency(model.spendThisMonth, model.currency)}
          hint="Marketplace purchase orders"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Active orders"
          value={String(model.activeOrderCount)}
          hint="Submitted through delivery"
          icon={Truck}
        />
        <MetricCard
          label="Vendors ordered"
          value={String(model.vendorCount)}
          hint="Unique suppliers on file"
          icon={Store}
        />
        <MetricCard
          label="Needs attention"
          value={String(model.attentionCount)}
          hint="Approval, disputes, or follow-up"
          icon={AlertCircle}
          accent={model.attentionCount > 0}
        />
      </div>

      <SupplierMarketplaceLanes dashboard={supplierMarketplace} canReorder={access.canCartWrite} />

      <MarketplaceHeroBanner promotions={model.promotions} />

      <PageSection
        title="Browse by category"
        description="Eight HoReCa procurement categories — packaging, equipment, dry goods, and more"
      >
        <MarketplaceCategoryBrowseGrid />
      </PageSection>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Order again</CardTitle>
                <CardDescription>Last purchases with one-click reorder</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {model.orderAgain.length} recent
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {model.orderAgain.length === 0 ? (
              <MarketplaceEmptyState scenario="order_again" variant="inline" />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {model.orderAgain.map((item) => (
                  <MarketplaceOrderAgainCard
                    key={`${item.orderId}-${item.productId}`}
                    item={item}
                    canAddToCart={access.canCartWrite}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Pending actions</CardTitle>
            <CardDescription>Approvals, deliveries, disputes, recurring runs</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketplacePendingActionsList actions={model.pendingActions} />
          </CardContent>
        </Card>
      </section>

      <PageSection
        title="Recommended for you"
        description="Based on your restaurant profile and procurement patterns"
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/marketplace/catalog">View all</Link>
          </Button>
        }
      >
        {model.recommendations.length === 0 ? (
          <MarketplaceEmptyState scenario="recommendations" variant="inline" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {model.recommendations.map((product) => (
              <MarketplaceProductGridCard
                key={product.id}
                product={product}
                canAddToCart={access.canCartWrite}
              />
            ))}
          </div>
        )}
      </PageSection>

      <PageSection
        title="Featured vendors of the week"
        description="Verified suppliers with active catalogs"
      >
        {model.featuredVendors.length === 0 ? (
          <MarketplaceEmptyState scenario="featured_vendors" variant="inline" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {model.featuredVendors.map((vendor) => (
              <MarketplaceFeaturedVendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </PageSection>

      <section className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Popular in your region"
          description="Trending SKUs across nearby restaurants"
        >
          {model.popularInRegion.length === 0 ? (
            <MarketplaceEmptyState scenario="popular_region" variant="inline" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {model.popularInRegion.map((product) => (
                <MarketplaceProductGridCard
                  key={`popular-${product.id}`}
                  product={product}
                  canAddToCart={access.canCartWrite}
                />
              ))}
            </div>
          )}
        </PageSection>

        <PageSection
          title="New vendors & products"
          description="Recently listed marketplace SKUs"
        >
          {model.newArrivals.length === 0 ? (
            <MarketplaceEmptyState scenario="new_arrivals" variant="inline" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {model.newArrivals.map((product) => (
                <MarketplaceProductGridCard
                  key={`new-${product.id}`}
                  product={product}
                  canAddToCart={access.canCartWrite}
                />
              ))}
            </div>
          )}
        </PageSection>
      </section>
    </>
  );
}
