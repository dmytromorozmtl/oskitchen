import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomersHubPageAccess } from "@/lib/crm/crm-page-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { formatCurrency } from "@/lib/utils";
import { loadUnifiedProfileHubSnapshot } from "@/services/crm/unified-profile-service";

export const metadata = {
  title: "Unified Customer Profiles",
  description: "Single view of orders, preferences, history, and loyalty across your customer base.",
};

export default async function UnifiedProfileHubPage() {
  const access = await requireCustomersHubPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await requireTenantActor();
  const snapshot = await loadUnifiedProfileHubSnapshot(userId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Unified Customer Profiles"
        description="Orders, dietary preferences, activity history, and loyalty — one screen per customer."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.totalCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.withOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With loyalty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.withLoyalty}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top customers</CardTitle>
          <CardDescription>Ranked by lifetime value — open a unified profile for full context</CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No customers yet.{" "}
              <Link href="/dashboard/customers/new" className="underline">
                Add one
              </Link>{" "}
              or place an order to backfill from email.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {snapshot.customers.map((row) => (
                <li key={row.customerId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={row.href} className="font-medium hover:underline">
                      {row.displayName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline" className="rounded-full tabular-nums">
                      {formatCurrency(row.lifetimeValueUsd)} LTV
                    </Badge>
                    <Badge variant="secondary" className="rounded-full tabular-nums">
                      {row.totalOrders} orders
                    </Badge>
                    {row.loyaltyPoints != null && row.loyaltyPoints > 0 ? (
                      <Badge variant="secondary" className="rounded-full tabular-nums">
                        {row.loyaltyPoints} pts
                      </Badge>
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
