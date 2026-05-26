import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function NeedsReviewMealPlansPage() {
  const { userId } = await getTenantActor();
  const plans = await prisma.mealPlan.findMany({
    where: {
      userId,
      OR: [
        { status: "NEEDS_REVIEW" },
        { status: "ACTIVE", cycles: { some: { status: "NEEDS_SELECTION" } } },
      ],
    },
    include: {
      customer: { select: { name: true, email: true, displayName: true } },
      _count: { select: { cycles: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Plans need review</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          These plans need selections, fulfillment details, or customer preference updates before generating
          orders.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{plans.length} plan(s)</CardTitle>
          <CardDescription>Tap a plan to update selections and continue.</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">All plans are ready.</p>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <li key={p.id} className="rounded-md border border-border/60 p-3">
                  <Link href={`/dashboard/meal-plans/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.customer.displayName ?? p.customer.name ?? p.customer.email} · {p._count.cycles} cycle(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
