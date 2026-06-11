import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { MEAL_PLAN_STATUS_BADGE, MEAL_PLAN_STATUS_LABEL } from "@/lib/meal-plans/meal-plan-status";
import { prisma } from "@/lib/prisma";

export default async function PausedMealPlansPage() {
  const { userId } = await getTenantActor();
  const plans = await prisma.mealPlan.findMany({
    where: { userId, status: { in: ["PAUSED", "CANCELLED", "EXPIRED", "COMPLETED"] } },
    include: { customer: { select: { name: true, email: true, displayName: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Paused / cancelled / expired</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Plans not currently generating cycles. Resume from the plan detail page.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{plans.length} plan(s)</CardTitle>
          <CardDescription>History is preserved — no data is deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No paused or cancelled plans.</p>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/meal-plans/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.customer.displayName ?? p.customer.name ?? p.customer.email}
                      {p.pauseReason ? ` · ${p.pauseReason}` : ""}
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
