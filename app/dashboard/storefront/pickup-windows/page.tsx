import { PickupWindowsPanel } from "@/components/storefront/pickup-windows-panel";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { listPickupWindowsForStore } from "@/services/storefront/pickup-slots";

export const dynamic = "force-dynamic";

export default async function PickupWindowsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const storefront = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: { storeSlug: true },
  });
  const storeSlug = storefront?.storeSlug ?? "";
  const windows = storeSlug ? await listPickupWindowsForStore(pageAccess.userId, storeSlug) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pickup windows</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure pre-order pickup slots shown at storefront checkout.
        </p>
      </div>

      {!storeSlug ? (
        <p className="text-sm text-muted-foreground">Enable a storefront first to manage pickup windows.</p>
      ) : (
        <PickupWindowsPanel
          storeSlug={storeSlug}
          initialWindows={windows.map((w) => ({
            id: w.id,
            dayOfWeek: w.dayOfWeek,
            startTime: w.startTime,
            endTime: w.endTime,
            maxOrders: w.maxOrders,
            currentOrders: w.currentOrders,
            active: w.active,
          }))}
        />
      )}
    </div>
  );
}
