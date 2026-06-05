import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { VendorInvoicesClient } from "@/components/marketplace/vendor-invoices-client";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorInvoices } from "@/services/marketplace/vendor-portal-service";

export const metadata = { title: "Vendor invoices" };

export default async function VendorInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const access = await requireVendorCabinetPage({
    operation: "vendor.finance.read",
    route: "/vendor/invoices",
  });
  if (!access.ok) return access.deny;

  const model = await loadVendorInvoices(access.vendorId, page);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Invoices"
        description="Marketplace commission invoices tied to purchase orders — outstanding balances, payout readiness, and settlement history."
      />
      <VendorInvoicesClient model={model} />
      <PaginationBar
        basePath="/vendor/invoices"
        page={model.page}
        totalPages={model.totalPages}
        query={page > 1 ? { page: String(page) } : {}}
      />
    </div>
  );
}
