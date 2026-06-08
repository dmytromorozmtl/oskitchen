import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceOrdersListClient } from "@/components/marketplace/marketplace-orders-list-client";
import { MarketplaceRecurringOrdersSection } from "@/components/marketplace/marketplace-recurring-orders-section";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import {
  parseMarketplaceOrdersFilters,
  type MarketplaceOrdersFilters,
} from "@/lib/marketplace/orders-filters";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { loadMarketplaceOrders } from "@/services/marketplace/marketplace-orders-service";
import type { MarketplaceRecurringOrderRow } from "@/services/marketplace/recurring-orders-service";

function filtersAreDefault(filters: MarketplaceOrdersFilters): boolean {
  return (
    filters.tab === "orders" &&
    !filters.status &&
    !filters.vendorId &&
    !filters.dateFrom &&
    !filters.dateTo &&
    !filters.q &&
    filters.page === 1
  );
}

async function loadRecurringOrderRows(workspaceId: string): Promise<MarketplaceRecurringOrderRow[]> {
  const rows = await prisma.marketplaceRecurringOrder.findMany({
    where: { workspaceId },
    orderBy: { nextRunAt: "asc" },
    include: { vendor: { select: { companyName: true } } },
  });

  return rows.map((row) => {
    const items = Array.isArray(row.items) ? row.items : [];
    return {
      id: row.id,
      name: row.name,
      vendorId: row.vendorId,
      vendorName: row.vendor.companyName,
      frequency: row.frequency,
      nextRunAt: row.nextRunAt.toISOString(),
      lastRunAt: row.lastRunAt?.toISOString() ?? null,
      isActive: row.isActive,
      approvalRequired: row.approvalRequired,
      itemCount: items.length,
    };
  });
}

export default async function MarketplaceOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Workspace required"
        description="Open a workspace to view marketplace purchase orders."
        primaryLabel="Marketplace"
        primaryHref="/dashboard/marketplace"
      />
    );
  }

  const access = await resolveMarketplaceHubAccess();
  const sp = searchParams ? await searchParams : {};
  const filters = parseMarketplaceOrdersFilters(sp);

  try {
    if (filters.tab === "recurring") {
      const rows = await loadRecurringOrderRows(workspaceId);
      return (
        <div className="space-y-6 pb-8">
          <PageHeader
            title="Orders"
            description="Purchase orders, PO history, and recurring vendor schedules."
            actions={
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard/marketplace/orders">Orders</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard/marketplace/orders?tab=po">PO history</Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="rounded-full">
                  <Link href="/dashboard/marketplace/orders?tab=recurring">Recurring</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
                </Button>
              </div>
            }
          />
          <MarketplaceRecurringOrdersSection rows={rows} canManage={access.canCreateOrders} />
        </div>
      );
    }

    const data = await loadMarketplaceOrders(workspaceId, filters);

    if (data.total === 0 && filtersAreDefault(filters)) {
      return (
        <div className="space-y-6 pb-8">
          <PageHeader
            title="Orders"
            description="Purchase orders submitted to marketplace vendors."
            actions={
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
              </Button>
            }
          />
          <EmptyState
            icon={ClipboardList}
            title="No marketplace orders yet"
            description="Checkout from the catalog to create purchase orders with your approved vendors."
            primaryLabel="Browse catalog"
            primaryHref="/dashboard/marketplace/catalog"
            secondaryLabel="Marketplace home"
            secondaryHref="/dashboard/marketplace"
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Orders"
          description="Track purchase orders, approvals, shipments, and receiving."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant={filters.tab === "orders" ? "default" : "outline"} size="sm" className="rounded-full">
                <Link href="/dashboard/marketplace/orders">Orders</Link>
              </Button>
              <Button asChild variant={filters.tab === "po" ? "default" : "outline"} size="sm" className="rounded-full">
                <Link href="/dashboard/marketplace/orders?tab=po">PO history</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/dashboard/marketplace/orders?tab=recurring">Recurring</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
              </Button>
            </div>
          }
        />
        <MarketplaceOrdersListClient
          orders={data.items}
          filters={filters}
          vendors={data.vendors}
          total={data.total}
        />
      </div>
    );
  } catch (error) {
    console.error("[marketplace-orders] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }
}
