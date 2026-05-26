import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { listStorefrontReferrals } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontReferralsPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const referrals = sf ? await listStorefrontReferrals(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Referral program</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track invite codes and reward grants.</p>
      </div>

      {!sf ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : referrals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No referrals yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80 font-mono text-sm">
          {referrals.map((r) => (
            <li key={r.id} className="flex justify-between px-4 py-3">
              <span>{r.code}</span>
              <span className="text-muted-foreground">
                {r.referrerEmail}
                {r.rewardGranted ? " · rewarded" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
