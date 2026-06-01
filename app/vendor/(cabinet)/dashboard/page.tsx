import { PageHeader } from "@/components/layout/page-header";
import { VendorDashboardClient } from "@/components/marketplace/vendor-dashboard-client";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorDashboard } from "@/services/marketplace/vendor-dashboard-service";

export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.dashboard.read",
    route: "/vendor/dashboard",
  });

  if (!access.ok) {
    return access.deny;
  }

  const model = await loadVendorDashboard(access.vendorId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={model.vendorName}
        description="Marketplace vendor cabinet · orders, revenue, stock, and buyer messages at a glance."
      />
      <VendorDashboardClient model={model} />
    </div>
  );
}
