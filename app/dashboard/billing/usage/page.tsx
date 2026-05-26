import { UsageBars } from "@/components/dashboard/billing/usage-bars";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { planDef } from "@/lib/billing/plan-registry";
import { loadSubscription } from "@/services/billing/subscription-service";
import { usageBarsForUser } from "@/services/billing/usage-service";

export default async function UsagePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sub = await loadSubscription(dataUserId);
  const bars = await usageBarsForUser(dataUserId, sub.plan);
  const plan = planDef(sub.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="text-sm text-muted-foreground">
          You are on the {plan.name} plan. Counters refresh each calendar month.
        </p>
      </div>

      <UsageBars bars={bars} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How counters are computed</CardTitle>
          <CardDescription>Server-side; values are also cached in <code>usage_counters</code>.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>Orders this month: orders whose <code>createdAt</code> is in the current UTC month.</p>
          <p>Active menus: menus with <code>catalogOnly = false</code>.</p>
          <p>Integrations: <code>integration_connections</code> in CONNECTED.</p>
          <p>Staff: staff members with status ACTIVE or TRAINING.</p>
          <p>Brands / Locations / Storefronts: workspace counts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
