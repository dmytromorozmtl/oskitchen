import { checkDatabaseHealth } from "@/lib/db/health";
import {
  KPI_DASHBOARD_METRIC_DEFINITIONS,
  type KpiDashboardMetricId,
} from "@/lib/platform/kpi-dashboard-absolute-final-policy";
import {
  computeErrorRatePct,
  computeMedianHours,
  computePlatformUptimePct,
  formatCount,
  formatHours,
  formatPercent,
  formatUsd,
  parseNpsScoreFromTitle,
  summarizeNpsFromScores,
  sumObservabilityErrors,
  type KpiMetricSnapshot,
  type KpiMetricStatus,
} from "@/lib/platform/kpi-dashboard-metrics";
import { prisma } from "@/lib/prisma";
import { loadExtendedHealthSnapshot } from "@/services/observability/health-check-service";
import { getPlatformObservabilityRollupCounts } from "@/services/observability/error-event-service";
import { countDistinctUsersLastDays } from "@/services/growth/usage-service";

export type KpiDashboardSnapshot = {
  capturedAt: string;
  metrics: KpiMetricSnapshot[];
  secondary: {
    activeSubscriptions: number;
    paidRevenue30dUsd: number;
    wau: number;
    npsResponses: number;
    orders7d: number;
  };
};

function metric(
  id: KpiDashboardMetricId,
  display: string,
  raw: number | null,
  status: KpiMetricStatus,
  hint: string,
  source: string,
): KpiMetricSnapshot {
  const def = KPI_DASHBOARD_METRIC_DEFINITIONS.find((m) => m.id === id)!;
  return {
    id,
    label: def.label,
    display,
    raw,
    unit: def.unit,
    status,
    hint,
    source,
  };
}

export async function getKpiDashboardSnapshot(): Promise<KpiDashboardSnapshot> {
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);

  const [
    dbHealth,
    partnerMrrAgg,
    paidAgg,
    activeSubscriptions,
    npsFeedback,
    firstOrders,
    dau,
    wau,
    obsCounts,
    orders7d,
    integrationErrors,
    activeWorkspaces,
  ] = await Promise.all([
    checkDatabaseHealth(),
    prisma.partnerClient
      .aggregate({ _sum: { mrrCents: true }, where: { mrrCents: { not: null } } })
      .catch(() => ({ _sum: { mrrCents: null as number | null } })),
    prisma.invoiceRecord
      .aggregate({
        where: { paidAt: { gte: since30d }, status: "PAID" },
        _sum: { amountPaidCents: true },
      })
      .catch(() => ({ _sum: { amountPaidCents: null as number | null } })),
    prisma.subscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.appFeedback
      .findMany({
        where: { featureArea: "nps_day30" },
        select: { title: true },
        take: 500,
      })
      .catch(() => []),
    prisma.order
      .findMany({
        select: { userId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: 5000,
      })
      .catch(() => []),
    countDistinctUsersLastDays(1),
    countDistinctUsersLastDays(7),
    getPlatformObservabilityRollupCounts(),
    prisma.order.count({ where: { createdAt: { gte: since7d } } }).catch(() => 0),
    prisma.integrationConnection.count({ where: { status: "ERROR" } }).catch(() => 0),
    prisma.workspace.count({ where: { active: true } }).catch(() => 0),
  ]);

  const extended = await loadExtendedHealthSnapshot(dbHealth).catch(() => null);

  const partnerMrrCents = partnerMrrAgg._sum.mrrCents ?? null;
  const paidRevenue30dUsd = Math.round((paidAgg._sum.amountPaidCents ?? 0) / 100);

  let mrrDisplay = "—";
  let mrrRaw: number | null = null;
  let mrrStatus: KpiMetricStatus = "awaiting_data";
  let mrrHint = "Wire Stripe MRR rollup — never guess paid state";
  let mrrSource = "subscriptions + partner_client.mrr_cents";

  if (partnerMrrCents !== null && partnerMrrCents > 0) {
    mrrRaw = partnerMrrCents;
    mrrDisplay = formatUsd(partnerMrrCents);
    mrrStatus = "partial";
    mrrHint = `${activeSubscriptions} active subs · partner MRR rollup`;
  } else if (paidRevenue30dUsd > 0) {
    mrrRaw = paidRevenue30dUsd * 100;
    mrrDisplay = `~${formatUsd(paidRevenue30dUsd * 100)}`;
    mrrStatus = "partial";
    mrrHint = `30d paid invoices $${paidRevenue30dUsd.toLocaleString()} — not contracted MRR`;
  }

  const npsScores = npsFeedback
    .map((row) => parseNpsScoreFromTitle(row.title))
    .filter((s): s is number => s !== null);
  const npsSummary = summarizeNpsFromScores(npsScores);
  const npsMetric = metric(
    "nps",
    npsSummary.nps !== null ? String(npsSummary.nps) : "—",
    npsSummary.nps,
    npsSummary.total >= 3 ? "live" : npsSummary.total > 0 ? "partial" : "awaiting_data",
    npsSummary.total > 0
      ? `${npsSummary.total} responses · ${npsSummary.promoters} promoters · ${npsSummary.detractors} detractors`
      : "Capture day-30 NPS via /api/nps",
    "app_feedback.feature_area = nps_day30",
  );

  const firstOrderByUser = new Map<string, Date>();
  for (const order of firstOrders) {
    if (!order.userId) continue;
    const existing = firstOrderByUser.get(order.userId);
    if (!existing || order.createdAt < existing) {
      firstOrderByUser.set(order.userId, order.createdAt);
    }
  }

  const profileCreated = await prisma.userProfile
    .findMany({
      where: { id: { in: [...firstOrderByUser.keys()] } },
      select: { id: true, createdAt: true },
    })
    .catch(() => []);

  const ttfHours: number[] = [];
  for (const profile of profileCreated) {
    const firstOrderAt = firstOrderByUser.get(profile.id);
    if (!firstOrderAt) continue;
    const deltaMs = firstOrderAt.getTime() - profile.createdAt.getTime();
    if (deltaMs >= 0) {
      ttfHours.push(deltaMs / 3600000);
    }
  }
  const medianTtf = computeMedianHours(ttfHours);

  const ttfMetric = metric(
    "ttf",
    formatHours(medianTtf),
    medianTtf,
    ttfHours.length >= 5 ? "live" : ttfHours.length > 0 ? "partial" : "awaiting_data",
    ttfHours.length > 0
      ? `Median from ${ttfHours.length} operators with first order`
      : "No signup→first-order pairs yet",
    "user_profiles.created_at → orders.created_at",
  );

  const integrationErrorRate =
    activeWorkspaces > 0 ? integrationErrors / activeWorkspaces : integrationErrors > 0 ? 1 : 0;
  const uptimePct = computePlatformUptimePct({
    databaseOk: dbHealth.ok,
    cronOk: extended?.cronExecution.ok ?? true,
    integrationErrorRate,
  });

  const uptimeMetric = metric(
    "uptime",
    formatPercent(uptimePct),
    uptimePct,
    dbHealth.ok ? "partial" : "awaiting_data",
    "Composite: DB + cron + integration fleet — not contractual SLA",
    "/api/health + observability rollup",
  );

  const errorSignals7d = sumObservabilityErrors(obsCounts);
  const errorRatePct = computeErrorRatePct(errorSignals7d, orders7d);
  const errorMetric = metric(
    "error_rate",
    formatPercent(errorRatePct),
    errorRatePct,
    orders7d > 0 || errorSignals7d > 0 ? "live" : "partial",
    `${errorSignals7d} ops errors (7d) / ${orders7d} orders (7d)`,
    "observability rollup ÷ order volume",
  );

  const dauMetric = metric(
    "dau",
    formatCount(dau),
    dau,
    dau > 0 ? "live" : "partial",
    wau > 0 ? `WAU (7d): ${wau.toLocaleString()}` : "Distinct users with usage events (24h)",
    "usage_events distinct user_id",
  );

  const mrrMetric = metric("mrr", mrrDisplay, mrrRaw, mrrStatus, mrrHint, mrrSource);

  return {
    capturedAt: new Date().toISOString(),
    metrics: [mrrMetric, npsMetric, ttfMetric, uptimeMetric, errorMetric, dauMetric],
    secondary: {
      activeSubscriptions,
      paidRevenue30dUsd,
      wau,
      npsResponses: npsSummary.total,
      orders7d,
    },
  };
}
