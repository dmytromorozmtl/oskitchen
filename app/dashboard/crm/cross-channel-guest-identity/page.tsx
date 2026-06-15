import Link from "next/link";

import { CrossChannelGuestIdentityPanel } from "@/components/crm/cross-channel-guest-identity-panel";
import { Button } from "@/components/ui/button";
import { requireCustomersHubPageAccess } from "@/lib/crm/crm-page-access";
import {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIFIED_ROUTE,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadCrossChannelGuestIdentitySnapshot } from "@/services/crm/cross-channel-guest-identity-p2-115-service";

/** Blueprint P2-115 — cross-channel guest identity hub. */
export default async function CrossChannelGuestIdentityPage() {
  const access = await requireCustomersHubPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await requireTenantActor();
  const snapshot = await loadCrossChannelGuestIdentitySnapshot(userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cross-channel guest identity</h1>
          <p className="text-sm text-muted-foreground">
            Unified profiles POS / storefront / delivery — policy{" "}
            {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIFIED_ROUTE}>Unified profiles</Link>
        </Button>
      </div>
      <CrossChannelGuestIdentityPanel snapshot={snapshot} />
    </div>
  );
}
