import Link from "next/link";

import { PartnerBillingPanel } from "@/components/platform/partner-billing-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { isMarketplacePartnerStripeConnectEnabled } from "@/lib/platform/partner-stripe-connect";
import {
  listPartnerBillingStatements,
  loadPartnerBillingOverview,
} from "@/services/platform/partner-billing-service";

export const metadata = { title: "Partner billing — Platform" };

export default async function PlatformPartnerBillingPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:read");

  const canWrite = hasPlatformPermission(ctx.permissions, "platform:billing:write");
  const [overview, statements] = await Promise.all([
    loadPartnerBillingOverview(),
    listPartnerBillingStatements(),
  ]);

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          App marketplace · Phase 6
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Partner billing</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Accrual meters for OAuth app installs, monthly platform fees, publisher statements, and{" "}
          {isMarketplacePartnerStripeConnectEnabled()
            ? "Stripe Connect Express payouts to publishers."
            : "manual mark-paid (enable MARKETPLACE_PARTNER_STRIPE_CONNECT=1 for live payouts)."}
          {" "}Wired to{" "}
          <Link href="/platform/partner-apps" className="text-amber-200/90 hover:underline">
            partner app review
          </Link>{" "}
          and workspace{" "}
          <Link href="/dashboard/integrations/oauth-apps" className="text-amber-200/90 hover:underline">
            OAuth installs
          </Link>
          . Not tax documents — operational summaries for finance review.
        </p>
      </div>

      {!isMarketplacePartnerStripeConnectEnabled() ? (
        <p className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
          Stripe Connect payouts disabled — set{" "}
          <code className="text-amber-200">MARKETPLACE_PARTNER_STRIPE_CONNECT=1</code> and{" "}
          <code className="text-amber-200">STRIPE_CONNECT_CLIENT_ID</code> to enable publisher
          onboarding and transfer payouts.
        </p>
      ) : null}

      {!canWrite ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — sync meters, finalize statements, and mark paid require platform billing write
          permission.
        </p>
      ) : null}

      <PartnerBillingPanel
        disclosure={overview.disclosure}
        periodMonth={overview.periodMonth}
        rows={overview.rows}
        totals={overview.totals}
        statements={statements}
        canWrite={canWrite}
        connectEnabled={isMarketplacePartnerStripeConnectEnabled()}
      />
    </div>
  );
}
