import { notFound } from "next/navigation";

import {
  completeInventoryCountAction,
  submitCountItemAction,
} from "@/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getInventoryCountDetail } from "@/services/inventory/count-service";

export default async function InventoryCountDetailPage({
  params,
}: {
  params: Promise<{ countId: string }>;
}) {
  const { countId } = await params;
  const { dataUserId } = await getTenantActor();
  const count = await getInventoryCountDetail(countId, dataUserId);
  if (!count) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory count</h1>
        <p className="text-sm text-muted-foreground">
          {count.status} · {count.items.length} lines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Count lines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {count.items.map((item) => (
            <form
              key={item.id}
              action={submitCountItemAction}
              className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4 sm:items-end"
            >
              <input type="hidden" name="countItemId" value={item.id} />
              <div className="sm:col-span-2">
                <p className="font-medium">{item.ingredient.name}</p>
                <p className="text-xs text-muted-foreground">
                  Expected: {Number(item.expectedQty)} {item.unit}
                </p>
              </div>
              <label className="grid gap-1 text-sm">
                Counted
                <input
                  name="countedQty"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={item.countedQty != null ? Number(item.countedQty) : undefined}
                  required
                  className="rounded-md border px-2 py-1.5"
                />
              </label>
              <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                Save line
              </button>
              {item.varianceQty != null && (
                <p className="text-xs text-muted-foreground sm:col-span-4">
                  Variance: {Number(item.varianceQty)} {item.unit}
                  {item.varianceCost != null ? ` · $${Number(item.varianceCost).toFixed(2)}` : ""}
                </p>
              )}
            </form>
          ))}
        </CardContent>
      </Card>

      {count.status === "IN_PROGRESS" && (
        <form action={completeInventoryCountAction}>
          <input type="hidden" name="countId" value={count.id} />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Complete count
          </button>
        </form>
      )}
    </div>
  );
}
