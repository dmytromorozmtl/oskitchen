import { MarketplaceDisputesAdminClient } from "@/components/platform/marketplace-disputes-admin-client";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { parsePlatformDisputeAdminFilters } from "@/lib/platform/marketplace-dispute-admin-filters";
import {
  countOpenPlatformDisputes,
  loadPlatformDisputes,
} from "@/services/marketplace/platform-dispute-resolution-service";

export const metadata = { title: "Marketplace disputes — Platform" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlatformMarketplaceDisputesPage({ searchParams }: PageProps) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const filters = parsePlatformDisputeAdminFilters(await searchParams);
  const [result, openCount] = await Promise.all([
    loadPlatformDisputes(filters),
    countOpenPlatformDisputes(),
  ]);
  const canResolve = hasPlatformPermission(ctx.permissions, "platform:organizations:write");

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          B2B Marketplace · Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Dispute resolution</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Review buyer disputes with order context, chat history, and photo evidence. Issue refund, pay
          vendor, or split decisions with resolution history. Vendors with repeated losses are auto-flagged
          for moderation.
        </p>
      </div>

      {!canResolve ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — resolve and escalate require platform organizations write permission.
        </p>
      ) : null}

      <MarketplaceDisputesAdminClient
        filters={filters}
        result={result}
        openCount={openCount}
        canResolve={canResolve}
      />
    </div>
  );
}
