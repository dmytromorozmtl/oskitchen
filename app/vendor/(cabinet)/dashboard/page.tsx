import { PageHeader } from "@/components/layout/page-header";
import { VendorDashboardClient } from "@/components/marketplace/vendor-dashboard-client";
import { VendorPortalHub } from "@/components/marketplace/vendor-portal-hub";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorDashboard } from "@/services/marketplace/vendor-dashboard-service";
import { loadVendorPortalHub } from "@/services/marketplace/vendor-portal-service";

export const metadata = { title: "Vendor Portal 2.0" };

export default async function VendorDashboardPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.dashboard.read",
    route: "/vendor/dashboard",
  });

  if (!access.ok) {
    return access.deny;
  }

  const [hub, model] = await Promise.all([
    loadVendorPortalHub(access.vendorId),
    loadVendorDashboard(access.vendorId),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={model.vendorName}
        description="Vendor Portal 2.0 · orders inbox, commission invoices, and sales analytics for marketplace suppliers."
      />
      <VendorPortalHub hub={hub} />
      <VendorDashboardClient model={model} />
    </div>
  );
}
