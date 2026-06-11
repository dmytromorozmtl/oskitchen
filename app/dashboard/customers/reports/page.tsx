import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { CUSTOMER_SOURCE_LABEL } from "@/lib/crm/customer-types";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { loadCrmOverviewKpis } from "@/services/crm/customer-metrics-service";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function CustomerReportsPage() {
  const { userId } = await getTenantActor();
  const kpis = await loadCrmOverviewKpis(userId);

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const [bySource, byType] = await Promise.all([
    prisma.kitchenCustomer.groupBy({
      by: ["source"],
      where: { userId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.kitchenCustomer.groupBy({
      by: ["type"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const repeatRate = kpis.totalCustomers > 0 ? Math.round((kpis.repeatCustomers / kpis.totalCustomers) * 100) : 0;
  const atRiskRate = kpis.totalCustomers > 0 ? Math.round((kpis.atRisk / kpis.totalCustomers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">CRM reports</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Customer growth, repeat behavior, channel mix, LTV, and at-risk share.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Customers" value={kpis.totalCustomers} />
        <Kpi label="New (30d)" value={kpis.newCustomers30d} />
        <Kpi label="Repeat rate" value={`${repeatRate}%`} />
        <Kpi label="At-risk share" value={`${atRiskRate}%`} />
        <Kpi label="VIPs" value={kpis.vips} />
        <Kpi label="Avg order value" value={formatCurrency(centsToDollars(kpis.averageOrderValueCents))} />
        <Kpi label="Lifetime revenue" value={formatCurrency(centsToDollars(kpis.lifetimeValueCentsTotal))} />
        <Kpi label="Repeat revenue (30d)" value={formatCurrency(centsToDollars(kpis.repeatRevenue30dCents))} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By source (last 90 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {bySource.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customers added in the last 90 days.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {bySource
                .sort((a, b) => b._count._all - a._count._all)
                .map((g) => (
                  <li key={g.source} className="flex justify-between border-b border-border/40 py-1">
                    <span>{CUSTOMER_SOURCE_LABEL[g.source]}</span>
                    <strong>{g._count._all}</strong>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By type</CardTitle>
        </CardHeader>
        <CardContent>
          {byType.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customer records yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byType
                .sort((a, b) => b._count._all - a._count._all)
                .map((g) => (
                  <li key={g.type} className="flex justify-between border-b border-border/40 py-1">
                    <span>{g.type}</span>
                    <strong>{g._count._all}</strong>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
