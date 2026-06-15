import { MarketplaceProductsAdminClient } from "@/components/platform/marketplace-products-admin-client";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { parsePlatformProductAdminFilters } from "@/lib/platform/marketplace-product-admin-filters";
import {
  countFlaggedPlatformProducts,
  countPlatformProductQueue,
  loadPlatformProductCategories,
  loadPlatformProducts,
} from "@/services/marketplace/platform-product-moderation-service";

export const metadata = { title: "Marketplace products — Platform" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlatformMarketplaceProductsPage({ searchParams }: PageProps) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const filters = parsePlatformProductAdminFilters(await searchParams);
  const [result, categories, queueCount, flaggedCount] = await Promise.all([
    loadPlatformProducts(filters),
    loadPlatformProductCategories(),
    countPlatformProductQueue(),
    countFlaggedPlatformProducts(),
  ]);
  const canModerate = hasPlatformPermission(ctx.permissions, "platform:organizations:write");

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          B2B Marketplace · Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Product moderation</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Review new vendor SKUs in the pending queue, approve listings for the buyer catalog, request
          changes, reject non-compliant products, and manage flagged listings with bulk actions.
        </p>
      </div>

      {!canModerate ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — approve, reject, and flag require platform organizations write permission.
        </p>
      ) : null}

      <MarketplaceProductsAdminClient
        filters={filters}
        result={result}
        categories={categories}
        queueCount={queueCount}
        flaggedCount={flaggedCount}
        canModerate={canModerate}
      />
    </div>
  );
}
