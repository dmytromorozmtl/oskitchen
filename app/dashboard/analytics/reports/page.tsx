import { exportAnalyticsCsvAction } from "@/actions/analytics";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters, serialiseFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const REPORTS: { id: string; title: string; description: string; kind: "revenue" | "orders" }[] = [
  { id: "executive_summary", title: "Executive summary", description: "Top KPIs, revenue trend, channel mix.", kind: "revenue" },
  { id: "daily_ops_report", title: "Daily operations report", description: "Orders, fulfillment, late orders.", kind: "orders" },
  { id: "weekly_business_report", title: "Weekly business report", description: "Revenue + channel + customer rollup.", kind: "revenue" },
  { id: "catering_performance", title: "Catering performance", description: "Pipeline + accepted revenue + conversion.", kind: "revenue" },
  { id: "meal_plan_performance", title: "Meal plan performance", description: "Recurring revenue and cycle counts.", kind: "revenue" },
  { id: "customer_retention", title: "Customer retention", description: "Repeat rate and top spenders.", kind: "revenue" },
  { id: "production_efficiency", title: "Production efficiency", description: "Completion rate and delayed batches.", kind: "orders" },
  { id: "inventory_usage", title: "Inventory usage", description: "Ingredient demand and shortages.", kind: "orders" },
  { id: "route_performance", title: "Route performance", description: "Delivery on-time + failed stops.", kind: "orders" },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const { brands, locations } = await loadFilterableBrandsAndLocations(dataUserId);
  const filtersQuery = serialiseFilters(filters).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Print-friendly CSV exports backed by your real data. PDF export is planned.
        </p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/reports" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.id} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{r.title}</CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData) => {
                "use server";
                await exportAnalyticsCsvAction(formData);
              }} className="flex gap-2">
                <input type="hidden" name="kind" value={r.kind} />
                <input type="hidden" name="filtersQuery" value={filtersQuery} />
                <Button type="submit" size="sm" variant="outline">Download CSV</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
