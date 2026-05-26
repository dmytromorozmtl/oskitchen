import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function MealPlanCustomersPage() {
  const { userId } = await getTenantActor();
  const customers = await prisma.kitchenCustomer.findMany({
    where: { userId, mealPlans: { some: {} } },
    include: { _count: { select: { mealPlans: true } } },
    orderBy: { name: "asc" },
    take: 200,
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Subscribers</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Customers with at least one meal plan. Open the customer profile in CRM to see full history,
          consent, and allergies.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{customers.length} customer(s)</CardTitle>
          <CardDescription>Number of plans per customer is shown to the right.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customers with meal plans yet.</p>
          ) : (
            <ul className="space-y-2">
              {customers.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                  <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                    {c.displayName ?? c.name ?? c.email}
                  </Link>
                  <span className="text-xs text-muted-foreground">{c._count.mealPlans} plan(s)</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
