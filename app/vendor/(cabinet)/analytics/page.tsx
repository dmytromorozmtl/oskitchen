import { VendorAnalyticsClient } from "@/components/marketplace/vendor-analytics-client";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorAnalytics } from "@/services/marketplace/vendor-analytics-service";

export const metadata = { title: "Vendor analytics" };

export default async function VendorAnalyticsPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.analytics.read",
    route: "/vendor/analytics",
  });
  if (!access.ok) return access.deny;

  const model = await loadVendorAnalytics(access.vendorId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Analytics"
        description="Sales performance, conversion funnel, buyer segments, marketplace insights, and inventory forecasting."
      />
      <VendorAnalyticsClient model={model} />
    </div>
  );
}
