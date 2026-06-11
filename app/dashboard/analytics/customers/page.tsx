import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { maskEmail } from "@/lib/crm/customer-privacy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadCustomerAnalytics } from "@/services/analytics/analytics-service";

export default async function CustomerAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadCustomerAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customer analytics</h1>
        <p className="text-muted-foreground">Repeat rate, new customers, VIP revenue, top spenders.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/customers" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Unique customers" value={data.uniqueCustomers} />
        <Kpi label="New customers" value={data.newCustomers} />
        <Kpi label="Repeat customers" value={data.repeatCustomers} hint={ratePercentLabel(data.repeatRate)} />
        <Kpi label="VIP LTV" value={formatCurrency(data.vipRevenue)} hint="Aggregate VIP lifetime value" />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top spenders</CardTitle>
          <CardDescription>By revenue in the window. Emails masked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topSpenders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No spenders in window.</p>
          ) : null}
          {data.topSpenders.map((c) => (
            <div key={c.email} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-sm">
              <span>{maskEmail(c.email)}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="rounded-full">{c.orders} orders</Badge>
                <span className="tabular-nums">{formatCurrency(c.revenue)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
