import Link from "next/link";

import { Loyalty3Panel } from "@/components/loyalty/loyalty-3-panel";
import { PolicyLockedHonestyBanner } from "@/components/dashboard/policy-locked-honesty-banner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireLoyaltyPageAccess } from "@/lib/crm/rewards-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadLoyalty3DashboardSnapshot } from "@/services/loyalty/loyalty-3.0-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Loyalty 3.0",
  description: "Cross-brand points pool, VIP multipliers, event bonuses, and referral leaderboard.",
};

export default async function Loyalty3Page() {
  const access = await requireLoyaltyPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await getTenantActor();
  const snapshot = await loadLoyalty3DashboardSnapshot(userId);

  return (
    <div className="space-y-6 pb-8">
      <PolicyLockedHonestyBanner variant="rewards_dual_ledger" />
      <PageHeader
        title="Loyalty 3.0"
        description="Cross-brand rewards, VIP earn multipliers, catering event bonuses, and referral tracking — built on Loyalty 2.0 tiers."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/loyalty/program-builder">Program builder</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/customers/loyalty">Classic settings</Link>
            </Button>
          </div>
        }
      />
      <Loyalty3Panel snapshot={snapshot} canManage={access.canManage} />
    </div>
  );
}
