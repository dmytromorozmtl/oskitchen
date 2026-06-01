import { VendorSettingsClient } from "@/components/marketplace/vendor-settings-client";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorSettings } from "@/services/marketplace/vendor-settings-service";

export const metadata = { title: "Vendor settings" };

export default async function VendorSettingsPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.settings.read",
    route: "/vendor/settings",
  });
  if (!access.ok) return access.deny;

  const model = await loadVendorSettings(access.vendorId);
  if (!model) {
    return null;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Settings"
        description={`${model.companyName} · profile, team, notifications, API keys, subscription, and compliance.`}
      />
      <VendorSettingsClient model={model} canManage={access.canManageSettings} />
    </div>
  );
}
