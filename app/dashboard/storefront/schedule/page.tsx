import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { listStorefrontMenuSchedules } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontMenuSchedulePage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true });
  const schedules = sf ? await listStorefrontMenuSchedules(sf.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Menu schedule</h1>
        <p className="mt-2 text-sm text-muted-foreground">Seasonal menus and automatic rotations by date range.</p>
      </div>

      {!sf ? (
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      ) : schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scheduled menus yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-border/80 text-sm">
          {schedules.map((s) => (
            <li key={s.id} className="px-4 py-3">
              <p className="font-medium">{s.label}</p>
              <p className="text-muted-foreground">
                {s.startsAt.toLocaleDateString()} → {s.endsAt.toLocaleDateString()} · menu {s.menuId.slice(0, 8)}…
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
