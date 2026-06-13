import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { ReportsHubNextActionsPanel } from "@/components/dashboard/reports-hub-next-actions-panel";
import { ScheduledReportsP2_48Panel } from "@/components/reports/scheduled-reports-p2-48-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hasReportsHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { reportTerminologyForMode } from "@/lib/reports/report-terminology";
import {
  getReportRegistryForScope,
  listReportExportHistory,
  listSavedReports,
} from "@/services/reports/report-service";
import { listReportDefinitions } from "@/lib/reports/report-registry";
import { buildReportsHubNextActionCards } from "@/lib/reports/reports-hub-next-actions-era21";
import { hasPermission } from "@/lib/permissions/guards";
import { loadScheduledReportsPanelModel } from "@/services/analytics/scheduled-reports-p2-48-service";

export default async function ReportsCommandCenterPage() {
  const actor = await loadWorkspacePermissionPageActor();
  if (!hasReportsHubPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="reports_hub" />;
  }

  const { userId } = actor;
  const scope = createReportActorScope(actor);

  const [profile, exportHistory, saved, monthExports, scheduledReports] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { kitchenSettings: { select: { businessType: true } } },
    }),
    listReportExportHistory(userId, 5),
    listSavedReports(userId),
    prisma.exportJob.count({
      where: {
        userId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    loadScheduledReportsPanelModel(userId).catch((error) => {
      console.error("[reports] scheduled reports panel load failed", error);
      return null;
    }),
  ]);

  const terminology = reportTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);
  const visible = getReportRegistryForScope(scope);
  const definitions = listReportDefinitions();
  const pinned = saved.filter((s) => s.pinned);
  const lastExport = exportHistory[0] ?? null;
  const nextActionCards = buildReportsHubNextActionCards({
    monthExports,
    pinnedCount: pinned.length,
    visibleReportCount: visible.length,
    hasFinancialAccess: hasPermission(actor.granted, "reports.read.financial"),
    hasOperationsAccess: hasPermission(actor.granted, "reports.read.operations"),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {terminology.pageSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link
            href="/dashboard/reports/library"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {terminology.primaryCtaLabel}
          </Link>
          <Link
            href="/dashboard/reports/catalog"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Report catalog (100+)
          </Link>
          <Link
            href="/dashboard/reports/history"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Export history
          </Link>
        </div>
      </header>

      <ReportsHubNextActionsPanel cards={nextActionCards} />

      {scheduledReports ? <ScheduledReportsP2_48Panel data={scheduledReports} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Reports this month" value={monthExports.toLocaleString()} />
        <KpiCard label="Saved reports" value={saved.length.toLocaleString()} />
        <KpiCard label="Templates available" value={visible.length.toLocaleString()} />
        <KpiCard
          label="Last export"
          value={lastExport ? lastExport.createdAt.toISOString().slice(0, 10) : "—"}
          sub={lastExport ? lastExport.type : "No exports yet"}
        />
        <KpiCard
          label="Pinned for weekly review"
          value={pinned.length.toLocaleString()}
          sub={terminology.weeklyFocus}
        />
      </section>

      {pinned.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Pinned reports</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pinned.map((sr) => (
              <Card key={sr.id} className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{sr.name}</CardTitle>
                  <CardDescription>{sr.reportKey}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {sr.description && <p className="text-muted-foreground">{sr.description}</p>}
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href={`/dashboard/reports/${sr.reportKey}?${new URLSearchParams(
                      (sr.filtersJson as Record<string, string> | null) ?? {},
                    ).toString()}`}
                  >
                    Open report →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Owner weekly review</h2>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <p>{terminology.weeklyFocus}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <Link className="text-primary hover:underline" href="/dashboard/reports/executive_weekly_summary">
                  Executive weekly summary
                </Link>{" "}
                — revenue, AOV, repeat rate, production/packing/delivery health.
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/dashboard/reports/sales_by_channel">
                  Sales by channel
                </Link>{" "}
                — confirm channel mix is on plan.
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/dashboard/reports/inventory_shortage_report">
                  Inventory shortage report
                </Link>{" "}
                — close shortages before next production cycle.
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/dashboard/reports/customer_retention">
                  Customer retention
                </Link>{" "}
                — watch repeat-rate movement.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Most useful reports for you</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visible.slice(0, 6).map((d) => (
            <Card key={d.key} className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{d.title}</CardTitle>
                <CardDescription>{d.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{d.description}</p>
                <Link
                  href={d.generatorRoute}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open report →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {definitions.length === 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-2 py-8 text-center text-sm text-muted-foreground">
            <p className="text-base font-medium text-foreground">Reports need operational data</p>
            <p>
              Create orders, menus, production tasks, customers, or imports to generate reports.
            </p>
            <Link
              href="/dashboard/orders"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create order
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
      {sub && (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {sub}
        </CardContent>
      )}
    </Card>
  );
}
