import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function CostingComponentsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const latestRun = await prisma.costingRun.findFirst({
    where: { userId: dataUserId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  const components = latestRun
    ? await prisma.costComponent.findMany({
        where: { profitabilityLine: { runId: latestRun.id } },
        orderBy: [{ productId: "asc" }, { type: "asc" }],
        take: 2000,
      })
    : [];

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Cost components">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cost components</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Breakdown rows captured on the last costing run (ingredients rolled per line; labor, packaging, fees split).
            Overrides per component will ship in a follow-up editor — today use recipes, packaging rules, and settings.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/80">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-3 py-2">{c.type}</td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(c.cost))}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.source ?? "—"}</td>
                </tr>
              ))}
              {components.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No component rows yet —{" "}
                    <Link className="underline underline-offset-4" href="/dashboard/costing">
                      run costing
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
