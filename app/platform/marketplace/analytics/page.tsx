import { MarketplaceAnalyticsAdminClient } from "@/components/platform/marketplace-analytics-admin-client";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { loadPlatformMarketplaceAnalytics } from "@/services/marketplace/platform-marketplace-analytics-service";

export const metadata = { title: "Marketplace analytics — Platform" };

export default async function PlatformMarketplaceAnalyticsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const model = await loadPlatformMarketplaceAnalytics();

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          B2B Marketplace · Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Marketplace analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          GMV trends, revenue by category and vendor tier, vendor active/new/churned counts, buyer
          active/new/repeat metrics, commission revenue, and CSV export for platform reporting.
        </p>
      </div>

      <MarketplaceAnalyticsAdminClient model={model} />
    </div>
  );
}
