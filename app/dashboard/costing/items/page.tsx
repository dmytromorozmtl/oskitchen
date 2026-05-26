import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function CostingItemsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const latestRun = await prisma.costingRun.findFirst({
    where: { userId: dataUserId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  const lines = latestRun
    ? await prisma.profitabilityLine.findMany({
        where: { runId: latestRun.id },
        orderBy: { grossMarginPercent: "asc" },
        take: 1200,
      })
    : [];

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Item margins">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Item margins</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Per-SKU operational estimates from the latest costing run. Open items in your catalog to edit price or
            recipe.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/80">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Ingredients</th>
                <th className="px-3 py-2 text-right">Labor</th>
                <th className="px-3 py-2 text-right">Pack</th>
                <th className="px-3 py-2 text-right">Fees</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Margin %</th>
                <th className="px-3 py-2 text-right">Suggested</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="px-3 py-2 font-medium">
                    <Link href="/dashboard/products" className="underline-offset-4 hover:underline">
                      {row.itemTitle}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(row.salePrice))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(row.ingredientCost))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(row.laborCost))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(row.packagingCost))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(Number(row.platformFee) + Number(row.paymentFee))}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(row.totalCost))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{Number(row.grossMarginPercent).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.suggestedPrice != null ? formatCurrency(Number(row.suggestedPrice)) : "—"}
                  </td>
                </tr>
              ))}
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                    No lines yet — run costing from the{" "}
                    <Link className="underline underline-offset-4" href="/dashboard/costing">
                      overview
                    </Link>
                    .
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </PlanGate>
  );
}
