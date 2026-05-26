import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { affiliateDashboard, getOrCreateAffiliateCode } from "@/services/referral/affiliate-service";

export default async function ReferralsPage() {
  const { dataUserId } = await requireTenantActor();
  const code = await getOrCreateAffiliateCode(dataUserId);
  const dash = await affiliateDashboard(dataUserId);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://os-kitchen.com";

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight">B2B referrals</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Share your affiliate link; commissions tracked via referral events.
      </p>
      <div className="mt-6 rounded-xl border bg-card p-4 text-sm">
        <p className="font-medium">Your link</p>
        <code className="mt-2 block break-all text-xs">
          {base}/signup?ref={code.code}
        </code>
        <p className="mt-2 text-muted-foreground">
          Commission: {(code.commissionBps / 100).toFixed(2)}% · Conversions: {dash.conversions}
        </p>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/growth" className="text-primary underline-offset-4 hover:underline">
          ← Growth
        </Link>
      </p>
    </PageShell>
  );
}
