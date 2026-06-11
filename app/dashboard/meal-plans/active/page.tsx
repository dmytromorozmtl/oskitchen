import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { MEAL_PLAN_STATUS_BADGE, MEAL_PLAN_STATUS_LABEL } from "@/lib/meal-plans/meal-plan-status";
import { listMealPlansForUser } from "@/services/meal-plans/meal-plan-service";

export default async function ActiveMealPlansPage() {
  const { userId } = await getTenantActor();
  const plans = await listMealPlansForUser({ userId }, { status: "ACTIVE", take: 200 });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active plans</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">Plans currently generating cycles and orders.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{plans.length} active</CardTitle>
          <CardDescription>Click a plan to manage cycles and selections.</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active plans yet.</p>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/meal-plans/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">
                      {p.customer.displayName ?? p.customer.name ?? p.customer.email} · {p.frequency} · {p.fulfillmentMode}
                    </p>
                  </div>
                  <Badge variant={MEAL_PLAN_STATUS_BADGE[p.status]} className="rounded-full">
                    {MEAL_PLAN_STATUS_LABEL[p.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
