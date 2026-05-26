import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function CostingMenusPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const latestRun = await prisma.costingRun.findFirst({
    where: { userId: dataUserId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  const lines = latestRun
    ? await prisma.profitabilityLine.findMany({
        where: { runId: latestRun.id },
        include: { menu: { select: { id: true, title: true } } },
      })
    : [];

  type Row = (typeof lines)[0];
  const byMenu = new Map<string, { title: string; lines: Row[] }>();
  for (const l of lines) {
    const key = l.menuId ?? "unknown";
    const title = l.menu?.title ?? "Unknown menu";
    const cur = byMenu.get(key) ?? { title, lines: [] };
    cur.lines.push(l);
    byMenu.set(key, cur);
  }

  const rollups = [...byMenu.entries()].map(([id, g]) => {
    const avgMargin =
      g.lines.reduce((s, x) => s + Number(x.grossMarginPercent), 0) / Math.max(g.lines.length, 1);
    const sumProfit = g.lines.reduce((s, x) => s + Number(x.grossProfit), 0);
    return { id, title: g.title, count: g.lines.length, avgMargin, sumProfit };
  });
  rollups.sort((a, b) => b.avgMargin - a.avgMargin);

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Menu profitability">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu profitability</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Rolled up from the latest costing run (per-item estimates, not sales mix).
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/80">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Menu</th>
                <th className="px-3 py-2 text-right">Items</th>
                <th className="px-3 py-2 text-right">Avg margin %</th>
                <th className="px-3 py-2 text-right">Σ gross profit / unit</th>
              </tr>
            </thead>
            <tbody>
              {rollups.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-3 py-2 font-medium">
                    {r.id !== "unknown" ? (
                      <Link className="underline-offset-4 hover:underline" href={`/dashboard/menus/${r.id}`}>
                        {r.title}
                      </Link>
                    ) : (
                      r.title
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.avgMargin.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(r.sumProfit)}</td>
                </tr>
              ))}
              {rollups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No costing data yet.
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
