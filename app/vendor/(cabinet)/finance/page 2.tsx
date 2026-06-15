import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { VendorFinanceClient } from "@/components/marketplace/vendor-finance-client";
import { PageHeader } from "@/components/layout/page-header";
import {
  parseVendorFinanceFilters,
  vendorFinanceFiltersToQuery,
} from "@/lib/marketplace/vendor-finance-filters";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorFinance } from "@/services/marketplace/vendor-finance-service";

export const metadata = { title: "Vendor finance" };

export default async function VendorFinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseVendorFinanceFilters(sp);

  const access = await requireVendorCabinetPage({
    operation: "vendor.finance.read",
    route: "/vendor/finance",
  });
  if (!access.ok) return access.deny;

  const model = await loadVendorFinance(access.vendorId, filters);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Finance"
        description="Available and pending balances, commission breakdown, payouts, and tax summaries."
      />

      <VendorFinanceClient
        model={model}
        filters={filters}
        canRequestPayout={access.canRequestPayouts}
      />

      <PaginationBar
        basePath="/vendor/finance"
        page={model.page}
        totalPages={model.totalPages}
        query={vendorFinanceFiltersToQuery(filters)}
      />
    </div>
  );
}
