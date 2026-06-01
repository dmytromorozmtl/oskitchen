import Link from "next/link";

import { VendorProductsListClient } from "@/components/marketplace/vendor-products-list-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { parseVendorProductFilters } from "@/lib/marketplace/vendor-product-filters";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import {
  loadVendorProducts,
} from "@/services/marketplace/vendor-products-service";

export const metadata = { title: "Vendor products" };

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseVendorProductFilters(sp);

  const access = await requireVendorCabinetPage({
    operation: "vendor.products.list",
    route: "/vendor/products",
  });
  if (!access.ok) return access.deny;

  const { items, total } = await loadVendorProducts({
    vendorId: access.vendorId,
    q: filters.q,
    status: filters.status,
    page: filters.page,
    pageSize: filters.pageSize,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Products"
        description="Manage marketplace SKUs, variants, volume pricing, and catalog review workflow."
        actions={
          access.canManageProducts ? (
            <Button asChild className="rounded-full">
              <Link href="/vendor/products/new">New product</Link>
            </Button>
          ) : null
        }
      />

      <VendorProductsListClient
        products={items}
        filters={filters}
        total={total}
        canManage={access.canManageProducts}
        highlightId={filters.highlight}
      />
    </div>
  );
}
