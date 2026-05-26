import Link from "next/link";

import {
  generateCycleDraftFormAction,
  skipCycleFormAction,
} from "@/actions/meal-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  MEAL_PLAN_CYCLE_STATUS_BADGE,
  MEAL_PLAN_CYCLE_STATUS_LABEL,
} from "@/lib/meal-plans/meal-plan-status";
import { startOfDayUtc } from "@/lib/meal-plans/meal-plan-schedules";
import { prisma } from "@/lib/prisma";

export default async function MealPlanCyclesPage() {
  const { userId } = await getTenantActor();
  const today = startOfDayUtc(new Date());
  const horizon = new Date(today.getTime());
  horizon.setUTCDate(horizon.getUTCDate() + 14);

  const cycles = await prisma.mealPlanCycle.findMany({
    where: {
      mealPlan: { userId },
      status: { in: ["UPCOMING", "NEEDS_SELECTION", "READY_TO_GENERATE", "PAUSED"] },
    },
    include: {
      mealPlan: {
        select: {
          id: true,
          name: true,
          status: true,
          fulfillmentMode: true,
          customer: { select: { name: true, email: true, displayName: true } },
        },
      },
      _count: { select: { selections: true } },
    },
    orderBy: { cycleStartDate: "asc" },
    take: 200,
  });

  const dueThisWeek = cycles.filter((c) => c.cycleStartDate <= horizon);
  const later = cycles.filter((c) => c.cycleStartDate > horizon);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming cycles</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Cycles due in the next 14 days, plus everything else upcoming. Generate the draft order when ready,
          skip a cycle, or jump into the plan to edit selections.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Due this week</CardTitle>
          <CardDescription>{dueThisWeek.length} cycle(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {dueThisWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cycles due. Upcoming meal plan cycles will appear here when orders need to be generated.
            </p>
          ) : (
            <ul className="space-y-2">
              {dueThisWeek.map((c) => (
                <CycleRow key={c.id} cycle={c} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {later.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Further out</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {later.map((c) => (
                <CycleRow key={c.id} cycle={c} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

type CycleRowProps = {
  cycle: {
    id: string;
    cycleStartDate: Date;
    status: keyof typeof MEAL_PLAN_CYCLE_STATUS_LABEL;
    mealsPlanned: number;
    _count: { selections: number };
    mealPlan: {
      id: string;
      name: string;
      fulfillmentMode: string;
      customer: { name: string | null; email: string; displayName: string | null };
    };
  };
};

function CycleRow({ cycle }: CycleRowProps) {
  const canGenerate = cycle._count.selections > 0 && cycle.status === "READY_TO_GENERATE";
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
      <div>
        <Link href={`/dashboard/meal-plans/${cycle.mealPlan.id}`} className="font-medium hover:underline">
          {cycle.mealPlan.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {cycle.mealPlan.customer.displayName ?? cycle.mealPlan.customer.name ?? cycle.mealPlan.customer.email}
          {" · "}
          starts {cycle.cycleStartDate.toLocaleDateString()}
          {" · "}
          {cycle.mealPlan.fulfillmentMode}
          {" · "}
          {cycle._count.selections} selection(s)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={MEAL_PLAN_CYCLE_STATUS_BADGE[cycle.status]} className="rounded-full">
          {MEAL_PLAN_CYCLE_STATUS_LABEL[cycle.status]}
        </Badge>
        <form action={generateCycleDraftFormAction}>
          <input type="hidden" name="cycleId" value={cycle.id} />
          <Button type="submit" size="sm" disabled={!canGenerate}>
            {canGenerate ? "Generate draft" : "Add selection"}
          </Button>
        </form>
        <form action={skipCycleFormAction}>
          <input type="hidden" name="cycleId" value={cycle.id} />
          <Button type="submit" size="sm" variant="ghost">Skip</Button>
        </form>
      </div>
    </li>
  );
}
