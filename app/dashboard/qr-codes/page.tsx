import Link from "next/link";

import { QrCodesDashboard } from "@/components/qr/qr-codes-dashboard";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTablesForWorkspace } from "@/services/restaurant/table-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QrCodesPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "products.edit")) {
    return <PermissionDeniedSurfaceCard surfaceId="qr-codes" />;
  }

  const { dataUserId } = actor;
  const [tables, storefront] = await Promise.all([
    getTablesForWorkspace(dataUserId),
    prisma.storefrontSettings.findFirst({
      where: { userId: dataUserId, enabled: true, published: true },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: { storeSlug: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/menus" className="hover:text-foreground">
            Menus
          </Link>
          <span className="mx-2">/</span>
          QR codes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Table QR codes</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Generate QR codes guests scan to order from their phone. Orders land on the kitchen display
          with a blue table badge — no app download.
        </p>
      </div>

      <QrCodesDashboard
        initialStoreSlug={storefront?.storeSlug ?? null}
        initialTables={tables.map((t) => ({
          id: t.id,
          name: t.name,
          section: t.section,
        }))}
      />
    </div>
  );
}
