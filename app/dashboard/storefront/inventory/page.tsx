import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { listStorefrontInventoryItems } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontInventoryPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const items = await listStorefrontInventoryItems(pageAccess.access.storefront.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Storefront inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">Per-product quantity and low-stock thresholds.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inventory rows yet — products default to available.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80 font-mono text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between px-4 py-3">
              <span>{i.productId.slice(0, 8)}…</span>
              <span>
                qty {i.quantity}
                {i.lowStockAt != null ? ` · low ≤ ${i.lowStockAt}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
