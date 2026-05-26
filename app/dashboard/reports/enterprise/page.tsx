import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";

type EnterpriseCard = {
  title: string;
  summary: string;
  detail: string;
  href?: string;
  cta?: string;
};

export default async function EnterpriseReportsPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const scope = createReportActorScope(actor);
  if (!canDoReports(scope, "reports.read.financial")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view enterprise report snapshots.
        </CardContent>
      </Card>
    );
  }
  const [orders, revenue, locations, brands, tasks] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.aggregate({ where: { userId }, _sum: { total: true } }),
    prisma.location.count({ where: { userId } }),
    prisma.brand.count({ where: { workspace: { ownerUserId: userId } } }),
    prisma.kitchenTask.groupBy({ by: ["status"], where: { userId }, _count: true }),
  ]);

  const taskSummary = tasks.map((t) => `${t.status}: ${t._count}`).join(" · ") || "No tasks";

  const cards: EnterpriseCard[] = [
    {
      title: "Revenue by workspace",
      summary: `$${Number(revenue._sum.total ?? 0).toLocaleString()} total (all time)`,
      detail: "Use financial reports for dated revenue, channels, and exports.",
      href: "/dashboard/reports/financial",
      cta: "Financial reports",
    },
    {
      title: "Orders by location",
      summary: `${orders} orders · ${locations} locations`,
      detail: "Drill into orders and filters from the reporting library.",
      href: "/dashboard/reports/orders_report",
      cta: "Orders report",
    },
    {
      title: "Production volume by brand",
      summary: `${brands} brands configured`,
      detail: "Production throughput lives on the production board; tie-ins to reporting expand over time.",
      href: "/dashboard/production",
      cta: "Production",
    },
    {
      title: "Staff task completion",
      summary: taskSummary,
      detail: "Task status snapshot — open the staff task report for date filters and export.",
      href: "/dashboard/reports/staff_task_completion",
      cta: "Staff task report",
    },
    {
      title: "Packing accuracy",
      summary: "Verification and scan events",
      detail: "Run the packing accuracy report for the selected window; data depth depends on verification usage.",
      href: "/dashboard/reports/packing_accuracy",
      cta: "Packing accuracy report",
    },
    {
      title: "Delivery performance",
      summary: "Routes and SLA-style signals",
      detail: "Delivery report aggregates route-related data where events exist.",
      href: "/dashboard/reports/delivery_report",
      cta: "Delivery report",
    },
    {
      title: "Ingredient demand by location",
      summary: "Demand runs and rollups",
      detail: "Open ingredient demand from the report library or the inventory demand workspace.",
      href: "/dashboard/reports/ingredient_demand",
      cta: "Ingredient demand report",
    },
    {
      title: "Weekly executive summary",
      summary: "Executive narrative + KPIs",
      detail: "Generated on demand from the executive report — scheduled email delivery is on the roadmap.",
      href: "/dashboard/reports/executive_weekly_summary",
      cta: "Executive weekly summary",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Enterprise reports</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Snapshot metrics below are workspace-wide. For CFO-ready slices, date ranges, and CSV/PDF-style outputs,
          open each linked report (formats vary by report — see the report library).
        </p>
        <p className="mt-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/reports/library">Browse report library</Link>
          </Button>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription className="text-foreground/90">{card.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.detail}</p>
            </CardContent>
            {card.href ? (
              <CardFooter>
                <Button asChild variant="secondary" size="sm">
                  <Link href={card.href}>{card.cta ?? "Open"}</Link>
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
