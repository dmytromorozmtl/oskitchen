import Link from "next/link";

import { startInventoryCountAction } from "@/actions/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCountNetVarianceCost } from "@/lib/inventory/format-count-variance";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listInventoryCountRows } from "@/services/inventory/count-service";

export default async function InventoryCountsPage() {
  const { dataUserId } = await getTenantActor();
  const counts = await listInventoryCountRows(dataUserId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Physical inventory counts</h1>
          <p className="text-sm text-muted-foreground">
            Cycle counts with variance vs on-hand stock. Completed counts apply counted quantities to
            on-hand.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard/inventory/pos-impacts" className="text-primary hover:underline">
            POS impacts →
          </Link>
          <Link href="/dashboard/inventory/waste" className="text-primary hover:underline">
            Waste log →
          </Link>
        </div>
      </div>

      <form action={startInventoryCountAction}>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Start new count
        </button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Count history</CardTitle>
          <CardDescription>
            Net variance is the sum of line-level dollar variance for counted lines.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4 text-right">Net variance</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {counts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No counts yet. Start a count to snapshot on-hand and record variances.
                  </td>
                </tr>
              ) : (
                counts.map((c) => {
                  const netVariance = formatCountNetVarianceCost(c.varianceSummary);
                  const varianceTone =
                    c.varianceSummary.totalVarianceCost < 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "";
                  return (
                    <tr key={c.id} className="border-b border-border/60">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {c.createdAt.toLocaleString()}
                        {c.status === "COMPLETED" && c.completedAt ? (
                          <p className="text-xs text-muted-foreground">
                            Done {c.completedAt.toLocaleString()}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4">{c.status}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {c.varianceSummary.linesCounted}/{c.itemCount} counted
                      </td>
                      <td className={`py-2 pr-4 text-right tabular-nums font-medium ${varianceTone}`}>
                        {netVariance}
                        {c.varianceSummary.linesWithVariance > 0 ? (
                          <p className="text-xs font-normal text-muted-foreground">
                            {c.varianceSummary.linesWithVariance} line
                            {c.varianceSummary.linesWithVariance === 1 ? "" : "s"} off
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2">
                        <Link
                          href={`/dashboard/inventory/counts/${c.id}`}
                          className="text-primary hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
