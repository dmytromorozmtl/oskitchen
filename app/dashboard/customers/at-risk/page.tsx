import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AtRiskCustomersPage() {
  const { userId } = await getTenantActor();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);

  const atRisk = await prisma.kitchenCustomer.findMany({
    where: {
      userId,
      OR: [{ status: "AT_RISK" }, { lastOrderAt: { lt: cutoff, not: null } }],
      status: { notIn: ["ARCHIVED", "BLOCKED"] },
    },
    orderBy: { lifetimeValueCents: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">At-risk customers</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Customers flagged at-risk plus anyone whose last order is older than 60 days. Consider scheduling a
          reactivation follow-up.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {atRisk.length === 0 ? (
            <p className="text-sm text-muted-foreground">No at-risk customers right now.</p>
          ) : (
            <ul className="space-y-2">
              {atRisk.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                      {c.displayName ?? c.name ?? c.email}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.totalOrders} orders · LTV {formatCurrency(centsToDollars(c.lifetimeValueCents))} · last {c.lastOrderAt?.toLocaleDateString() ?? "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {c.atRiskScore != null ? `risk ${c.atRiskScore}` : "risk —"}
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
