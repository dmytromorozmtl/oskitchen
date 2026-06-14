import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryPhotoCountPanel } from "@/components/inventory/inventory-photo-count-panel";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listInventoryCounts } from "@/services/inventory/count-service";

export default async function InventoryPhotoCountPage() {
  const { dataUserId } = await getTenantActor();
  const counts = await listInventoryCounts(dataUserId, 20);
  const openCounts = counts
    .filter((c) => c.status === "IN_PROGRESS")
    .map((c) => ({
      id: c.id,
      label: `${c.createdAt.toLocaleString()} · ${c._count.items} lines`,
    }));

  const aiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shelf photo count</h1>
          <p className="text-sm text-muted-foreground">
            AI-assisted shelf inventory count — photo → detected quantities → apply to open physical
            count.
          </p>
        </div>
        <Link href="/dashboard/inventory/counts" className="text-sm text-primary hover:underline">
          ← Physical counts
        </Link>
      </div>

      <InventoryPhotoCountPanel openCounts={openCounts} aiConfigured={aiConfigured} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>MarketMan parity — in-house photo count workflow</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Start a physical inventory count from the counts page.</li>
            <li>Photograph a storage shelf with distinct items visible.</li>
            <li>Review AI-detected item labels and quantities.</li>
            <li>Apply matched lines to the open count — complete the count when done.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
