import Link from "next/link";
import { AlertCircle, Package, ShoppingBag, Store, Truck } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceHeroBanner } from "@/components/marketplace/marketplace-hero-banner";
import {
  MarketplaceFeaturedVendorCard,
  MarketplaceOrderAgainCard,
  MarketplacePendingActionsList,
  MarketplaceProductGridCard,
} from "@/components/marketplace/marketplace-dashboard-sections";
import { MarketplaceSearchBar } from "@/components/marketplace/marketplace-search-bar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { loadMarketplaceDashboard } from "@/services/marketplace/marketplace-dashboard-service";

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof ShoppingBag;
  accent?: boolean;
}) {
  return (
    <Card className={`border-border/80 shadow-sm ${accent ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function MarketplaceDashboardPage() {
  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        icon={Store}
        title="Workspace required"
        description="Open a workspace to browse the B2B HoReCa marketplace."
        primaryLabel="Today"
        primaryHref="/dashboard/today"
      />
    );
  }

  const [access, profile] = await Promise.all([
    resolveMarketplaceHubAccess(),
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      include: { kitchenSettings: { select: { businessType: true } } },
    }),
  ]);

  const model = await loadMarketplaceDashboard(
    workspaceId,
    profile?.kitchenSettings?.businessType ?? null,
  );

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Marketplace"
        description="Procure supplies, equipment, and services from verified HoReCa vendors — integrated with your workspace orders and inventory."
        actions={
          access.canCartWrite ? (
            <Button asChild className="rounded-full">
              <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
            </Button>
          ) : null
        }
      />

      <MarketplaceSearchBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Spend this month"
          value={formatCurrency(model.spendThisMonth, model.currency)}
          hint="Marketplace purchase orders"
          icon={ShoppingBag}
        />
        <SummaryCard
          label="Active orders"
          value={String(model.activeOrderCount)}
          hint="Submitted through delivery"
          icon={Truck}
        />
        <SummaryCard
          label="Vendors ordered"
          value={String(model.vendorCount)}
          hint="Unique suppliers on file"
          icon={Store}
        />
        <SummaryCard
          label="Needs attention"
          value={String(model.attentionCount)}
          hint="Approval, disputes, or follow-up"
          icon={AlertCircle}
          accent={model.attentionCount > 0}
        />
      </div>

      <MarketplaceHeroBanner promotions={model.promotions} />

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
              <p className="text-sm text-muted-foreground">
                Place your first marketplace order to see quick reorder shortcuts here.
              </p>
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">
              Based on your restaurant profile and procurement patterns
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/marketplace/catalog">View all</Link>
          </Button>
        </div>
        {model.recommendations.length === 0 ? (
          <Card className="border-dashed border-border/80 shadow-none">
            <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
              <Package className="h-5 w-5 shrink-0" />
              Seed marketplace categories and vendor products to populate recommendations.
            </CardContent>
          </Card>
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
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Featured vendors of the week</h2>
          <p className="text-sm text-muted-foreground">Verified suppliers with active catalogs</p>
        </div>
        {model.featuredVendors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Featured vendors appear once suppliers are approved.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {model.featuredVendors.map((vendor) => (
              <MarketplaceFeaturedVendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Popular in your region</h2>
            <p className="text-sm text-muted-foreground">Trending SKUs across nearby restaurants</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {model.popularInRegion.map((product) => (
              <MarketplaceProductGridCard
                key={`popular-${product.id}`}
                product={product}
                canAddToCart={access.canCartWrite}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">New vendors & products</h2>
            <p className="text-sm text-muted-foreground">Recently listed marketplace SKUs</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {model.newArrivals.map((product) => (
              <MarketplaceProductGridCard
                key={`new-${product.id}`}
                product={product}
                canAddToCart={access.canCartWrite}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
