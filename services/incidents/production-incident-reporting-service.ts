import { prisma } from "@/lib/prisma";
import {
  loadProductionIncidentRollup,
  type ProductionIncidentItem,
  type ProductionIncidentRemediationControlStatus,
  type ProductionIncidentRootCauseCategory,
  type ProductionIncidentReviewStatus,
  type ProductionIncidentRollup,
  type ProductionIncidentSource,
  type ProductionIncidentWorkflowStatus,
} from "@/services/incidents/production-incident-rollup-service";
import {
  expectedRemediationTaskKindForIncident,
  loadActiveProductionIncidentRemediationTaskSnapshots,
  type ProductionIncidentRemediationTaskKind,
  type ProductionIncidentRemediationTaskSnapshot,
} from "@/services/incidents/production-incident-remediation-task-service";

type ReportSeverity = ProductionIncidentItem["severity"];

const REPORT_WINDOW_DAYS = 30;
const REPEAT_OFFENDER_WINDOW_DAYS = 90;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const INCIDENT_ACK_SLA_MS: Record<ReportSeverity, number> = {
  critical: 15 * MS_PER_MINUTE,
  high: 60 * MS_PER_MINUTE,
  medium: 4 * MS_PER_HOUR,
  low: 8 * MS_PER_HOUR,
};

const INCIDENT_RESOLUTION_SLA_MS: Record<ReportSeverity, number> = {
  critical: 4 * MS_PER_HOUR,
  high: 24 * MS_PER_HOUR,
  medium: 72 * MS_PER_HOUR,
  low: 120 * MS_PER_HOUR,
};

type IncidentAnalyticsRow = {
  id: string;
  title: string;
  severity: string;
  workflowStatus: string;
  reviewStatus: string;
  rootCauseCategory: string | null;
  remediationControlStatus: string;
  remediationSnoozedUntil: Date | null;
  remediationControlSummary: string | null;
  source: string;
  sourceKey: string;
  href: string;
  ownerLabel: string;
  assignedToId: string | null;
  remediationOwnerId: string | null;
  remediationDueAt: Date | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  metadataJson: unknown;
  assignedTo: { fullName: string; email: string } | null;
  remediationOwner: { fullName: string; email: string } | null;
};

export type ProductionIncidentAttentionItem = {
  id: string;
  title: string;
  severity: ReportSeverity;
  source: ProductionIncidentSource;
  workflowStatus: ProductionIncidentWorkflowStatus;
  href: string;
  ownerLabel: string;
  assignedToName: string | null;
  assignedToEmail: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  ageMs: number;
  ackDueAt: string | null;
  resolutionDueAt: string;
  ackOverdue: boolean;
  resolutionOverdue: boolean;
  unassigned: boolean;
};

export type ProductionIncidentRepeatOffender = {
  familyKey: string;
  label: string;
  source: ProductionIncidentSource;
  latestSourceKey: string;
  uniqueSourceKeys: number;
  incidentCount: number;
  reopenCount: number;
  cycleCount: number;
  openCount: number;
  criticalCount: number;
  pendingReviewCount: number;
  lastSeenAt: string;
  href: string;
};

export type ProductionIncidentRemediationAttentionItem = {
  id: string;
  title: string;
  source: ProductionIncidentSource;
  reviewStatus: ProductionIncidentReviewStatus;
  remediationControlStatus: ProductionIncidentRemediationControlStatus;
  rootCauseCategory: ProductionIncidentRootCauseCategory | null;
  remediationOwnerName: string | null;
  remediationOwnerEmail: string | null;
  remediationDueAt: string | null;
  remediationSnoozedUntil: string | null;
  remediationOverdue: boolean;
  dueWithin7d: boolean;
  remediationControlSummary: string | null;
  remediationTaskExpected: boolean;
  remediationTaskMissing: boolean;
  remediationTaskKind: ProductionIncidentRemediationTaskKind | null;
  remediationTaskStatus: string | null;
  remediationTaskPriority: string | null;
  remediationTaskDueAt: string | null;
  remediationTaskOwnerName: string | null;
  remediationTaskOwnerEmail: string | null;
  remediationTaskHref: string | null;
  href: string;
};

export type ProductionIncidentRootCauseTrendItem = {
  category: ProductionIncidentRootCauseCategory;
  incidentCount: number;
  openCount: number;
  remediationOverdueCount: number;
};

export type ProductionIncidentExecutiveReport = {
  summary: {
    open: number;
    critical: number;
    high: number;
    unassigned: number;
    awaitingAcknowledgement: number;
    ackOverdue: number;
    resolutionOverdue: number;
    agedOver24h: number;
    agedOver72h: number;
    resolvedLast30d: number;
    pendingReview: number;
    inRemediation: number;
    completedReview: number;
    remediationOverdue: number;
    remediationDueNext7d: number;
    remediationTracking: number;
    remediationOwnerEngaged: number;
    remediationSnoozed: number;
    remediationReassignmentRequested: number;
    remediationTaskBacked: number;
    remediationTaskMissing: number;
    remediationReassignmentTasks: number;
    remediationOwnerFollowUpTasks: number;
    mttaMs: number | null;
    mttrMs: number | null;
  };
  bySource: Record<ProductionIncidentSource, number>;
  byWorkflow: Record<Exclude<ProductionIncidentWorkflowStatus, "RESOLVED">, number>;
  byReview: Record<ProductionIncidentReviewStatus, number>;
  byRemediationControl: Record<ProductionIncidentRemediationControlStatus, number>;
  attention: ProductionIncidentAttentionItem[];
  remediationAttention: ProductionIncidentRemediationAttentionItem[];
  rootCauseTrends: ProductionIncidentRootCauseTrendItem[];
  repeatOffenders: ProductionIncidentRepeatOffender[];
};

export type ProductionIncidentExecutiveSnapshot = {
  rollup: ProductionIncidentRollup;
  report: ProductionIncidentExecutiveReport;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function reportSeverity(value: string): ReportSeverity {
  if (value === "critical" || value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium";
}

function reportWorkflowStatus(value: string): ProductionIncidentWorkflowStatus {
  if (value === "OPEN" || value === "ACKNOWLEDGED" || value === "MONITORING" || value === "RESOLVED") {
    return value;
  }
  return "OPEN";
}

function reportSource(value: string): ProductionIncidentSource {
  if (value === "startup_readiness" || value === "critical_cron" || value === "webhook_recovery") {
    return value;
  }
  return "critical_cron";
}

function reportReviewStatus(value: string): ProductionIncidentReviewStatus {
  if (value === "PENDING" || value === "IN_REMEDIATION" || value === "COMPLETED") {
    return value;
  }
  return "PENDING";
}

function reportRemediationControlStatus(
  value: string,
): ProductionIncidentRemediationControlStatus {
  if (
    value === "TRACKING" ||
    value === "OWNER_ENGAGED" ||
    value === "SNOOZED" ||
    value === "REASSIGNMENT_REQUESTED"
  ) {
    return value;
  }
  return "TRACKING";
}

function reportRootCauseCategory(value: string | null): ProductionIncidentRootCauseCategory | null {
  if (
    value === "configuration" ||
    value === "code_regression" ||
    value === "dependency" ||
    value === "capacity" ||
    value === "data_integrity" ||
    value === "operator_error" ||
    value === "third_party" ||
    value === "unknown"
  ) {
    return value;
  }
  return null;
}

function asMetadataRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function effectiveRemediationDueAt(row: Pick<
  IncidentAnalyticsRow,
  "remediationDueAt" | "remediationControlStatus" | "remediationSnoozedUntil"
>): Date | null {
  const remediationControlStatus = reportRemediationControlStatus(
    row.remediationControlStatus,
  );
  if (
    remediationControlStatus === "SNOOZED" &&
    row.remediationSnoozedUntil &&
    (!row.remediationDueAt ||
      row.remediationSnoozedUntil.getTime() > row.remediationDueAt.getTime())
  ) {
    return row.remediationSnoozedUntil;
  }
  return row.remediationDueAt;
}

function buildAttentionItem(row: IncidentAnalyticsRow, now: Date): ProductionIncidentAttentionItem {
  const severity = reportSeverity(row.severity);
  const workflowStatus = reportWorkflowStatus(row.workflowStatus);
  const source = reportSource(row.source);
  const ageMs = now.getTime() - row.firstSeenAt.getTime();
  const ackDueAt =
    workflowStatus === "OPEN"
      ? new Date(row.firstSeenAt.getTime() + INCIDENT_ACK_SLA_MS[severity])
      : null;
  const resolutionDueAt = new Date(
    row.firstSeenAt.getTime() + INCIDENT_RESOLUTION_SLA_MS[severity],
  );
  return {
    id: row.id,
    title: row.title,
    severity,
    source,
    workflowStatus,
    href: row.href,
    ownerLabel: row.ownerLabel,
    assignedToName: row.assignedTo?.fullName ?? null,
    assignedToEmail: row.assignedTo?.email ?? null,
    firstSeenAt: row.firstSeenAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    ageMs,
    ackDueAt: ackDueAt?.toISOString() ?? null,
    resolutionDueAt: resolutionDueAt.toISOString(),
    ackOverdue: Boolean(ackDueAt && now.getTime() > ackDueAt.getTime()),
    resolutionOverdue: now.getTime() > resolutionDueAt.getTime(),
    unassigned: !row.assignedToId,
  };
}

function compareAttention(a: ProductionIncidentAttentionItem, b: ProductionIncidentAttentionItem) {
  const severityRank: Record<ReportSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const aBreach = Number(a.resolutionOverdue) + Number(a.ackOverdue) + Number(a.unassigned);
  const bBreach = Number(b.resolutionOverdue) + Number(b.ackOverdue) + Number(b.unassigned);
  if (aBreach !== bBreach) return bBreach - aBreach;
  const severityDelta = severityRank[a.severity] - severityRank[b.severity];
  if (severityDelta !== 0) return severityDelta;
  return b.ageMs - a.ageMs;
}

function buildRemediationAttentionItem(
  row: IncidentAnalyticsRow,
  now: Date,
  remediationTask: ProductionIncidentRemediationTaskSnapshot | undefined,
): ProductionIncidentRemediationAttentionItem | null {
  if (!row.remediationDueAt && !row.remediationOwnerId) return null;
  const reviewStatus = reportReviewStatus(row.reviewStatus);
  if (reviewStatus === "COMPLETED") return null;
  const effectiveDueAt = effectiveRemediationDueAt(row);
  const remediationControlStatus = reportRemediationControlStatus(
    row.remediationControlStatus,
  );
  const remediationDueAtIso = effectiveDueAt?.toISOString() ?? null;
  const dueWithin7d = Boolean(
    effectiveDueAt &&
      effectiveDueAt.getTime() >= now.getTime() &&
      effectiveDueAt.getTime() <= now.getTime() + 7 * MS_PER_DAY,
  );
  const remediationOverdue = Boolean(
    effectiveDueAt && effectiveDueAt.getTime() < now.getTime(),
  );
  const expectedTaskKind = expectedRemediationTaskKindForIncident(
    {
      reviewStatus: row.reviewStatus,
      remediationControlStatus: row.remediationControlStatus,
      remediationSnoozedUntil: row.remediationSnoozedUntil,
      remediationDueAt: row.remediationDueAt,
      remediationOwnerId: row.remediationOwnerId,
    },
    now,
  );
  return {
    id: row.id,
    title: row.title,
    source: reportSource(row.source),
    reviewStatus,
    remediationControlStatus,
    rootCauseCategory: reportRootCauseCategory(row.rootCauseCategory),
    remediationOwnerName: row.remediationOwner?.fullName ?? null,
    remediationOwnerEmail: row.remediationOwner?.email ?? null,
    remediationDueAt: remediationDueAtIso,
    remediationSnoozedUntil: row.remediationSnoozedUntil?.toISOString() ?? null,
    remediationOverdue,
    dueWithin7d,
    remediationControlSummary: row.remediationControlSummary ?? null,
    remediationTaskExpected: Boolean(expectedTaskKind),
    remediationTaskMissing: Boolean(expectedTaskKind && !remediationTask),
    remediationTaskKind: remediationTask?.taskKind ?? expectedTaskKind ?? null,
    remediationTaskStatus: remediationTask?.taskStatus ?? null,
    remediationTaskPriority: remediationTask?.taskPriority ?? null,
    remediationTaskDueAt: remediationTask?.taskDueAt ?? null,
    remediationTaskOwnerName: remediationTask?.taskOwnerName ?? null,
    remediationTaskOwnerEmail: remediationTask?.taskOwnerEmail ?? null,
    remediationTaskHref: remediationTask?.taskHref ?? null,
    href: row.href,
  };
}

function compareRemediationAttention(
  a: ProductionIncidentRemediationAttentionItem,
  b: ProductionIncidentRemediationAttentionItem,
) {
  if (a.remediationOverdue !== b.remediationOverdue) {
    return Number(b.remediationOverdue) - Number(a.remediationOverdue);
  }
  if (a.dueWithin7d !== b.dueWithin7d) {
    return Number(b.dueWithin7d) - Number(a.dueWithin7d);
  }
  const aDue = a.remediationDueAt ? Date.parse(a.remediationDueAt) : Number.POSITIVE_INFINITY;
  const bDue = b.remediationDueAt ? Date.parse(b.remediationDueAt) : Number.POSITIVE_INFINITY;
  return aDue - bDue;
}

function buildRootCauseTrends(
  rows: IncidentAnalyticsRow[],
  now: Date,
): ProductionIncidentRootCauseTrendItem[] {
  const trends = new Map<ProductionIncidentRootCauseCategory, ProductionIncidentRootCauseTrendItem>();
  for (const row of rows) {
    const category = reportRootCauseCategory(row.rootCauseCategory);
    if (!category) continue;
    const existing = trends.get(category) ?? {
      category,
      incidentCount: 0,
      openCount: 0,
      remediationOverdueCount: 0,
    };
    existing.incidentCount += 1;
    existing.openCount += reportWorkflowStatus(row.workflowStatus) === "RESOLVED" ? 0 : 1;
    existing.remediationOverdueCount +=
      effectiveRemediationDueAt(row) &&
      effectiveRemediationDueAt(row)!.getTime() < now.getTime()
        ? 1
        : 0;
    trends.set(category, existing);
  }
  return Array.from(trends.values()).sort((a, b) => {
    if (a.incidentCount !== b.incidentCount) return b.incidentCount - a.incidentCount;
    if (a.openCount !== b.openCount) return b.openCount - a.openCount;
    return b.remediationOverdueCount - a.remediationOverdueCount;
  });
}

function deriveRepeatOffenderFamily(row: IncidentAnalyticsRow): {
  familyKey: string;
  label: string;
} {
  const metadata = asMetadataRecord(row.metadataJson);
  switch (reportSource(row.source)) {
    case "startup_readiness": {
      const issueId =
        typeof metadata.issueId === "string" && metadata.issueId.trim()
          ? metadata.issueId
          : row.sourceKey;
      return {
        familyKey: `startup:${issueId}`,
        label: `Startup readiness - ${issueId}`,
      };
    }
    case "critical_cron": {
      const slug =
        typeof metadata.slug === "string" && metadata.slug.trim() ? metadata.slug : row.sourceKey;
      return {
        familyKey: `critical_cron:${slug}`,
        label: `Critical cron - ${slug}`,
      };
    }
    case "webhook_recovery": {
      const provider =
        typeof metadata.latestProvider === "string" && metadata.latestProvider.trim()
          ? metadata.latestProvider
          : "global";
      return {
        familyKey: `webhook_recovery:${provider}`,
        label: `Webhook recovery - ${provider}`,
      };
    }
  }
}

function compareRepeatOffenders(
  a: ProductionIncidentRepeatOffender,
  b: ProductionIncidentRepeatOffender,
) {
  if (a.cycleCount !== b.cycleCount) return b.cycleCount - a.cycleCount;
  if (a.openCount !== b.openCount) return b.openCount - a.openCount;
  if (a.criticalCount !== b.criticalCount) return b.criticalCount - a.criticalCount;
  return Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
}

async function loadIncidentAnalyticsRows(now: Date): Promise<IncidentAnalyticsRow[]> {
  const since = new Date(now.getTime() - REPORT_WINDOW_DAYS * MS_PER_DAY);
  return prisma.productionIncident.findMany({
    where: {
      OR: [
        { workflowStatus: { not: "RESOLVED" } },
        { resolvedAt: { gte: since } },
        { acknowledgedAt: { gte: since } },
      ],
    },
    orderBy: { firstSeenAt: "desc" },
    select: {
      id: true,
      title: true,
      severity: true,
      workflowStatus: true,
      reviewStatus: true,
      rootCauseCategory: true,
      remediationControlStatus: true,
      remediationSnoozedUntil: true,
      remediationControlSummary: true,
      source: true,
      sourceKey: true,
      href: true,
      ownerLabel: true,
      assignedToId: true,
      remediationOwnerId: true,
      remediationDueAt: true,
      firstSeenAt: true,
      lastSeenAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
      metadataJson: true,
      assignedTo: {
        select: {
          fullName: true,
          email: true,
        },
      },
      remediationOwner: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });
}

async function loadRepeatOffenders(now: Date): Promise<ProductionIncidentRepeatOffender[]> {
  const since = new Date(now.getTime() - REPEAT_OFFENDER_WINDOW_DAYS * MS_PER_DAY);
  const [rows, reopenEvents] = await Promise.all([
    prisma.productionIncident.findMany({
      where: {
        OR: [
          { workflowStatus: { not: "RESOLVED" } },
          { createdAt: { gte: since } },
          { lastSeenAt: { gte: since } },
          { resolvedAt: { gte: since } },
        ],
      },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        title: true,
        severity: true,
        workflowStatus: true,
        reviewStatus: true,
        rootCauseCategory: true,
        remediationControlStatus: true,
        remediationSnoozedUntil: true,
        remediationControlSummary: true,
        source: true,
        sourceKey: true,
        href: true,
        ownerLabel: true,
        assignedToId: true,
        remediationOwnerId: true,
        remediationDueAt: true,
        firstSeenAt: true,
        lastSeenAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
        metadataJson: true,
        assignedTo: {
          select: {
            fullName: true,
            email: true,
          },
        },
        remediationOwner: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.productionIncidentEvent.findMany({
      where: {
        eventType: "REOPENED",
        createdAt: { gte: since },
      },
      select: {
        incidentId: true,
      },
    }),
  ]);

  const reopenCountByIncidentId = reopenEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.incidentId] = (acc[event.incidentId] ?? 0) + 1;
    return acc;
  }, {});

  const offenders = new Map<
    string,
    ProductionIncidentRepeatOffender & { sourceKeys: Set<string> }
  >();

  for (const row of rows) {
    const { familyKey, label } = deriveRepeatOffenderFamily(row);
    const existing = offenders.get(familyKey);
    const lastSeenAtIso = row.lastSeenAt.toISOString();
    if (!existing) {
      offenders.set(familyKey, {
        familyKey,
        label,
        source: reportSource(row.source),
        latestSourceKey: row.sourceKey,
        uniqueSourceKeys: 1,
        incidentCount: 1,
        reopenCount: reopenCountByIncidentId[row.id] ?? 0,
        cycleCount: 1 + (reopenCountByIncidentId[row.id] ?? 0),
        openCount: reportWorkflowStatus(row.workflowStatus) === "RESOLVED" ? 0 : 1,
        criticalCount: reportSeverity(row.severity) === "critical" ? 1 : 0,
        pendingReviewCount: reportReviewStatus(row.reviewStatus) === "COMPLETED" ? 0 : 1,
        lastSeenAt: lastSeenAtIso,
        href: row.href,
        sourceKeys: new Set([row.sourceKey]),
      });
      continue;
    }

    existing.incidentCount += 1;
    existing.reopenCount += reopenCountByIncidentId[row.id] ?? 0;
    existing.cycleCount += 1 + (reopenCountByIncidentId[row.id] ?? 0);
    existing.openCount += reportWorkflowStatus(row.workflowStatus) === "RESOLVED" ? 0 : 1;
    existing.criticalCount += reportSeverity(row.severity) === "critical" ? 1 : 0;
    existing.pendingReviewCount += reportReviewStatus(row.reviewStatus) === "COMPLETED" ? 0 : 1;
    existing.sourceKeys.add(row.sourceKey);
    if (Date.parse(lastSeenAtIso) > Date.parse(existing.lastSeenAt)) {
      existing.lastSeenAt = lastSeenAtIso;
      existing.latestSourceKey = row.sourceKey;
      existing.href = row.href;
    }
  }

  return Array.from(offenders.values())
    .map((offender) => ({
      familyKey: offender.familyKey,
      label: offender.label,
      source: offender.source,
      latestSourceKey: offender.latestSourceKey,
      uniqueSourceKeys: offender.sourceKeys.size,
      incidentCount: offender.incidentCount,
      reopenCount: offender.reopenCount,
      cycleCount: offender.cycleCount,
      openCount: offender.openCount,
      criticalCount: offender.criticalCount,
      pendingReviewCount: offender.pendingReviewCount,
      lastSeenAt: offender.lastSeenAt,
      href: offender.href,
    }))
    .filter((offender) => offender.cycleCount >= 2)
    .sort(compareRepeatOffenders)
    .slice(0, 8);
}

export async function loadProductionIncidentExecutiveReport(
  now = new Date(),
): Promise<ProductionIncidentExecutiveReport> {
  const [rows, repeatOffenders] = await Promise.all([
    loadIncidentAnalyticsRows(now),
    loadRepeatOffenders(now),
  ]);
  const remediationTaskByIncidentId =
    await loadActiveProductionIncidentRemediationTaskSnapshots(rows.map((row) => row.id));
  const openRows = rows.filter((row) => reportWorkflowStatus(row.workflowStatus) !== "RESOLVED");
  const remediationRows = rows.filter(
    (row) => reportReviewStatus(row.reviewStatus) === "IN_REMEDIATION",
  );
  const attention = openRows.map((row) => buildAttentionItem(row, now)).sort(compareAttention);
  const allRemediationAttention = rows
    .map((row) => buildRemediationAttentionItem(row, now, remediationTaskByIncidentId[row.id]))
    .filter((item): item is ProductionIncidentRemediationAttentionItem => Boolean(item))
    .sort(compareRemediationAttention);
  const remediationAttention = allRemediationAttention.slice(0, 8);
  const rootCauseTrends = buildRootCauseTrends(rows, now).slice(0, 8);
  const since = new Date(now.getTime() - REPORT_WINDOW_DAYS * MS_PER_DAY);

  const mttaSamples = rows
    .filter((row) => row.acknowledgedAt && row.acknowledgedAt.getTime() >= since.getTime())
    .map((row) => row.acknowledgedAt!.getTime() - row.firstSeenAt.getTime());
  const mttrSamples = rows
    .filter((row) => row.resolvedAt && row.resolvedAt.getTime() >= since.getTime())
    .map((row) => row.resolvedAt!.getTime() - row.firstSeenAt.getTime());

  return {
    summary: {
      open: openRows.length,
      critical: openRows.filter((row) => reportSeverity(row.severity) === "critical").length,
      high: openRows.filter((row) => reportSeverity(row.severity) === "high").length,
      unassigned: attention.filter((item) => item.unassigned).length,
      awaitingAcknowledgement: openRows.filter(
        (row) => reportWorkflowStatus(row.workflowStatus) === "OPEN",
      ).length,
      ackOverdue: attention.filter((item) => item.ackOverdue).length,
      resolutionOverdue: attention.filter((item) => item.resolutionOverdue).length,
      agedOver24h: attention.filter((item) => item.ageMs >= MS_PER_DAY).length,
      agedOver72h: attention.filter((item) => item.ageMs >= 3 * MS_PER_DAY).length,
      resolvedLast30d: rows.filter(
        (row) => row.resolvedAt && row.resolvedAt.getTime() >= since.getTime(),
      ).length,
      pendingReview: rows.filter((row) => reportReviewStatus(row.reviewStatus) === "PENDING").length,
      inRemediation: rows.filter(
        (row) => reportReviewStatus(row.reviewStatus) === "IN_REMEDIATION",
      ).length,
      completedReview: rows.filter(
        (row) => reportReviewStatus(row.reviewStatus) === "COMPLETED",
      ).length,
      remediationOverdue: allRemediationAttention.filter((item) => item.remediationOverdue).length,
      remediationDueNext7d: allRemediationAttention.filter((item) => item.dueWithin7d).length,
      remediationTracking: remediationRows.filter(
        (row) => reportRemediationControlStatus(row.remediationControlStatus) === "TRACKING",
      ).length,
      remediationOwnerEngaged: remediationRows.filter(
        (row) =>
          reportRemediationControlStatus(row.remediationControlStatus) === "OWNER_ENGAGED",
      ).length,
      remediationSnoozed: remediationRows.filter(
        (row) => reportRemediationControlStatus(row.remediationControlStatus) === "SNOOZED",
      ).length,
      remediationReassignmentRequested: remediationRows.filter(
        (row) =>
          reportRemediationControlStatus(row.remediationControlStatus) ===
          "REASSIGNMENT_REQUESTED",
      ).length,
      remediationTaskBacked: remediationRows.filter(
        (row) => Boolean(remediationTaskByIncidentId[row.id]),
      ).length,
      remediationTaskMissing: remediationRows.filter((row) => {
        const expectedTaskKind = expectedRemediationTaskKindForIncident(
          {
            reviewStatus: row.reviewStatus,
            remediationControlStatus: row.remediationControlStatus,
            remediationSnoozedUntil: row.remediationSnoozedUntil,
            remediationDueAt: row.remediationDueAt,
            remediationOwnerId: row.remediationOwnerId,
          },
          now,
        );
        return Boolean(expectedTaskKind && !remediationTaskByIncidentId[row.id]);
      }).length,
      remediationReassignmentTasks: remediationRows.filter(
        (row) => remediationTaskByIncidentId[row.id]?.taskKind === "reassignment",
      ).length,
      remediationOwnerFollowUpTasks: remediationRows.filter(
        (row) => remediationTaskByIncidentId[row.id]?.taskKind === "owner_follow_up",
      ).length,
      mttaMs: average(mttaSamples),
      mttrMs: average(mttrSamples),
    },
    bySource: {
      startup_readiness: openRows.filter((row) => reportSource(row.source) === "startup_readiness")
        .length,
      critical_cron: openRows.filter((row) => reportSource(row.source) === "critical_cron").length,
      webhook_recovery: openRows.filter((row) => reportSource(row.source) === "webhook_recovery")
        .length,
    },
    byWorkflow: {
      OPEN: openRows.filter((row) => reportWorkflowStatus(row.workflowStatus) === "OPEN").length,
      ACKNOWLEDGED: openRows.filter(
        (row) => reportWorkflowStatus(row.workflowStatus) === "ACKNOWLEDGED",
      ).length,
      MONITORING: openRows.filter(
        (row) => reportWorkflowStatus(row.workflowStatus) === "MONITORING",
      ).length,
    },
    byReview: {
      PENDING: rows.filter((row) => reportReviewStatus(row.reviewStatus) === "PENDING").length,
      IN_REMEDIATION: rows.filter(
        (row) => reportReviewStatus(row.reviewStatus) === "IN_REMEDIATION",
      ).length,
      COMPLETED: rows.filter((row) => reportReviewStatus(row.reviewStatus) === "COMPLETED").length,
    },
    byRemediationControl: {
      TRACKING: remediationRows.filter(
        (row) => reportRemediationControlStatus(row.remediationControlStatus) === "TRACKING",
      ).length,
      OWNER_ENGAGED: remediationRows.filter(
        (row) =>
          reportRemediationControlStatus(row.remediationControlStatus) === "OWNER_ENGAGED",
      ).length,
      SNOOZED: remediationRows.filter(
        (row) => reportRemediationControlStatus(row.remediationControlStatus) === "SNOOZED",
      ).length,
      REASSIGNMENT_REQUESTED: remediationRows.filter(
        (row) =>
          reportRemediationControlStatus(row.remediationControlStatus) ===
          "REASSIGNMENT_REQUESTED",
      ).length,
    },
    attention,
    remediationAttention,
    rootCauseTrends,
    repeatOffenders,
  };
}

export async function loadProductionIncidentExecutiveSnapshot(
  now = new Date(),
): Promise<ProductionIncidentExecutiveSnapshot> {
  const rollup = await loadProductionIncidentRollup();
  const report = await loadProductionIncidentExecutiveReport(now);
  return { rollup, report };
}
