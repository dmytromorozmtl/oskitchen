import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadInventoryAnalytics } from "@/services/analytics/analytics-service";

export default async function InventoryAnalyticsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const data = await loadInventoryAnalytics({ userId: dataUserId });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory & margin</h1>
        <p className="text-muted-foreground">
          Real numbers only. We don&apos;t fabricate food cost percentages — connect Ingredients,
          Recipes and Costing to derive margins.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Ingredients tracked" value={data.ingredientsTracked} />
        <Kpi label="Recipes tracked" value={data.recipesTracked} />
        <Kpi label="Demand lines" value={data.ingredientUsageRows} />
        <Kpi label="Shortages detected" value={data.shortagesPlaceholder} hint="Hook to Purchasing for live alerts." />
      </div>

      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Where to deepen this</CardTitle>
          <CardDescription className="text-xs">
            Use the dedicated modules to drive food-cost percentages and margin:{" "}
            <Link className="underline" href="/dashboard/ingredients">Ingredients</Link>,{" "}
            <Link className="underline" href="/dashboard/purchasing">Purchasing</Link>,{" "}
            <Link className="underline" href="/dashboard/costing">Costing</Link>.
          </CardDescription>
        </CardHeader>
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
