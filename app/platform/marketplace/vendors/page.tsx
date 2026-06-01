import { MarketplaceVendorsAdminClient } from "@/components/platform/marketplace-vendors-admin-client";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { parsePlatformVendorAdminFilters } from "@/lib/platform/marketplace-vendor-admin-filters";
import { loadPlatformVendors } from "@/services/marketplace/platform-vendor-moderation-service";

export const metadata = { title: "Marketplace vendors — Platform" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlatformMarketplaceVendorsPage({ searchParams }: PageProps) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const filters = parsePlatformVendorAdminFilters(await searchParams);
  const result = await loadPlatformVendors(filters);
  const canModerate = hasPlatformPermission(ctx.permissions, "platform:organizations:write");

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          B2B Marketplace · Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Vendor moderation</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Filter all marketplace vendors by status, type, and subscription plan. Review the verification
          queue, approve or reject applications, suspend underperforming vendors, and open vendor profiles
          for documents, order history, and disputes.
        </p>
      </div>

      {!canModerate ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — approve, reject, and suspend require platform organizations write permission.
        </p>
      ) : null}

      <MarketplaceVendorsAdminClient filters={filters} result={result} canModerate={canModerate} />
    </div>
  );
}
