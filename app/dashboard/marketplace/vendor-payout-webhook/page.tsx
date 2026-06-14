import Link from "next/link";

import { VendorPayoutWebhookPanel } from "@/components/marketplace/vendor-payout-webhook-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
  VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadVendorPayoutWebhookSnapshot } from "@/services/marketplace/vendor-payout-webhook-p2-121-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-121 — vendor payout webhook hub. */
export default function VendorPayoutWebhookPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <VendorPayoutWebhookPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function VendorPayoutWebhookPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.vendor_payout_webhook.read",
    route: "/dashboard/marketplace/vendor-payout-webhook",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadVendorPayoutWebhookSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor payout webhook</h1>
          <p className="text-sm text-muted-foreground">
            Connect · capture · transfer · webhook — policy {VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE}>Vendor finance</Link>
        </Button>
      </div>
      <VendorPayoutWebhookPanel snapshot={snapshot} />
    </div>
  );
}
