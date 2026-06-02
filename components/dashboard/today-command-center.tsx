import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  ChefHat,
  Link2,
  Package,
  Plug,
  Shield,
  Truck,
} from "lucide-react";

import { PlaybookTodayStrip } from "@/components/dashboard/playbooks/playbook-today-strip";
import { TodayAttentionStrip } from "@/components/dashboard/today-attention-strip";
import { ChangelogBanner } from "@/components/dashboard/changelog-banner";
import { LaborRealtimeWidget } from "@/components/labor/labor-realtime-widget";
import { LiveActivityFeed } from "@/components/realtime/live-activity-feed";
import { LivePresence } from "@/components/realtime/live-presence";
import { SyncIndicator } from "@/components/realtime/sync-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BUSINESS_TYPE_LABELS, dashboardModeSummaryLines } from "@/lib/business-modes";
import {
  isTodayShiftQuiet,
  shouldCollapseTodayKpiWall,
} from "@/lib/today/today-command-center-focus-era18";
import {
  resolveTodayMetricsExpandHref,
  shouldCollapseTodayMetricsForBriefing,
  shouldCompactTodayReadinessForBriefing,
  shouldHideTodayAttentionStripForBriefing,
  todayMetricsExpandLabel,
} from "@/lib/briefing/owner-daily-briefing-today-focus-era19";
import { formatCurrency } from "@/lib/utils";
import type { TodayCommandCenterPayload } from "@/services/today/today-command-center-service";

export function TodayCommandCenterView({
  userId,
  email,
  data,
  showFullMetrics = false,
  briefingActive = false,
}: {
  userId: string;
  email: string | null;
  data: TodayCommandCenterPayload;
  showFullMetrics?: boolean;
  briefingActive?: boolean;
}) {
  const mode = data.settings?.businessType;
  const modeLabel = mode ? BUSINESS_TYPE_LABELS[mode] : null;
  const hints = dashboardModeSummaryLines(mode);
  const { kpis, blockers, readiness, shortageReadiness } = data;

  const quiet = isTodayShiftQuiet(kpis, blockers);
  const collapseKpiWall = briefingActive
    ? shouldCollapseTodayMetricsForBriefing({ briefingActive, showFullMetrics })
    : shouldCollapseTodayKpiWall({ quiet, showFullMetrics });
  const hideAttentionStrip = shouldHideTodayAttentionStripForBriefing(briefingActive);
  const compactReadiness = shouldCompactTodayReadinessForBriefing({
    briefingActive,
    showFullMetrics,
  });
  const metricsExpandHref = resolveTodayMetricsExpandHref(showFullMetrics);
  const metricsExpandLabel = todayMetricsExpandLabel(showFullMetrics);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
            {modeLabel ? (
              <Badge variant="secondary" className="rounded-full">
                {modeLabel}
              </Badge>
            ) : null}
            <SyncIndicator />
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {briefingActive
              ? "Detailed metrics and secondary signals — your daily briefing above covers priorities."
              : "Operational command center — orders, kitchen throughput, routes, tasks, integrations, and blockers in one place. Data is workspace-scoped; refresh to update counts."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {briefingActive ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={metricsExpandHref} data-testid="today-briefing-metrics-toggle">
                {metricsExpandLabel}
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard">Classic dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/error-recovery">Error recovery</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/system-health">System health</Link>
          </Button>
        </div>
      </div>

      {hints.length > 0 ? (
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}

      {!hideAttentionStrip ? <TodayAttentionStrip data={data} /> : null}

      {compactReadiness ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workspace setup details</CardTitle>
            <CardDescription>
              Readiness {readiness.overall}% — expand full metrics for category breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/go-live">Open go-live</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href={metricsExpandHref}>{metricsExpandLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <Card className="border-primary/25 bg-primary/[0.04] shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Workspace readiness</CardTitle>
            <Badge variant="outline" className="rounded-full tabular-nums">
              {readiness.overall}%
            </Badge>
          </div>
          <CardDescription>
            Weighted setup signal — open a category to close gaps. Shown on Today, Settings, and
            Go-live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={readiness.overall} className="h-2" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {readiness.categories.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{c.label}</span>
                  <span className="tabular-nums text-muted-foreground">{c.score}%</span>
                </div>
                {c.missing.length > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">{c.missing[0]}</p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-700">Looks good</p>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {!briefingActive ? <ChangelogBanner /> : null}
      {!briefingActive ? <LaborRealtimeWidget /> : null}

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inventory shortage readiness</CardTitle>
          <CardDescription>{shortageReadiness.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
            {shortageReadiness.level.replace(/_/g, " ")}
          </span>
          <span>Recipes {shortageReadiness.recipeCount}</span>
          <span>Stock rows {shortageReadiness.ingredientsWithStockRows}</span>
          <span>Demand runs {shortageReadiness.demandRuns}</span>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/dashboard/inventory/demand">Ingredient demand</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/dashboard/purchasing">Purchasing</Link>
          </Button>
        </CardContent>
      </Card>

      {quiet ? (
        <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Everything is calm today</CardTitle>
            <CardDescription>
              Orders, production work, packing, routes, support issues, and integration alerts will appear here when
              they need attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/dashboard/orders/new" data-tour="today-orders">
                Create order
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/products">Add menu item</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/order-hub">Open Order Hub</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/demo">View demo workspace</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/sales-channels/available">Connect sales channel</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/product-mapping">Product mapping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {collapseKpiWall ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {briefingActive ? "Full metrics collapsed" : "Metrics hidden — shift is quiet"}
            </CardTitle>
            <CardDescription>
              {briefingActive
                ? "Your daily briefing shows the operational snapshot. Open full metrics for the complete KPI wall."
                : "Full KPI tiles stay collapsed until orders, tasks, or blockers appear. Open all metrics when you need the full wall."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={metricsExpandHref} data-testid="today-show-all-metrics">
                {metricsExpandLabel}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Kpi title="Blocked orders (approx.)" value={kpis.blockedOrdersApprox} href="/dashboard/order-hub" />
        <Kpi title="Confirmed pipeline" value={kpis.confirmedOrders} href="/dashboard/orders" />
        <Kpi title="Packing queue" value={kpis.packingQueueOpen} href="/dashboard/packing" />
        <Kpi title="Production work open" value={kpis.productionWorkOpen} href="/dashboard/production" />
        <Kpi title="Orders due today" value={kpis.ordersDueToday} href="/dashboard/orders" hint="Active + dated today" />
        <Kpi title="Orders today" value={kpis.ordersToday} href="/dashboard/orders" />
        <Kpi title="POS transactions today" value={kpis.posTransactionsToday} href="/dashboard/pos/transactions" />
        <Kpi
          title="POS in kitchen (today)"
          value={kpis.posKitchenQueueToday}
          href="/dashboard/production"
          hint="Confirmed / preparing POS sales opened today"
        />
        <Kpi title="Active pipeline" value={kpis.activeOrders} href="/dashboard/order-hub" />
        <Kpi title="Kitchen avg" value={`${kpis.productionAvgPct}%`} href="/dashboard/production" />
        <Kpi title="Open tasks" value={kpis.openTasks} href="/dashboard/tasks" hint={`${kpis.overdueTasks} overdue`} />
        <Kpi title="Routes today" value={kpis.routesToday} href="/dashboard/routes" />
        <Kpi title="Webhooks in queue" value={kpis.failedWebhooks} href="/dashboard/sales-channels/webhooks" />
        {kpis.webhooksNeedingAttention > 0 ? (
          <Kpi
            title="Webhook issues"
            value={kpis.webhooksNeedingAttention}
            href="/dashboard/sales-channels/webhooks"
            hint="Errors or invalid signatures"
          />
        ) : null}
        <Kpi title="Integration errors" value={kpis.errorIntegrations} href="/dashboard/sales-channels/health" />
        <Kpi title="Channel order fails" value={kpis.failedExternalOrders} href="/dashboard/order-hub" />
        <Kpi title="Unmapped SKUs" value={kpis.unmatchedExternalProducts} href="/dashboard/product-mapping" />
        <Kpi title="Support open" value={kpis.openSupportTickets} href="/dashboard/support/inbox" />
        <Kpi title="Integrity flags" value={kpis.integrityIssueCount} href="/dashboard/system-health/data-integrity" />
        <Kpi
          title="Revenue today"
          value={formatCurrency(kpis.revenueToday)}
          href="/dashboard/analytics"
          valueClassName="text-lg"
        />
        <Kpi
          title="Revenue (7d)"
          value={formatCurrency(kpis.revenueWeek)}
          href="/dashboard/analytics"
          valueClassName="text-lg"
        />
      </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Blockers & integration risk
            </CardTitle>
            <CardDescription>Prioritized issues with deep links — empty means clear for now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No surfaced blockers.</p>
            ) : (
              blockers.map((b) => (
                <Link
                  key={b.id}
                  href={b.href}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.detail}</p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Go-live & quality
            </CardTitle>
            <CardDescription>Cross-check data and recovery workflows.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/dashboard/go-live">Go-live</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/dashboard/implementation">Implementation</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/system-health/data-integrity">Data integrity</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/error-recovery">Error recovery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Orders needing attention</CardTitle>
            <CardDescription>
              Pickup dated for today, or created today when a scheduled date is still required by fulfillment rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.ordersDueToday.length === 0 ? (
              <p className="text-muted-foreground">None queued.</p>
            ) : (
              data.ordersDueToday.map((o) => (
                <Link
                  key={o.id}
                  href={`/dashboard/orders/${o.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-2 py-1.5 hover:bg-muted/40"
                >
                  <span className="truncate font-medium">{o.customerName}</span>
                  <span className="text-xs text-muted-foreground">{o.status}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Open tasks</CardTitle>
            <CardDescription>Kitchen and ops tasks with due dates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.openTasks.length === 0 ? (
              <p className="text-muted-foreground">No open tasks.</p>
            ) : (
              data.openTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/tasks/${t.id}`}
                  className="flex flex-col rounded-lg border border-border/60 px-2 py-1.5 hover:bg-muted/40"
                >
                  <span className="font-medium leading-snug">{t.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.priority} · {t.status}
                    {t.dueAt ? ` · due ${String(t.dueAt).slice(0, 10)}` : ""}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Routes today</CardTitle>
            <CardDescription>Dispatch and driver readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.routesToday.length === 0 ? (
              <p className="text-muted-foreground">No routes scheduled for today.</p>
            ) : (
              data.routesToday.map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/routes/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-2 py-1.5 hover:bg-muted/40"
                >
                  <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span>
                  <span className="text-xs text-muted-foreground">
                    {r.status} · {r.totalStops} stops
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <PlaybookTodayStrip userId={userId} email={email} businessMode={mode ?? null} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live activity</CardTitle>
            <CardDescription>
              Recent operational events refresh when you load Today — no live websocket feed yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveActivityFeed />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Presence</CardTitle>
            <CardDescription>Team presence will appear here once presence transport is enabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <LivePresence surface="Today" />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick jumps
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Quick href="/dashboard/calendar" icon={CalendarDays} label="Calendar" />
          <Quick href="/dashboard/kitchen" icon={ChefHat} label="Kitchen screen" />
          <Quick href="/dashboard/customers" icon={Link2} label="CRM" />
          <Quick href="/dashboard/copilot" icon={Bot} label="AI copilot" />
          <Quick href="/dashboard/packing" icon={Truck} label="Packing" />
          <Quick href="/dashboard/sales-channels" icon={Plug} label="Sales channels" />
          <Quick href="/dashboard/orders/new" icon={Package} label="New order" />
        </div>
      </div>
    </div>
  );
}

function Kpi({
  title,
  value,
  href,
  hint,
  valueClassName,
}: {
  title: string;
  value: string | number;
  href: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={valueClassName ?? "text-2xl font-semibold tabular-nums"}>{value}</p>
        {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
        <Button asChild variant="link" className="mt-1 h-auto p-0 text-xs">
          <Link href={href}>Open →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Quick({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
      <Link href={href}>
        <Icon className="h-5 w-5" />
        <span className="text-left text-sm font-semibold">{label}</span>
      </Link>
    </Button>
  );
}
