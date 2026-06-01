import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { VendorOrdersListClient } from "@/components/marketplace/vendor-orders-list-client";
import { PageHeader } from "@/components/layout/page-header";
import { parseVendorOrdersFilters, vendorOrdersFiltersToQuery } from "@/lib/marketplace/vendor-orders-filters";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorOrders } from "@/services/marketplace/vendor-orders-service";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Vendor orders" };

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseVendorOrdersFilters(sp);

  const access = await requireVendorCabinetPage({
    operation: "vendor.orders.list",
    route: "/vendor/orders",
  });
  if (!access.ok) return access.deny;

  const model = await loadVendorOrders(access.vendorId, filters);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Orders"
        description="Incoming marketplace purchase orders — confirm, process, ship, and chat with buyers."
      />

      {model.items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No incoming orders"
          description="When buyers checkout from your catalog, orders appear here for confirmation and fulfillment."
          primaryLabel="Vendor dashboard"
          primaryHref="/vendor/dashboard"
          secondaryLabel="Products"
          secondaryHref="/vendor/products"
        />
      ) : (
        <>
          <VendorOrdersListClient
            orders={model.items}
            filters={filters}
            total={model.total}
            canManage={access.canManageOrders}
          />
          <PaginationBar
            basePath="/vendor/orders"
            page={model.page}
            totalPages={model.totalPages}
            query={vendorOrdersFiltersToQuery(filters)}
          />
        </>
      )}
    </div>
  );
}
