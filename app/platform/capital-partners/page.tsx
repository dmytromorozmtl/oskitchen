import Link from "next/link";

import { CapitalPartnersPlatformPanel } from "@/components/platform/capital-partners-platform-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import {
  listCapitalPartnerBillingStatements,
  loadCapitalPartnerOnboardingOverview,
} from "@/services/commercial/capital-partner-billing-service";

export const metadata = { title: "Capital partners — Platform" };

export default async function PlatformCapitalPartnersPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:billing:read");

  const canWrite = hasPlatformPermission(ctx.permissions, "platform:billing:write");
  const [overview, statements] = await Promise.all([
    loadCapitalPartnerOnboardingOverview(),
    listCapitalPartnerBillingStatements(),
  ]);

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Restaurant Capital · Phase 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Live lender onboarding</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Partner lifecycle, webhook/apply URL readiness, and referral fee accrual on{" "}
          <code className="text-zinc-300">FUNDED</code> webhooks. Merchant flow lives on{" "}
          <Link href="/dashboard/analytics/capital#lender-offers" className="text-amber-200/90 hover:underline">
            Analytics → Financing resources
          </Link>
          . Sandbox lenders are hidden from production merchants unless{" "}
          <code className="text-zinc-300">CAPITAL_SHOW_SANDBOX_LENDERS=true</code>.
        </p>
      </div>

      {!canWrite ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — sync statements and finalize require platform billing write permission.
        </p>
      ) : null}

      <CapitalPartnersPlatformPanel
        overview={overview}
        statements={statements}
        canWrite={canWrite}
      />
    </div>
  );
}
