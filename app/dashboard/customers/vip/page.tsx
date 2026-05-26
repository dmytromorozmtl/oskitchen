import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function VipCustomersPage() {
  const { userId } = await getTenantActor();
  const vips = await prisma.kitchenCustomer.findMany({
    where: { userId, status: "VIP" },
    orderBy: { lifetimeValueCents: "desc" },
    take: 200,
  });
  const candidates = await prisma.kitchenCustomer.findMany({
    where: {
      userId,
      status: { not: "VIP" },
      OR: [{ totalOrders: { gte: 5 } }, { lifetimeValueCents: { gte: 50000 } }],
    },
    orderBy: { lifetimeValueCents: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">VIP customers</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Status-flagged VIPs plus high-frequency / high-LTV candidates that could be promoted.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current VIPs</CardTitle>
          <CardDescription>{vips.length} VIP customers</CardDescription>
        </CardHeader>
        <CardContent>
          {vips.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No customers are flagged VIP yet. Promote from a customer&apos;s detail page.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {vips.map((c) => (
                <li key={c.id} className="rounded-md border border-border/60 p-3">
                  <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                    {c.displayName ?? c.name ?? c.email}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.totalOrders} orders · LTV {formatCurrency(centsToDollars(c.lifetimeValueCents))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">VIP candidates</CardTitle>
          <CardDescription>5+ orders or LTV ≥ $500</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidates yet.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {candidates.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                      {c.displayName ?? c.name ?? c.email}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.totalOrders} orders · LTV {formatCurrency(centsToDollars(c.lifetimeValueCents))}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">candidate</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
