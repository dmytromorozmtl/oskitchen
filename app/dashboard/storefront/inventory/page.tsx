import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { listStorefrontInventoryItems } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontInventoryPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const items = sf ? await listStorefrontInventoryItems(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Storefront inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">Per-product quantity and low-stock thresholds.</p>
      </div>

      {!sf ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : items.length === 0 ? (
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
