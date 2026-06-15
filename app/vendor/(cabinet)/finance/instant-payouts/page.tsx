import { VendorInstantPayoutsClient } from "@/components/marketplace/vendor-instant-payouts-client";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadInstantPayoutDashboard } from "@/services/marketplace/instant-payouts-service";

export const metadata = {
  title: "Instant payouts",
  description: "Stripe Instant Payouts to vendor debit card (~30 minutes).",
};

export default async function VendorInstantPayoutsPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.finance.instant_payouts",
    route: "/vendor/finance/instant-payouts",
  });
  if (!access.ok) return access.deny;

  const model = await loadInstantPayoutDashboard(access.vendorId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Instant payouts"
        description="Get available marketplace balance to your debit card in about 30 minutes. Growth and Enterprise plans."
      />

      <VendorInstantPayoutsClient
        model={model}
        canRequestPayout={access.canRequestPayouts}
      />
    </div>
  );
}
