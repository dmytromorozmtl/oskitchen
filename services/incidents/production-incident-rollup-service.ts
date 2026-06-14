import type { ActivityTimelineItem } from "@/lib/activity/activity-types";
import type { IncidentSeverity, IncidentStatus } from "@/lib/developer/incident-severity";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  collectProductionReadinessIssues,
  shouldFatalOnNodeStartup,
  type ProductionReadinessIssue,
} from "@/lib/startup/production-readiness";
import type { PlatformRole } from "@prisma/client";
import {
  loadProductionCronExecutionAudit,
  type CronExecutionAuditRow,
} from "@/services/cron/cron-execution-evidence";
import { buildCriticalCronIncidentSourceKey } from "@/services/incidents/production-incident-source-keys";
import {
  countOpenWebhookJobRecoveries,
  listOpenWebhookJobRecoveries,
} from "@/services/webhooks/webhook-error-recovery-service";
import {
  expectedRemediationTaskKindForIncident,
  loadActiveProductionIncidentRemediationTaskSnapshots,
  syncProductionIncidentRemediationTasksForIncident,
  type ProductionIncidentRemediationTaskKind,
} from "@/services/incidents/production-incident-remediation-task-service";

export type ProductionIncidentSource = "startup_readiness" | "critical_cron" | "webhook_recovery";
export type ProductionIncidentWorkflowStatus = "OPEN" | "ACKNOWLEDGED" | "MONITORING" | "RESOLVED";
export type ProductionIncidentReviewStatus = "PENDING" | "IN_REMEDIATION" | "COMPLETED";
export type ProductionIncidentRemediationControlStatus =
  | "TRACKING"
  | "OWNER_ENGAGED"
  | "SNOOZED"
  | "REASSIGNMENT_REQUESTED";
export type ProductionIncidentRootCauseCategory =
  | "configuration"
  | "code_regression"
  | "dependency"
  | "capacity"
  | "data_integrity"
  | "operator_error"
  | "third_party"
  | "unknown";
type ProductionIncidentEventType =
  | "DISCOVERED"
  | "REOPENED"
  | "ACKNOWLEDGED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "REVIEW_UPDATED"
  | "REMEDIATION_CONTROL_UPDATED"
  | "REMEDIATION_REMINDER_SENT"
  | "REMEDIATION_ESCALATED"
  | "RESOLVED"
  | "AUTO_RESOLVED";

type LiveProductionIncident = {
  source: ProductionIncidentSource;
  sourceKey: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  href: string;
  ownerLabel: string;
  detectedAt: Date | null;
  badges: string[];
  initialWorkflowStatus: ProductionIncidentWorkflowStatus;
  initialAssignedToId: string | null;
  initialAcknowledgedAt: Date | null;
  initialAcknowledgedByUserId: string | null;
  metadataJson: Record<string, string | number | boolean | null>;
};

type IncidentRow = Awaited<ReturnType<typeof loadPersistedOpenIncidents>>[number];

export type ProductionIncidentAssigneeOption = {
  userId: string;
  fullName: string;
  email: string;
  roles: PlatformRole[];
};

export type ProductionIncidentItem = {
  id: string;
  sourceKey: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  workflowStatus: ProductionIncidentWorkflowStatus;
  source: ProductionIncidentSource;
  ownerLabel: string;
  href: string;
  detectedAt: string | null;
  lastSeenAt: string;
  badges: string[];
  assignedToId: string | null;
  assignedToName: string | null;
  assignedToEmail: string | null;
  acknowledgedAt: string | null;
  acknowledgedByUserId: string | null;
  acknowledgedByName: string | null;
  resolvedAt: string | null;
  resolvedByName: string | null;
  resolutionSummary: string | null;
  reviewStatus: ProductionIncidentReviewStatus;
  rootCauseCategory: ProductionIncidentRootCauseCategory | null;
  remediationOwnerId: string | null;
  remediationOwnerName: string | null;
  remediationOwnerEmail: string | null;
  remediationDueAt: string | null;
  remediationOverdue: boolean;
  remediationControlStatus: ProductionIncidentRemediationControlStatus;
  remediationSnoozedUntil: string | null;
  remediationControlSummary: string | null;
  remediationControlUpdatedAt: string | null;
  remediationControlUpdatedByName: string | null;
  remediationTaskExpected: boolean;
  remediationTaskMissing: boolean;
  remediationTaskKind: ProductionIncidentRemediationTaskKind | null;
  remediationTaskId: string | null;
  remediationTaskTitle: string | null;
  remediationTaskStatus: string | null;
  remediationTaskPriority: string | null;
  remediationTaskDueAt: string | null;
  remediationTaskOwnerName: string | null;
  remediationTaskOwnerEmail: string | null;
  remediationTaskHref: string | null;
  reviewSummary: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  autoResolved: boolean;
};

export type ProductionIncidentLookup = {
  id: string;
  source: ProductionIncidentSource;
  sourceKey: string;
  workflowStatus: ProductionIncidentWorkflowStatus;
  assignedToId: string | null;
  metadataJson: Record<string, unknown> | null;
};

export type ProductionIncidentRollup = {
  summary: {
    open: number;
    critical: number;
    high: number;
    startupReadiness: number;
    criticalCron: number;
    webhookRecovery: number;
  };
  items: ProductionIncidentItem[];
  timeline: ActivityTimelineItem[];
};

export const PRODUCTION_INCIDENT_MANAGER_ROLES: PlatformRole[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUPPORT_ADMIN",
  "IMPLEMENTATION_ADMIN",
];

export const PRODUCTION_INCIDENT_REVIEW_STATUSES = [
  "PENDING",
  "IN_REMEDIATION",
  "COMPLETED",
] as const satisfies readonly ProductionIncidentReviewStatus[];

export const PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES = [
  "TRACKING",
  "OWNER_ENGAGED",
  "SNOOZED",
  "REASSIGNMENT_REQUESTED",
] as const satisfies readonly ProductionIncidentRemediationControlStatus[];

export const PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES = [
  "configuration",
  "code_regression",
  "dependency",
  "capacity",
  "data_integrity",
  "operator_error",
  "third_party",
  "unknown",
] as const satisfies readonly ProductionIncidentRootCauseCategory[];

const ROLE_PRIORITY: PlatformRole[] = [...PRODUCTION_INCIDENT_MANAGER_ROLES];

const SEVERITY_PRIORITY: Record<IncidentSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const WORKFLOW_PRIORITY: Record<ProductionIncidentWorkflowStatus, number> = {
  OPEN: 0,
  ACKNOWLEDGED: 1,
  MONITORING: 2,
  RESOLVED: 3,
};

function incidentStatusFromWorkflow(workflowStatus: ProductionIncidentWorkflowStatus): IncidentStatus {
  switch (workflowStatus) {
    case "ACKNOWLEDGED":
      return "identified";
    case "MONITORING":
      return "monitoring";
    case "RESOLVED":
      return "resolved";
    case "OPEN":
      return "investigating";
  }
}

function workflowStatusForCronRow(row: CronExecutionAuditRow): ProductionIncidentWorkflowStatus {
  if (
    row.autoEscalationEngagementState === "engaged" ||
    row.autoEscalationFollowUpKind === "rerouted"
  ) {
    return "MONITORING";
  }
  if (
    row.incidentState === "acknowledged" ||
    row.autoEscalationEngagementState === "awaiting_first_response"
  ) {
    return "ACKNOWLEDGED";
  }
  return "OPEN";
}

function buildStartupReadinessIncident(issue: ProductionReadinessIssue): LiveProductionIncident {
  const title =
    issue.id === "rate_limit"
      ? "Production startup readiness blocked by rate limiting"
      : "Production startup readiness blocked by webhook queue mode";
  return {
    source: "startup_readiness",
    sourceKey: `startup:${issue.id}`,
    title,
    summary: issue.message,
    severity: "critical",
    href: "/dashboard/system-health",
    ownerLabel: "Platform runtime",
    detectedAt: null,
    badges: shouldFatalOnNodeStartup() ? ["fatal-on-boot"] : ["startup-readiness"],
    initialWorkflowStatus: "OPEN",
    initialAssignedToId: null,
    initialAcknowledgedAt: null,
    initialAcknowledgedByUserId: null,
    metadataJson: {
      issueId: issue.id,
      fatalOnBoot: shouldFatalOnNodeStartup(),
    },
  };
}

function cronIncidentSeverity(row: CronExecutionAuditRow): IncidentSeverity {
  if (
    row.autoEscalationEngagementState === "missing_ticket" ||
    row.autoEscalationEngagementState === "unassigned" ||
    row.autoEscalationEngagementState === "first_response_overdue" ||
    row.incidentState === "open"
  ) {
    return "critical";
  }
  if (
    row.incidentState === "acknowledged" ||
    row.autoEscalationEngagementState === "awaiting_first_response" ||
    row.autoEscalationEngagementState === "engaged"
  ) {
    return "high";
  }
  return "medium";
}

function buildCriticalCronIncident(row: CronExecutionAuditRow): LiveProductionIncident {
  const ownerLabel =
    row.autoEscalationAssignedToName ??
    row.autoEscalationAssignedToEmail ??
    row.ownerLabel;
  const summaryParts = [
    `${row.status} critical cron incident.`,
    row.autoEscalationTicketRef
      ? `Support ticket ${row.autoEscalationTicketRef}.`
      : "No support ticket linked yet.",
    row.autoEscalationEngagementState !== "none"
      ? `Engagement: ${row.autoEscalationEngagementState.replace(/_/g, " ")}.`
      : null,
    row.autoEscalationFollowUpKind
      ? `Follow-up: ${row.autoEscalationFollowUpKind}.`
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    source: "critical_cron",
    sourceKey: buildCriticalCronIncidentSourceKey(row.slug, row.incidentMarker ?? null),
    title: `Critical cron incident: ${row.label}`,
    summary: summaryParts.join(" "),
    severity: cronIncidentSeverity(row),
    href: `/dashboard/system-health/cron-execution/${row.slug}`,
    ownerLabel,
    detectedAt: row.lastFailedAt ? new Date(row.lastFailedAt) : row.lastStartedAt ? new Date(row.lastStartedAt) : null,
    badges: [
      row.slug,
      row.autoEscalationTicketRef ?? "no-ticket",
      row.autoEscalationEngagementState.replace(/_/g, "-"),
    ],
    initialWorkflowStatus: workflowStatusForCronRow(row),
    initialAssignedToId: row.autoEscalationAssignedToId ?? null,
    initialAcknowledgedAt: row.incidentAcknowledgedAt ? new Date(row.incidentAcknowledgedAt) : null,
    initialAcknowledgedByUserId: row.incidentAcknowledgedByUserId ?? null,
    metadataJson: {
      slug: row.slug,
      incidentMarker: row.incidentMarker ?? null,
      supportTicketId: row.autoEscalationTicketId ?? null,
      supportTicketRef: row.autoEscalationTicketRef ?? null,
    },
  };
}

function webhookRecoverySeverity(
  count: number,
  rows: Awaited<ReturnType<typeof listOpenWebhookJobRecoveries>>,
): IncidentSeverity {
  const terminalFailures = rows.some(
    (row) => row.attempts != null && row.maxAttempts != null && row.attempts >= row.maxAttempts,
  );
  if (terminalFailures || count >= 10) return "critical";
  return "high";
}

function buildWebhookRecoveryIncident(params: {
  count: number;
  rows: Awaited<ReturnType<typeof listOpenWebhookJobRecoveries>>;
}): LiveProductionIncident | null {
  if (params.count === 0) return null;
  const latest = params.rows[0] ?? null;
  const title =
    params.count === 1
      ? "Webhook recovery blocker"
      : "Webhook recovery blockers";
  const summaryParts = [
    `${params.count} open webhook recovery item${params.count === 1 ? "" : "s"} awaiting operator attention.`,
    latest?.provider ? `Latest provider: ${latest.provider}.` : null,
    latest?.eventType ? `Event: ${latest.eventType}.` : null,
    latest?.attempts != null
      ? `Attempts: ${latest.attempts}${latest.maxAttempts != null ? `/${latest.maxAttempts}` : ""}.`
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    source: "webhook_recovery",
    sourceKey: "webhook-recovery:open",
    title,
    summary: summaryParts.join(" "),
    severity: webhookRecoverySeverity(params.count, params.rows),
    href: "/dashboard/sales-channels/webhooks",
    ownerLabel: "Open webhooks",
    detectedAt: latest?.updatedAt ?? null,
    badges: [`${params.count}-open`, latest?.provider?.toLowerCase() ?? "queue"],
    initialWorkflowStatus: "OPEN",
    initialAssignedToId: null,
    initialAcknowledgedAt: null,
    initialAcknowledgedByUserId: null,
    metadataJson: {
      openCount: params.count,
      latestRecoveryId: latest?.id ?? null,
      latestProvider: latest?.provider ?? null,
    },
  };
}

async function discoverLiveProductionIncidents(): Promise<LiveProductionIncident[]> {
  const readinessItems = collectProductionReadinessIssues().map(buildStartupReadinessIncident);
  const [cronAudit, webhookRecoveryCount, webhookRecoveries] = await Promise.all([
    loadProductionCronExecutionAudit(),
    countOpenWebhookJobRecoveries(),
    listOpenWebhookJobRecoveries(8),
  ]);

  const criticalCronItems = cronAudit.rows
    .filter((row) => row.critical && (row.status === "failing" || row.status === "stale"))
    .map(buildCriticalCronIncident);
  const webhookIncident = buildWebhookRecoveryIncident({
    count: webhookRecoveryCount,
    rows: webhookRecoveries,
  });

  return [...readinessItems, ...criticalCronItems, ...(webhookIncident ? [webhookIncident] : [])];
}

async function appendProductionIncidentEvent(params: {
  incidentId: string;
  eventType: ProductionIncidentEventType;
  summary: string;
  performedById?: string | null;
  metadataJson?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  await prisma.productionIncidentEvent.create({
    data: {
      incidentId: params.incidentId,
      eventType: params.eventType,
      summary: params.summary.slice(0, 500),
      performedById: params.performedById ?? null,
      metadataJson: params.metadataJson,
    },
  });
}

async function syncLiveProductionIncidents(
  liveIncidents: LiveProductionIncident[],
  now = new Date(),
): Promise<void> {
  const liveKeys = liveIncidents.map((incident) => incident.sourceKey);
  const existing = await prisma.productionIncident.findMany({
    where: {
      OR: [
        liveKeys.length > 0 ? { sourceKey: { in: liveKeys } } : undefined,
        { workflowStatus: { not: "RESOLVED" } },
      ].filter((value): value is Exclude<typeof value, undefined> => Boolean(value)),
    },
    select: {
      id: true,
      sourceKey: true,
      workflowStatus: true,
      assignedToId: true,
      acknowledgedAt: true,
      acknowledgedByUserId: true,
      resolutionSummary: true,
      resolvedAt: true,
      autoResolved: true,
    },
  });
  const existingByKey = new Map(existing.map((row) => [row.sourceKey, row]));

  for (const live of liveIncidents) {
    const row = existingByKey.get(live.sourceKey);
    if (!row) {
      const created = await prisma.productionIncident.create({
        data: {
          source: live.source,
          sourceKey: live.sourceKey,
          title: live.title,
          summary: live.summary,
          severity: live.severity,
          workflowStatus: live.initialWorkflowStatus,
          href: live.href,
          ownerLabel: live.ownerLabel,
          assignedToId: live.initialAssignedToId,
          acknowledgedAt: live.initialAcknowledgedAt,
          acknowledgedByUserId: live.initialAcknowledgedByUserId,
          sourceDetectedAt: live.detectedAt ?? now,
          firstSeenAt: live.detectedAt ?? now,
          lastSeenAt: now,
          metadataJson: {
            ...live.metadataJson,
            badges: live.badges,
          },
        },
      });
      await appendProductionIncidentEvent({
        incidentId: created.id,
        eventType: "DISCOVERED",
        summary: `Incident surfaced from ${live.source.replace(/_/g, " ")}.`,
      });
      continue;
    }

    const reopen = row.workflowStatus === "RESOLVED";
    const promoteFromSource =
      row.workflowStatus === "OPEN" &&
      (live.initialWorkflowStatus === "ACKNOWLEDGED" || live.initialWorkflowStatus === "MONITORING");

    await prisma.productionIncident.update({
      where: { id: row.id },
      data: {
        source: live.source,
        title: live.title,
        summary: live.summary,
        severity: live.severity,
        href: live.href,
        ownerLabel: live.ownerLabel,
        sourceDetectedAt: live.detectedAt ?? now,
        lastSeenAt: now,
        autoResolved: false,
        metadataJson: {
          ...live.metadataJson,
          badges: live.badges,
        },
        ...(row.assignedToId ? {} : { assignedToId: live.initialAssignedToId }),
        ...(reopen
          ? {
              workflowStatus: live.initialWorkflowStatus,
              resolvedAt: null,
              resolvedByUserId: null,
              resolutionSummary: null,
              reviewStatus: "PENDING",
              rootCauseCategory: null,
              remediationOwnerId: null,
              remediationDueAt: null,
              remediationControlStatus: "TRACKING",
              remediationSnoozedUntil: null,
              remediationControlSummary: null,
              remediationControlUpdatedAt: null,
              remediationControlUpdatedByUserId: null,
              reviewSummary: null,
              reviewedAt: null,
              reviewedByUserId: null,
              acknowledgedAt: live.initialAcknowledgedAt,
              acknowledgedByUserId: live.initialAcknowledgedByUserId,
            }
          : promoteFromSource
            ? {
                workflowStatus: live.initialWorkflowStatus,
                acknowledgedAt: row.acknowledgedAt ?? live.initialAcknowledgedAt ?? now,
                acknowledgedByUserId:
                  row.acknowledgedByUserId ?? live.initialAcknowledgedByUserId ?? null,
              }
            : {}),
      },
    });

    if (reopen) {
      await appendProductionIncidentEvent({
        incidentId: row.id,
        eventType: "REOPENED",
        summary: "Incident reopened because the live production signal is still active.",
      });
    }
  }

  const liveKeySet = new Set(liveKeys);
  const staleOpenIncidents = existing.filter(
    (row) => row.workflowStatus !== "RESOLVED" && !liveKeySet.has(row.sourceKey),
  );

  for (const row of staleOpenIncidents) {
    await prisma.productionIncident.update({
      where: { id: row.id },
      data: {
        workflowStatus: "RESOLVED",
        resolvedAt: row.resolvedAt ?? now,
        autoResolved: true,
        resolutionSummary:
          row.resolutionSummary ?? "Automatically resolved after the live source stopped surfacing it.",
      },
    });
    await appendProductionIncidentEvent({
      incidentId: row.id,
      eventType: "AUTO_RESOLVED",
      summary: "Incident auto-resolved after the live source cleared.",
    });
  }
}

async function loadPersistedOpenIncidents() {
  return prisma.productionIncident.findMany({
    where: { workflowStatus: { not: "RESOLVED" } },
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true } },
      acknowledgedBy: { select: { id: true, fullName: true, email: true } },
      resolvedBy: { select: { id: true, fullName: true, email: true } },
      remediationOwner: { select: { id: true, fullName: true, email: true } },
      reviewedBy: { select: { id: true, fullName: true, email: true } },
      remediationControlUpdatedBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
}

function mapIncidentRow(
  row: IncidentRow,
  remediationTask?: Awaited<
    ReturnType<typeof loadActiveProductionIncidentRemediationTaskSnapshots>
  >[string],
): ProductionIncidentItem {
  const metadata =
    row.metadataJson && typeof row.metadataJson === "object" && !Array.isArray(row.metadataJson)
      ? (row.metadataJson as Record<string, unknown>)
      : {};
  const badges = Array.isArray(metadata.badges)
    ? metadata.badges.filter((value): value is string => typeof value === "string")
    : [];
  const remediationControlStatus = isProductionIncidentRemediationControlStatus(
    row.remediationControlStatus,
  )
    ? row.remediationControlStatus
    : "TRACKING";
  const effectiveDueAt = effectiveRemediationDueAt({
    remediationDueAt: row.remediationDueAt,
    remediationControlStatus,
    remediationSnoozedUntil: row.remediationSnoozedUntil,
  });
  const remediationDueAtIso = effectiveDueAt?.toISOString() ?? null;
  const expectedTaskKind = expectedRemediationTaskKindForIncident(
    {
      reviewStatus: row.reviewStatus,
      remediationControlStatus,
      remediationSnoozedUntil: row.remediationSnoozedUntil,
      remediationDueAt: row.remediationDueAt,
      remediationOwnerId: row.remediationOwnerId,
    },
    new Date(),
  );
  return {
    id: row.id,
    sourceKey: row.sourceKey,
    title: row.title,
    summary: row.summary,
    severity: row.severity as IncidentSeverity,
    status: incidentStatusFromWorkflow(row.workflowStatus as ProductionIncidentWorkflowStatus),
    workflowStatus: row.workflowStatus as ProductionIncidentWorkflowStatus,
    source: row.source as ProductionIncidentSource,
    ownerLabel: row.ownerLabel,
    href: row.href,
    detectedAt: row.sourceDetectedAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt.toISOString(),
    badges,
    assignedToId: row.assignedToId ?? null,
    assignedToName: row.assignedTo?.fullName ?? null,
    assignedToEmail: row.assignedTo?.email ?? null,
    acknowledgedAt: row.acknowledgedAt?.toISOString() ?? null,
    acknowledgedByUserId: row.acknowledgedByUserId ?? null,
    acknowledgedByName: row.acknowledgedBy?.fullName ?? row.acknowledgedBy?.email ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByName: row.resolvedBy?.fullName ?? row.resolvedBy?.email ?? null,
    resolutionSummary: row.resolutionSummary ?? null,
    reviewStatus: row.reviewStatus as ProductionIncidentReviewStatus,
    rootCauseCategory: (row.rootCauseCategory as ProductionIncidentRootCauseCategory | null) ?? null,
    remediationOwnerId: row.remediationOwnerId ?? null,
    remediationOwnerName: row.remediationOwner?.fullName ?? null,
    remediationOwnerEmail: row.remediationOwner?.email ?? null,
    remediationDueAt: remediationDueAtIso,
    remediationOverdue:
      Boolean(
        remediationDueAtIso &&
          row.reviewStatus !== "COMPLETED" &&
          Date.now() > effectiveDueAt!.getTime(),
      ),
    remediationControlStatus,
    remediationSnoozedUntil: row.remediationSnoozedUntil?.toISOString() ?? null,
    remediationControlSummary: row.remediationControlSummary ?? null,
    remediationControlUpdatedAt: row.remediationControlUpdatedAt?.toISOString() ?? null,
    remediationControlUpdatedByName:
      row.remediationControlUpdatedBy?.fullName ??
      row.remediationControlUpdatedBy?.email ??
      null,
    remediationTaskExpected: Boolean(expectedTaskKind),
    remediationTaskMissing: Boolean(expectedTaskKind && !remediationTask),
    remediationTaskKind: remediationTask?.taskKind ?? expectedTaskKind ?? null,
    remediationTaskId: remediationTask?.taskId ?? null,
    remediationTaskTitle: remediationTask?.taskTitle ?? null,
    remediationTaskStatus: remediationTask?.taskStatus ?? null,
    remediationTaskPriority: remediationTask?.taskPriority ?? null,
    remediationTaskDueAt: remediationTask?.taskDueAt ?? null,
    remediationTaskOwnerName: remediationTask?.taskOwnerName ?? null,
    remediationTaskOwnerEmail: remediationTask?.taskOwnerEmail ?? null,
    remediationTaskHref: remediationTask?.taskHref ?? null,
    reviewSummary: row.reviewSummary ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedByName: row.reviewedBy?.fullName ?? row.reviewedBy?.email ?? null,
    autoResolved: row.autoResolved,
  };
}

function compareIncidents(a: ProductionIncidentItem, b: ProductionIncidentItem): number {
  const severityDelta = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
  if (severityDelta !== 0) return severityDelta;
  const workflowDelta = WORKFLOW_PRIORITY[a.workflowStatus] - WORKFLOW_PRIORITY[b.workflowStatus];
  if (workflowDelta !== 0) return workflowDelta;
  const aDetected = a.detectedAt ? Date.parse(a.detectedAt) : 0;
  const bDetected = b.detectedAt ? Date.parse(b.detectedAt) : 0;
  return bDetected - aDetected;
}

function eventTitle(eventType: string): string {
  switch (eventType) {
    case "DISCOVERED":
      return "Incident surfaced";
    case "REOPENED":
      return "Incident reopened";
    case "ACKNOWLEDGED":
      return "Incident acknowledged";
    case "STATUS_CHANGED":
      return "Workflow updated";
    case "ASSIGNED":
      return "Assignee updated";
    case "REVIEW_UPDATED":
      return "Review updated";
    case "REMEDIATION_CONTROL_UPDATED":
      return "Remediation control updated";
    case "REMEDIATION_REMINDER_SENT":
      return "Remediation reminder sent";
    case "REMEDIATION_ESCALATED":
      return "Remediation escalated";
    case "RESOLVED":
      return "Incident resolved";
    case "AUTO_RESOLVED":
      return "Incident auto-resolved";
    default:
      return "Incident event";
  }
}

export async function loadProductionIncidentTimelineItems(
  limit = 25,
): Promise<ActivityTimelineItem[]> {
  const rows = await prisma.productionIncidentEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      incident: {
        select: {
          title: true,
          severity: true,
          href: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: `${row.incident.title}: ${eventTitle(row.eventType)}`,
    subtitle: row.summary,
    createdAt: row.createdAt.toISOString(),
    severity: row.incident.severity.toUpperCase(),
    href: row.incident.href,
  }));
}

export async function listProductionIncidentAssignees(): Promise<ProductionIncidentAssigneeOption[]> {
  const rows = await prisma.platformUserRole.findMany({
    where: { role: { in: ROLE_PRIORITY } },
    orderBy: [{ createdAt: "asc" }],
    select: {
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  const byUser = new Map<string, ProductionIncidentAssigneeOption>();
  for (const row of rows) {
    const existing = byUser.get(row.user.id);
    if (!existing) {
      byUser.set(row.user.id, {
        userId: row.user.id,
        fullName: row.user.fullName,
        email: row.user.email,
        roles: [row.role],
      });
      continue;
    }
    if (!existing.roles.includes(row.role)) existing.roles.push(row.role);
  }

  return [...byUser.values()].sort((a, b) => {
    const aPriority = Math.min(...a.roles.map((role) => ROLE_PRIORITY.indexOf(role)));
    const bPriority = Math.min(...b.roles.map((role) => ROLE_PRIORITY.indexOf(role)));
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.email.localeCompare(b.email);
  });
}

function isProductionIncidentRemediationControlStatus(
  value: string,
): value is ProductionIncidentRemediationControlStatus {
  return PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES.includes(
    value as ProductionIncidentRemediationControlStatus,
  );
}

function effectiveRemediationDueAt(params: {
  remediationDueAt: Date | null;
  remediationControlStatus: ProductionIncidentRemediationControlStatus;
  remediationSnoozedUntil: Date | null;
}): Date | null {
  if (
    params.remediationControlStatus === "SNOOZED" &&
    params.remediationSnoozedUntil &&
    (!params.remediationDueAt ||
      params.remediationSnoozedUntil.getTime() > params.remediationDueAt.getTime())
  ) {
    return params.remediationSnoozedUntil;
  }
  return params.remediationDueAt;
}

function isProductionIncidentReviewStatus(
  value: string,
): value is ProductionIncidentReviewStatus {
  return PRODUCTION_INCIDENT_REVIEW_STATUSES.includes(
    value as ProductionIncidentReviewStatus,
  );
}

function isProductionIncidentRootCauseCategory(
  value: string,
): value is ProductionIncidentRootCauseCategory {
  return PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES.includes(
    value as ProductionIncidentRootCauseCategory,
  );
}

async function validateIncidentOwnerUserId(
  userId: string | null,
): Promise<boolean> {
  if (!userId) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: {
      userId,
      role: { in: ROLE_PRIORITY },
    },
    select: { id: true },
  });
  return Boolean(row);
}

async function syncRemediationTasksBestEffort(
  incidentId: string,
): Promise<void> {
  try {
    await syncProductionIncidentRemediationTasksForIncident(incidentId);
  } catch (error) {
    logger.warn("production_incident_remediation_task_sync_failed", {
      incidentId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

export async function updateProductionIncidentReview(params: {
  incidentId: string;
  actorUserId: string;
  reviewStatus: ProductionIncidentReviewStatus;
  rootCauseCategory: ProductionIncidentRootCauseCategory | null;
  remediationOwnerId: string | null;
  remediationDueAt: Date | null;
  reviewSummary: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const incident = await prisma.productionIncident.findUnique({
    where: { id: params.incidentId },
    select: {
      id: true,
      reviewStatus: true,
      rootCauseCategory: true,
      remediationOwnerId: true,
      remediationDueAt: true,
      remediationControlStatus: true,
      remediationSnoozedUntil: true,
      remediationControlSummary: true,
      remediationControlUpdatedAt: true,
      remediationControlUpdatedByUserId: true,
      reviewSummary: true,
    },
  });
  if (!incident) return { error: "Production incident not found." };

  if (!isProductionIncidentReviewStatus(params.reviewStatus)) {
    return { error: "Unknown production incident review status." };
  }

  if (
    params.rootCauseCategory &&
    !isProductionIncidentRootCauseCategory(params.rootCauseCategory)
  ) {
    return { error: "Unknown root cause category." };
  }

  const normalizedReviewStatus = params.reviewStatus;
  const normalizedRootCause =
    normalizedReviewStatus === "PENDING" ? null : params.rootCauseCategory;
  const normalizedRemediationOwnerId =
    normalizedReviewStatus === "PENDING" ? null : params.remediationOwnerId;
  const normalizedRemediationDueAt =
    normalizedReviewStatus === "PENDING" ? null : params.remediationDueAt;
  const trimmedSummary =
    normalizedReviewStatus === "PENDING" ? null : params.reviewSummary?.trim() ?? null;
  const preserveRemediationControls =
    incident.reviewStatus === "IN_REMEDIATION" &&
    normalizedReviewStatus === "IN_REMEDIATION";

  if (!(await validateIncidentOwnerUserId(normalizedRemediationOwnerId))) {
    return { error: "Selected remediation owner is not eligible for production incident follow-up." };
  }

  if (normalizedReviewStatus !== "PENDING" && !normalizedRootCause) {
    return { error: "Root cause category is required once incident review begins." };
  }
  if (normalizedRemediationDueAt && !normalizedRemediationOwnerId) {
    return { error: "Remediation owner is required when a remediation due date is set." };
  }
  if (
    normalizedReviewStatus === "IN_REMEDIATION" &&
    (!normalizedRemediationOwnerId || !normalizedRemediationDueAt)
  ) {
    return { error: "Remediation owner and due date are required while incident review is in remediation." };
  }
  if (normalizedReviewStatus === "COMPLETED" && !trimmedSummary) {
    return { error: "Review summary is required when completing incident review." };
  }

  const now = new Date();
  await prisma.productionIncident.update({
    where: { id: incident.id },
    data: {
      reviewStatus: normalizedReviewStatus,
      rootCauseCategory: normalizedRootCause,
      remediationOwnerId: normalizedRemediationOwnerId,
      remediationDueAt: normalizedRemediationDueAt,
      remediationControlStatus: preserveRemediationControls
        ? incident.remediationControlStatus
        : "TRACKING",
      remediationSnoozedUntil: preserveRemediationControls
        ? incident.remediationSnoozedUntil
        : null,
      remediationControlSummary: preserveRemediationControls
        ? incident.remediationControlSummary
        : null,
      remediationControlUpdatedAt: preserveRemediationControls
        ? incident.remediationControlUpdatedAt
        : null,
      remediationControlUpdatedByUserId: preserveRemediationControls
        ? incident.remediationControlUpdatedByUserId
        : null,
      reviewSummary: trimmedSummary,
      reviewedAt: normalizedReviewStatus === "PENDING" ? null : now,
      reviewedByUserId: normalizedReviewStatus === "PENDING" ? null : params.actorUserId,
    },
  });

  const changed =
    incident.reviewStatus !== normalizedReviewStatus ||
    incident.rootCauseCategory !== normalizedRootCause ||
    incident.remediationOwnerId !== normalizedRemediationOwnerId ||
    (incident.remediationDueAt?.getTime() ?? null) !==
      (normalizedRemediationDueAt?.getTime() ?? null) ||
    (incident.reviewSummary ?? null) !== trimmedSummary;

  if (changed) {
    await appendProductionIncidentEvent({
      incidentId: incident.id,
      eventType: "REVIEW_UPDATED",
      performedById: params.actorUserId,
      summary:
        normalizedReviewStatus === "PENDING"
          ? "Incident review reset to pending."
          : `Incident review updated to ${normalizedReviewStatus.toLowerCase()}.`,
      metadataJson: {
        reviewStatus: normalizedReviewStatus,
        rootCauseCategory: normalizedRootCause ?? null,
        remediationOwnerId: normalizedRemediationOwnerId ?? null,
        remediationDueAt: normalizedRemediationDueAt?.toISOString() ?? null,
      },
    });
  }

  await syncRemediationTasksBestEffort(incident.id);

  return { ok: true };
}

export async function updateProductionIncidentRemediationControl(params: {
  incidentId: string;
  actorUserId: string;
  remediationControlStatus: ProductionIncidentRemediationControlStatus;
  remediationSnoozedUntil: Date | null;
  remediationControlSummary: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const incident = await prisma.productionIncident.findUnique({
    where: { id: params.incidentId },
    select: {
      id: true,
      reviewStatus: true,
      remediationControlStatus: true,
      remediationSnoozedUntil: true,
      remediationControlSummary: true,
    },
  });
  if (!incident) return { error: "Production incident not found." };

  if (!isProductionIncidentRemediationControlStatus(params.remediationControlStatus)) {
    return { error: "Unknown remediation control status." };
  }

  if (incident.reviewStatus !== "IN_REMEDIATION") {
    return {
      error:
        "Remediation controls can only be updated while the incident review is in remediation.",
    };
  }

  const trimmedSummary = params.remediationControlSummary?.trim() ?? null;
  const normalizedStatus = params.remediationControlStatus;
  const normalizedSnoozedUntil =
    normalizedStatus === "SNOOZED" ? params.remediationSnoozedUntil : null;
  const normalizedSummary =
    normalizedStatus === "TRACKING" ? null : trimmedSummary;

  if (normalizedStatus === "SNOOZED" && !normalizedSnoozedUntil) {
    return { error: "Snooze-until date is required when remediation is snoozed." };
  }
  if (normalizedStatus === "SNOOZED" && !normalizedSummary) {
    return { error: "Accepted-delay reason is required when remediation is snoozed." };
  }
  if (normalizedStatus === "REASSIGNMENT_REQUESTED" && !normalizedSummary) {
    return { error: "Reassignment request reason is required." };
  }

  const now = new Date();
  await prisma.productionIncident.update({
    where: { id: incident.id },
    data: {
      remediationControlStatus: normalizedStatus,
      remediationSnoozedUntil: normalizedSnoozedUntil,
      remediationControlSummary: normalizedSummary,
      remediationControlUpdatedAt: now,
      remediationControlUpdatedByUserId: params.actorUserId,
    },
  });

  const changed =
    incident.remediationControlStatus !== normalizedStatus ||
    (incident.remediationSnoozedUntil?.getTime() ?? null) !==
      (normalizedSnoozedUntil?.getTime() ?? null) ||
    (incident.remediationControlSummary ?? null) !== normalizedSummary;

  if (changed) {
    await appendProductionIncidentEvent({
      incidentId: incident.id,
      eventType: "REMEDIATION_CONTROL_UPDATED",
      performedById: params.actorUserId,
      summary: `Remediation control updated to ${normalizedStatus.toLowerCase()}.`,
      metadataJson: {
        remediationControlStatus: normalizedStatus,
        remediationSnoozedUntil: normalizedSnoozedUntil?.toISOString() ?? null,
      },
    });
  }

  await syncRemediationTasksBestEffort(incident.id);

  return { ok: true };
}

export async function updateProductionIncidentWorkflow(params: {
  incidentId: string;
  actorUserId: string;
  workflowStatus: ProductionIncidentWorkflowStatus;
  assignedToId: string | null;
  resolutionSummary: string | null;
}): Promise<{ ok: true; incident: ProductionIncidentLookup } | { error: string }> {
  const incident = await prisma.productionIncident.findUnique({
    where: { id: params.incidentId },
    select: {
      id: true,
      href: true,
      source: true,
      sourceKey: true,
      metadataJson: true,
      workflowStatus: true,
      assignedToId: true,
      acknowledgedAt: true,
    },
  });
  if (!incident) return { error: "Production incident not found." };

  if (params.workflowStatus === "RESOLVED" && !params.resolutionSummary?.trim()) {
    return { error: "Resolution summary is required when resolving an incident." };
  }

  if (!(await validateIncidentOwnerUserId(params.assignedToId))) {
    return { error: "Selected assignee is not eligible for production incident ownership." };
  }

  const now = new Date();
  const isReopen = incident.workflowStatus !== "OPEN" && params.workflowStatus === "OPEN";
  await prisma.productionIncident.update({
    where: { id: incident.id },
    data: {
      workflowStatus: params.workflowStatus,
      assignedToId: params.assignedToId,
      autoResolved: false,
      reviewStatus: isReopen ? "PENDING" : undefined,
      rootCauseCategory: isReopen ? null : undefined,
      remediationOwnerId: isReopen ? null : undefined,
      remediationDueAt: isReopen ? null : undefined,
      remediationControlStatus: isReopen ? "TRACKING" : undefined,
      remediationSnoozedUntil: isReopen ? null : undefined,
      remediationControlSummary: isReopen ? null : undefined,
      remediationControlUpdatedAt: isReopen ? null : undefined,
      remediationControlUpdatedByUserId: isReopen ? null : undefined,
      reviewSummary: isReopen ? null : undefined,
      reviewedAt: isReopen ? null : undefined,
      reviewedByUserId: isReopen ? null : undefined,
      acknowledgedAt:
        params.workflowStatus === "OPEN"
          ? null
          : incident.acknowledgedAt ?? now,
      acknowledgedByUserId:
        params.workflowStatus === "OPEN"
          ? null
          : params.actorUserId,
      resolvedAt: params.workflowStatus === "RESOLVED" ? now : null,
      resolvedByUserId: params.workflowStatus === "RESOLVED" ? params.actorUserId : null,
      resolutionSummary:
        params.workflowStatus === "RESOLVED" ? params.resolutionSummary?.trim() ?? null : null,
    },
  });

  if (incident.assignedToId !== params.assignedToId) {
    await appendProductionIncidentEvent({
      incidentId: incident.id,
      eventType: "ASSIGNED",
      performedById: params.actorUserId,
      summary: params.assignedToId ? "Incident assignee updated." : "Incident assignee cleared.",
      metadataJson: { assignedToId: params.assignedToId ?? null },
    });
  }

  if (incident.workflowStatus !== params.workflowStatus) {
    await appendProductionIncidentEvent({
      incidentId: incident.id,
      eventType: params.workflowStatus === "RESOLVED" ? "RESOLVED" : params.workflowStatus === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "STATUS_CHANGED",
      performedById: params.actorUserId,
      summary:
        params.workflowStatus === "RESOLVED"
          ? `Incident resolved. ${params.resolutionSummary?.trim() ?? ""}`.trim()
          : `Workflow status changed to ${params.workflowStatus.toLowerCase()}.`,
      metadataJson: { workflowStatus: params.workflowStatus },
    });
  }

  await syncRemediationTasksBestEffort(incident.id);

  return {
    ok: true,
    incident: {
      id: incident.id,
      source: incident.source as ProductionIncidentSource,
      sourceKey: incident.sourceKey,
      workflowStatus: params.workflowStatus,
      assignedToId: params.assignedToId,
      metadataJson:
        incident.metadataJson && typeof incident.metadataJson === "object" && !Array.isArray(incident.metadataJson)
          ? (incident.metadataJson as Record<string, unknown>)
          : null,
    },
  };
}

export async function loadProductionIncidentBySourceKey(
  sourceKey: string,
): Promise<ProductionIncidentLookup | null> {
  const incident = await prisma.productionIncident.findFirst({
    where: {
      sourceKey,
      workflowStatus: { not: "RESOLVED" },
    },
    select: {
      id: true,
      source: true,
      sourceKey: true,
      workflowStatus: true,
      assignedToId: true,
      metadataJson: true,
    },
  });
  if (!incident) return null;
  return {
    id: incident.id,
    source: incident.source as ProductionIncidentSource,
    sourceKey: incident.sourceKey,
    workflowStatus: incident.workflowStatus as ProductionIncidentWorkflowStatus,
    assignedToId: incident.assignedToId ?? null,
    metadataJson:
      incident.metadataJson && typeof incident.metadataJson === "object" && !Array.isArray(incident.metadataJson)
        ? (incident.metadataJson as Record<string, unknown>)
        : null,
  };
}

export async function loadProductionIncidentRollup(_viewerUserId?: string): Promise<ProductionIncidentRollup> {
  const liveIncidents = await discoverLiveProductionIncidents();
  await syncLiveProductionIncidents(liveIncidents);

  const [rows, timeline] = await Promise.all([
    loadPersistedOpenIncidents(),
    loadProductionIncidentTimelineItems(25),
  ]);
  const remediationTaskByIncidentId =
    await loadActiveProductionIncidentRemediationTaskSnapshots(rows.map((row) => row.id));
  const items = rows
    .map((row) => mapIncidentRow(row, remediationTaskByIncidentId[row.id]))
    .sort(compareIncidents);

  return {
    summary: {
      open: items.length,
      critical: items.filter((item) => item.severity === "critical").length,
      high: items.filter((item) => item.severity === "high").length,
      startupReadiness: items.filter((item) => item.source === "startup_readiness").length,
      criticalCron: items.filter((item) => item.source === "critical_cron").length,
      webhookRecovery: items.filter((item) => item.source === "webhook_recovery").length,
    },
    items,
    timeline,
  };
}
