import Link from "next/link";

import { recomputeCrmMetricsFormAction } from "@/actions/customers";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  hasCrmCustomersPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
import { crmTerminologyForMode } from "@/lib/crm/customer-types";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABEL,
} from "@/lib/crm/customer-status";
import { parseAllergies } from "@/lib/crm/customer-privacy";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { loadCrmOverviewKpis } from "@/services/crm/customer-metrics-service";
import {
  backfillCustomersFromOrders,
  listCustomersForUser,
} from "@/services/crm/customer-service";
import { Users } from "lucide-react";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export default async function CustomersPage() {
  const pageActor = await loadWorkspacePermissionPageActor();
  if (!hasCrmCustomersPageAccess(pageActor)) {
    return <PermissionDeniedSurfaceCard surfaceId="crm_customers" />;
  }

  const { userId } = await requireTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const terminology = crmTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);

  // Lazy backfill: if there are orders but zero KitchenCustomers, derive them
  // once so the empty state disappears for existing workspaces.
  const [customerWhere, orderWhere] = await Promise.all([
    kitchenCustomerListWhereForOwner(userId),
    orderListWhereForOwner(userId),
  ]);
  const customerCount = await prisma.kitchenCustomer.count({ where: customerWhere });
  if (customerCount === 0) {
    const orderCount = await prisma.order.count({ where: orderWhere });
    if (orderCount > 0) {
      await backfillCustomersFromOrders(userId);
    }
  }

  const [customers, kpis] = await Promise.all([
    listCustomersForUser({ userId }, { take: 25 }),
    loadCrmOverviewKpis(userId),
  ]);

  if (customers.length === 0) {
    return (
      <PlanGate userId={userId} feature="customer_crm" title={terminology.pageTitle}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 text-muted-foreground">{terminology.pageSubtitle}</p>
          </div>
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers can come from orders, storefront checkout, sales channels, imports, catering quotes, event inquiries, or manual entry."
            primaryLabel={terminology.newCtaLabel}
            primaryHref="/dashboard/customers/new"
            secondaryLabel="Create order"
            secondaryHref="/dashboard/orders/new"
            demoHref="/dashboard/import-center"
          />
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate userId={userId} feature="customer_crm" title={terminology.pageTitle}>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{terminology.pageSubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/customers/new">{terminology.newCtaLabel}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/import-center">Import customers</Link>
            </Button>
            <form action={recomputeCrmMetricsFormAction}>
              <Button type="submit" variant="ghost" size="sm">
                Recalculate metrics
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total customers" value={kpis.totalCustomers} />
          <Kpi label="New (30d)" value={kpis.newCustomers30d} />
          <Kpi label="Repeat customers" value={kpis.repeatCustomers} />
          <Kpi label="VIPs" value={kpis.vips} />
          <Kpi label="At risk" value={kpis.atRisk} />
          <Kpi label="With allergies" value={kpis.withAllergies} />
          <Kpi label="Catering / event" value={kpis.cateringClients} />
          <Kpi label="Avg order value" value={formatCurrency(centsToDollars(kpis.averageOrderValueCents))} />
          <Kpi label="Lifetime revenue" value={formatCurrency(centsToDollars(kpis.lifetimeValueCentsTotal))} />
          <Kpi label="Repeat revenue (30d)" value={formatCurrency(centsToDollars(kpis.repeatRevenue30dCents))} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top {terminology.customersHeading.toLowerCase()}</CardTitle>
            <CardDescription>
              Sorted by lifetime value. Click a row to open the customer detail page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Customer</th>
                    <th className="py-2 pr-2">Email</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2 text-right">Orders</th>
                    <th className="py-2 pr-2 text-right">LTV</th>
                    <th className="py-2 pr-2 text-right">AOV</th>
                    <th className="py-2 pr-2">Last order</th>
                    <th className="py-2 pr-2">Allergy</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const allergies = parseAllergies(c.allergiesJson);
                    return (
                      <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="py-2 pr-2">
                          <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                            {c.displayName ?? c.name ?? c.email}
                          </Link>
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">{c.email}</td>
                        <td className="py-2 pr-2">
                          <Badge variant={CUSTOMER_STATUS_BADGE[c.status]} className="rounded-full">
                            {CUSTOMER_STATUS_LABEL[c.status]}
                          </Badge>
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">{c.totalOrders}</td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {formatCurrency(centsToDollars(c.lifetimeValueCents))}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {formatCurrency(centsToDollars(c.averageOrderValueCents))}
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">
                          {c.lastOrderAt ? c.lastOrderAt.toLocaleDateString() : "—"}
                        </td>
                        <td className="py-2 pr-2">
                          {allergies.length > 0 ? (
                            <Badge variant="destructive" className="rounded-full">{allergies.length}</Badge>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
