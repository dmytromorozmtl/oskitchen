import Link from "next/link";
import { notFound } from "next/navigation";

import {
  completeInventoryCountAction,
  submitCountItemAction,
} from "@/actions/inventory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getInventoryCountDetail,
  summarizeInventoryCountVariance,
} from "@/services/inventory/count-service";

export default async function InventoryCountDetailPage({
  params,
}: {
  params: Promise<{ countId: string }>;
}) {
  const { countId } = await params;
  const { dataUserId } = await getTenantActor();
  const count = await getInventoryCountDetail(countId, dataUserId);
  if (!count) notFound();

  const variance = summarizeInventoryCountVariance(count.items);
  const isComplete = count.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory count</h1>
          <p className="text-sm text-muted-foreground">
            {count.status}
            {count.completedAt ? ` · completed ${count.completedAt.toLocaleString()}` : ""}
            {" · "}
            {count.items.length} lines
          </p>
        </div>
        <Link href="/dashboard/inventory/counts" className="text-sm text-primary hover:underline">
          ← All counts
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lines counted</CardDescription>
            <CardTitle className="text-2xl">
              {variance.linesCounted}
              <span className="text-base font-normal text-muted-foreground"> / {variance.lineCount}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net variance ($)</CardDescription>
            <CardTitle
              className={`text-2xl ${variance.totalVarianceCost < 0 ? "text-amber-700 dark:text-amber-400" : ""}`}
            >
              {variance.totalVarianceCost >= 0 ? "" : "−"}$
              {Math.abs(variance.totalVarianceCost).toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shrink ($)</CardDescription>
            <CardTitle className="text-2xl text-amber-700 dark:text-amber-400">
              {variance.shrinkCost === 0 ? "$0.00" : `−$${Math.abs(variance.shrinkCost).toFixed(2)}`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overage ($)</CardDescription>
            <CardTitle className="text-2xl">${variance.overageCost.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {variance.linesUncounted > 0 && !isComplete && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          {variance.linesUncounted} line(s) not counted yet — only entered quantities update stock on
          completion.
        </p>
      )}

      {isComplete && (
        <p className="text-sm text-muted-foreground">
          Stock on hand was set to counted quantities for {variance.linesCounted} ingredient line(s).
          {variance.linesWithVariance > 0
            ? ` ${variance.linesWithVariance} line(s) had non-zero variance.`
            : " All lines matched expected on-hand."}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Count lines</CardTitle>
          <CardDescription>
            Net unit variance across counted lines: {variance.totalVarianceQty.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {count.items.map((item) => {
            const hasVariance =
              item.varianceQty != null && Number(item.varianceQty) !== 0;
            const lineBody = (
              <>
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.ingredient.name}</p>
                    {hasVariance && (
                      <Badge variant="secondary" className="text-xs">
                        Variance
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected: {Number(item.expectedQty)} {item.unit}
                  </p>
                </div>
                {isComplete ? (
                  <div className="text-sm sm:col-span-2">
                    <p>
                      Counted:{" "}
                      {item.countedQty != null ? Number(item.countedQty) : "—"} {item.unit}
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="grid gap-1 text-sm">
                      Counted
                      <input
                        name="countedQty"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={
                          item.countedQty != null ? Number(item.countedQty) : undefined
                        }
                        required
                        className="rounded-md border px-2 py-1.5"
                      />
                    </label>
                    <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                      Save line
                    </button>
                  </>
                )}
                {item.varianceQty != null && (
                  <p className="text-xs text-muted-foreground sm:col-span-4">
                    Variance: {Number(item.varianceQty) > 0 ? "+" : ""}
                    {Number(item.varianceQty)} {item.unit}
                    {item.varianceCost != null
                      ? ` · ${Number(item.varianceCost) >= 0 ? "+" : "−"}$${Math.abs(Number(item.varianceCost)).toFixed(2)}`
                      : ""}
                  </p>
                )}
              </>
            );

            if (isComplete) {
              return (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4 sm:items-end"
                >
                  {lineBody}
                </div>
              );
            }

            return (
              <form
                key={item.id}
                action={submitCountItemAction}
                className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4 sm:items-end"
              >
                <input type="hidden" name="countItemId" value={item.id} />
                {lineBody}
              </form>
            );
          })}
        </CardContent>
      </Card>

      {!isComplete && (
        <form action={completeInventoryCountAction}>
          <input type="hidden" name="countId" value={count.id} />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Complete count
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Applies counted quantities to ingredient on-hand stock for all saved lines.
          </p>
        </form>
      )}
    </div>
  );
}
