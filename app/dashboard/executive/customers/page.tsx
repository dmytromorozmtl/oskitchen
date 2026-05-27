import Link from "next/link";

import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const access = await requireExecutivePageAccess("executive.view");
  if (!access.ok) return access.deny;
  const { scope, actor } = access;
  const dataUserId = actor.userId;
  const user = { id: actor.sessionUserId };
  const filters = parseAnalyticsFilters(sp);
  const showPii = canViewExecutive(scope, "executive.read.customer_pii");

  const [overview, atRiskCount, vipCount, brands, locations] = await Promise.all([
    loadExecutiveOverview({ userId: dataUserId }, filters),
    prisma.kitchenCustomer.count({
      where: { userId: dataUserId, atRiskScore: { gt: 60 } },
    }),
    prisma.kitchenCustomer.count({
      where: { userId: dataUserId, lifetimeValueCents: { gt: 50_000 } },
    }),
    prisma.brand.findMany({
      where: { workspace: { ownerUserId: user.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { userId: dataUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const focusKeys = new Set(["repeat_customers", "new_customers"]);
  const kpis = overview.kpis.filter((k) => focusKeys.has(k.key));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">{overview.rangeLabel}</p>
      </header>
      <ExecutiveFilterBar
        filters={filters}
        basePath="/dashboard/executive/customers"
        brands={brands}
        locations={locations}
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription>VIPs</CardDescription>
            <CardTitle className="text-2xl font-semibold">{vipCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs">
            <p className="text-muted-foreground">Lifetime value &gt; $500</p>
            <Link href="/dashboard/customers" className="text-primary hover:underline">
              Drill down →
            </Link>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-1">
            <CardDescription>At-risk customers</CardDescription>
            <CardTitle className="text-2xl font-semibold">{atRiskCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs">
            <p className="text-muted-foreground">CRM at-risk score &gt; 60</p>
            <Link href="/dashboard/customers/at-risk" className="text-primary hover:underline">
              Drill down →
            </Link>
          </CardContent>
        </Card>
      </section>
      {!showPii && (
        <p className="text-xs text-muted-foreground">
          Customer PII is masked for your role. Owners and admins can drill down into the CRM for the
          full customer list.
        </p>
      )}
    </div>
  );
}
