import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceOrdersListClient } from "@/components/marketplace/marketplace-orders-list-client";
import { MarketplaceRecurringOrdersSection } from "@/components/marketplace/marketplace-recurring-orders-section";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  marketplaceOrdersFiltersToQuery,
  parseMarketplaceOrdersFilters,
} from "@/lib/marketplace/orders-filters";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceOrders } from "@/services/marketplace/marketplace-orders-service";
import { loadMarketplaceRecurringOrders } from "@/services/marketplace/recurring-orders-service";

const TABS = [
  { key: "orders", label: "Orders", href: "/dashboard/marketplace/orders" },
  { key: "po", label: "Purchase orders", href: "/dashboard/marketplace/orders?tab=po" },
  {
    key: "recurring",
    label: "Recurring",
    href: "/dashboard/marketplace/orders?tab=recurring",
  },
] as const;

export default async function MarketplaceOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseMarketplaceOrdersFilters(sp);
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

  if (filters.tab === "recurring") {
    const recurring = await loadMarketplaceRecurringOrders(workspaceId);
    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Orders"
          description="Track purchase orders, PO numbers, receiving, and recurring replenishment."
        />
        <TabBar activeTab={filters.tab} />
        <MarketplaceRecurringOrdersSection
          rows={recurring}
          canManage={access.canCreateOrders}
        />
      </div>
    );
  }

  const model = await loadMarketplaceOrders(workspaceId, filters);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={filters.tab === "po" ? "Purchase orders" : "Orders"}
        description="Filter by status, vendor, and date. Open an order for timeline, receiving, chat, and invoice."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/marketplace/catalog">Reorder supplies</Link>
          </Button>
        }
      />

      <TabBar activeTab={filters.tab} />

      {model.items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No marketplace orders yet"
          description="Checkout from the catalog to create purchase orders split by vendor."
          primaryLabel="Browse catalog"
          primaryHref="/dashboard/marketplace/catalog"
          secondaryLabel="Cart"
          secondaryHref="/dashboard/marketplace/checkout"
        />
      ) : (
        <>
          <MarketplaceOrdersListClient
            orders={model.items}
            filters={filters}
            vendors={model.vendors}
            total={model.total}
          />
          <PaginationBar
            basePath="/dashboard/marketplace/orders"
            page={model.page}
            totalPages={model.totalPages}
            query={marketplaceOrdersFiltersToQuery(filters)}
          />
        </>
      )}
    </div>
  );
}

function TabBar({ activeTab }: { activeTab: "orders" | "po" | "recurring" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
