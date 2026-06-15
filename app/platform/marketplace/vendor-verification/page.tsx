import Link from "next/link";

import { MarketplaceVendorVerificationQueue } from "@/components/platform/marketplace-vendor-verification-queue";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { loadVendorVerificationQueue } from "@/services/marketplace/vendor-registration-service";

export const metadata = { title: "Marketplace vendor verification — Platform" };

export default async function PlatformMarketplaceVendorVerificationPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const canReview = hasPlatformPermission(ctx.permissions, "platform:organizations:write");
  const queue = await loadVendorVerificationQueue();

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          B2B Marketplace · Vendor onboarding
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Vendor verification queue</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Review applications from{" "}
          <Link href="/vendor/register" className="text-amber-200/90 hover:underline">
            /vendor/register
          </Link>
          . Approve vendors to list catalog SKUs; rejected applications can resubmit after document fixes.
        </p>
      </div>

      {!canReview ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — approve/reject requires platform organizations write permission.
        </p>
      ) : null}

      <MarketplaceVendorVerificationQueue queue={queue} canReview={canReview} />
    </div>
  );
}
