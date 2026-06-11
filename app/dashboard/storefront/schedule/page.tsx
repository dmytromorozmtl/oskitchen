import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { listStorefrontMenuSchedules } from "@/services/storefront/storefront-p3-list-service";

export const dynamic = "force-dynamic";

export default async function StorefrontMenuSchedulePage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const schedules = await listStorefrontMenuSchedules(pageAccess.access.storefront.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Menu schedule</h1>
        <p className="mt-2 text-sm text-muted-foreground">Seasonal menus and automatic rotations by date range.</p>
      </div>

      {schedules.length === 0 ? (
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
