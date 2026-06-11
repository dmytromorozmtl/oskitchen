import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function GeneratedMealPlanOrdersPage() {
  const { userId } = await getTenantActor();
  const cycles = await prisma.mealPlanCycle.findMany({
    where: { mealPlan: { userId }, status: "GENERATED", orderId: { not: null } },
    include: {
      mealPlan: { select: { id: true, name: true, customer: { select: { name: true, email: true, displayName: true } } } },
      order: { select: { id: true, status: true, total: true, fulfillmentType: true, createdAt: true } },
    },
    orderBy: { generatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Generated draft orders</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Orders generated from meal plan cycles. They start as <strong>PENDING</strong> drafts — confirm or
          edit them in Order Hub.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{cycles.length} generated</CardTitle>
          <CardDescription>Orders flow into Order Hub, Production, Packing, and Routes from there.</CardDescription>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No generated orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {cycles.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/meal-plans/${c.mealPlan.id}`} className="font-medium hover:underline">
                      {c.mealPlan.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.mealPlan.customer.displayName ?? c.mealPlan.customer.name ?? c.mealPlan.customer.email} ·
                      cycle {c.cycleStartDate.toLocaleDateString()} ·
                      {c.order ? ` ${c.order.fulfillmentType}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.order ? (
                      <Badge variant="outline" className="rounded-full">{c.order.status}</Badge>
                    ) : null}
                    {c.order ? (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(Number(c.order.total))}
                      </span>
                    ) : null}
                    {c.order ? (
                      <Link href={`/dashboard/orders/${c.order.id}`} className="text-xs underline">Open order</Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
