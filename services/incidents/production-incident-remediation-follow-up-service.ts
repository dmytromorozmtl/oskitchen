import { SITE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  PRODUCTION_INCIDENT_MANAGER_ROLES,
  type ProductionIncidentRemediationControlStatus,
  type ProductionIncidentReviewStatus,
  type ProductionIncidentRootCauseCategory,
  type ProductionIncidentSource,
} from "@/services/incidents/production-incident-rollup-service";
import { fireInternalAlert } from "@/services/notifications/alert-service";
import { emitOpsSignal } from "@/services/observability/ops-signals";

const PRE_DUE_WINDOW_MS = 24 * 60 * 60 * 1000;
const OVERDUE_ESCALATION_THRESHOLD_MS = 72 * 60 * 60 * 1000;
const INCIDENT_HUB_URL = `${SITE_URL}/platform/incidents`;

type FollowUpRecipient = {
  userId: string;
  email: string;
  fullName: string;
};

type IncidentPerson = {
  id: string;
  email: string;
  fullName: string;
};

type FollowUpIncidentRow = {
  id: string;
  title: string;
  source: string;
  href: string;
  workflowStatus: string;
  reviewStatus: string;
  rootCauseCategory: string | null;
  remediationControlStatus: string;
  remediationSnoozedUntil: Date | null;
  remediationControlSummary: string | null;
  remediationDueAt: Date | null;
  remediationOwnerId: string | null;
  assignedToId: string | null;
  remediationOwner: IncidentPerson | null;
  assignedTo: IncidentPerson | null;
};

type FollowUpPhase =
  | "due_soon"
  | "overdue"
  | "escalated"
  | "reassignment_requested";

export type ProductionIncidentRemediationFollowUpResult = {
  scanned: number;
  dueSoonCandidates: number;
  overdueCandidates: number;
  ownerAlertsLogged: number;
  ownerAlertsDelivered: number;
  escalationAlertsLogged: number;
  escalationAlertsDelivered: number;
  skippedMissingOwner: number;
  skippedMissingEscalationRecipient: number;
};

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

function reportRootCauseCategory(
  value: string | null,
): ProductionIncidentRootCauseCategory | null {
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

function isoDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatRootCause(
  category: ProductionIncidentRootCauseCategory | null,
): string | null {
  return category ? category.replace(/_/g, " ") : null;
}

function phaseSourceId(params: {
  incidentId: string;
  phase: FollowUpPhase;
  now: Date;
  remediationDueAt: Date;
}): string {
  if (params.phase === "due_soon") {
    return `${params.incidentId}:due_soon:${isoDay(params.remediationDueAt)}`;
  }
  return `${params.incidentId}:${params.phase}:${isoDay(params.now)}`;
}

function phaseTriggerType(phase: FollowUpPhase): string {
  switch (phase) {
    case "due_soon":
      return "INCIDENT_REMEDIATION_DUE_SOON";
    case "overdue":
      return "INCIDENT_REMEDIATION_OVERDUE";
    case "escalated":
      return "INCIDENT_REMEDIATION_ESCALATED";
    case "reassignment_requested":
      return "INCIDENT_REMEDIATION_REASSIGNMENT_REQUESTED";
  }
}

function effectiveRemediationDueAt(incident: FollowUpIncidentRow): Date | null {
  const remediationDueAt = incident.remediationDueAt;
  const remediationControlStatus = reportRemediationControlStatus(
    incident.remediationControlStatus,
  );
  if (
    remediationControlStatus === "SNOOZED" &&
    incident.remediationSnoozedUntil &&
    (!remediationDueAt ||
      incident.remediationSnoozedUntil.getTime() > remediationDueAt.getTime())
  ) {
    return incident.remediationSnoozedUntil;
  }
  return remediationDueAt;
}

function buildReason(params: {
  incident: FollowUpIncidentRow;
  phase: FollowUpPhase;
  now: Date;
}): string {
  const dueOn = params.incident.remediationDueAt
    ? isoDay(effectiveRemediationDueAt(params.incident) ?? params.incident.remediationDueAt)
    : "unknown";
  const rootCause = formatRootCause(
    reportRootCauseCategory(params.incident.rootCauseCategory),
  );
  const remediationControlStatus = reportRemediationControlStatus(
    params.incident.remediationControlStatus,
  );
  const controlNote = params.incident.remediationControlSummary?.trim() ?? null;
  const rootCauseSuffix = rootCause ? ` Root cause: ${rootCause}.` : "";
  const noteSuffix = controlNote ? ` Context: ${controlNote}.` : "";
  if (params.phase === "due_soon") {
    return `Remediation for "${params.incident.title}" is due on ${dueOn}.${rootCauseSuffix}${noteSuffix}`;
  }
  if (params.phase === "overdue") {
    return `Remediation for "${params.incident.title}" is overdue since ${dueOn}.${rootCauseSuffix}${noteSuffix}`;
  }
  if (params.phase === "reassignment_requested") {
    return `Remediation for "${params.incident.title}" needs reassignment.${rootCauseSuffix}${noteSuffix}`;
  }
  const overdueMs = Math.max(
    0,
    params.now.getTime() -
      ((effectiveRemediationDueAt(params.incident) ?? params.incident.remediationDueAt)?.getTime() ??
        params.now.getTime()),
  );
  const overdueDays = Math.max(1, Math.floor(overdueMs / (24 * 60 * 60 * 1000)));
  return `Remediation for "${params.incident.title}" is ${overdueDays}d overdue and needs platform follow-up.${rootCauseSuffix}${noteSuffix}`;
}

async function loadRemediationCandidates(): Promise<FollowUpIncidentRow[]> {
  return prisma.productionIncident.findMany({
    where: {
      reviewStatus: "IN_REMEDIATION",
      remediationDueAt: { not: null },
    },
    orderBy: { remediationDueAt: "asc" },
    select: {
      id: true,
      title: true,
      source: true,
      href: true,
      workflowStatus: true,
      reviewStatus: true,
      rootCauseCategory: true,
      remediationControlStatus: true,
      remediationSnoozedUntil: true,
      remediationControlSummary: true,
      remediationDueAt: true,
      remediationOwnerId: true,
      assignedToId: true,
      remediationOwner: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
  });
}

async function loadEscalationFallbackRecipients(): Promise<FollowUpRecipient[]> {
  const rows = await prisma.platformUserRole.findMany({
    where: {
      role: { in: ["SUPER_ADMIN", "PLATFORM_ADMIN"] },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      userId: true,
      role: true,
      user: {
        select: {
          email: true,
          fullName: true,
        },
      },
    },
  });

  const seen = new Set<string>();
  const recipients: FollowUpRecipient[] = [];
  for (const row of rows) {
    if (
      seen.has(row.userId) ||
      !PRODUCTION_INCIDENT_MANAGER_ROLES.includes(row.role)
    ) {
      continue;
    }
    seen.add(row.userId);
    recipients.push({
      userId: row.userId,
      email: row.user.email,
      fullName: row.user.fullName,
    });
  }
  return recipients;
}

function escalationRecipientsForIncident(
  incident: FollowUpIncidentRow,
  fallbackRecipients: FollowUpRecipient[],
): FollowUpRecipient[] {
  const recipients = new Map<string, FollowUpRecipient>();
  if (
    incident.assignedTo &&
    incident.assignedTo.id !== incident.remediationOwnerId
  ) {
    recipients.set(incident.assignedTo.id, {
      userId: incident.assignedTo.id,
      email: incident.assignedTo.email,
      fullName: incident.assignedTo.fullName,
    });
  }

  if (recipients.size > 0) {
    return [...recipients.values()];
  }

  for (const recipient of fallbackRecipients) {
    if (recipient.userId === incident.remediationOwnerId) continue;
    recipients.set(recipient.userId, recipient);
  }
  return [...recipients.values()];
}

async function appendAutomationEventIfNeeded(params: {
  incidentId: string;
  eventType: "REMEDIATION_REMINDER_SENT" | "REMEDIATION_ESCALATED";
  summary: string;
  metadataJson: Record<string, string | number | boolean | null>;
  now: Date;
}): Promise<void> {
  const startOfDay = new Date(
    Date.UTC(
      params.now.getUTCFullYear(),
      params.now.getUTCMonth(),
      params.now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const existing = await prisma.productionIncidentEvent.findFirst({
    where: {
      incidentId: params.incidentId,
      eventType: params.eventType,
      summary: params.summary,
      createdAt: { gte: startOfDay },
    },
    select: { id: true },
  });
  if (existing) return;

  await prisma.productionIncidentEvent.create({
    data: {
      incidentId: params.incidentId,
      eventType: params.eventType,
      summary: params.summary,
      performedById: null,
      metadataJson: params.metadataJson,
      createdAt: params.now,
    },
  });
}

async function sendFollowUpAlert(params: {
  incident: FollowUpIncidentRow;
  recipient: FollowUpRecipient;
  phase: FollowUpPhase;
  now: Date;
}): Promise<{ delivered: boolean; logged: boolean }> {
  const remediationDueAt = params.incident.remediationDueAt;
  const effectiveDueAt = effectiveRemediationDueAt(params.incident) ?? remediationDueAt;
  if (!effectiveDueAt) return { delivered: false, logged: false };

  const source = reportSource(params.incident.source);
  const reason = buildReason({
    incident: params.incident,
    phase: params.phase,
    now: params.now,
  });
  const sourceId = phaseSourceId({
    incidentId: params.incident.id,
    phase: params.phase,
    now: params.now,
    remediationDueAt: effectiveDueAt,
  });

  emitOpsSignal("incident_remediation_follow_up", {
    incidentId: params.incident.id,
    source,
    phase: params.phase,
    reviewStatus: reportReviewStatus(params.incident.reviewStatus),
    remediationControlStatus: reportRemediationControlStatus(
      params.incident.remediationControlStatus,
    ),
    recipientEmail: params.recipient.email,
    dueOn: isoDay(effectiveDueAt),
  });

  const result = await fireInternalAlert({
    userId: params.recipient.userId,
    templateKey: "internal_incident_remediation",
    triggerType: phaseTriggerType(params.phase),
    sourceType: "PRODUCTION_INCIDENT_REMEDIATION",
    sourceId,
    reason,
    link: INCIDENT_HUB_URL,
    recipientEmail: params.recipient.email,
    recipientUserId: params.recipient.userId,
    category: "INTERNAL_ALERT",
  });

  if (result.logId) {
    await appendAutomationEventIfNeeded({
      incidentId: params.incident.id,
      eventType:
        params.phase === "escalated" || params.phase === "reassignment_requested"
          ? "REMEDIATION_ESCALATED"
          : "REMEDIATION_REMINDER_SENT",
      summary:
        params.phase === "escalated"
          ? `Remediation escalated to ${params.recipient.email}.`
          : params.phase === "reassignment_requested"
            ? `Remediation reassignment requested from ${params.recipient.email}.`
          : `Remediation reminder sent to ${params.recipient.email}.`,
      metadataJson: {
        phase: params.phase,
        recipientEmail: params.recipient.email,
        notificationStatus: result.status,
        logId: result.logId,
        remediationControlStatus: reportRemediationControlStatus(
          params.incident.remediationControlStatus,
        ),
      },
      now: params.now,
    });
  }

  if (!result.ok) {
    logger.warn("incident_remediation_alert_not_delivered", {
      incidentId: params.incident.id,
      recipientEmail: params.recipient.email,
      phase: params.phase,
      status: result.status,
      reason: result.reason ?? null,
    });
  }

  return {
    delivered: result.ok,
    logged: Boolean(result.logId),
  };
}

export async function runProductionIncidentRemediationFollowUp(
  now = new Date(),
): Promise<ProductionIncidentRemediationFollowUpResult> {
  const [incidents, fallbackRecipients] = await Promise.all([
    loadRemediationCandidates(),
    loadEscalationFallbackRecipients(),
  ]);

  const result: ProductionIncidentRemediationFollowUpResult = {
    scanned: incidents.length,
    dueSoonCandidates: 0,
    overdueCandidates: 0,
    ownerAlertsLogged: 0,
    ownerAlertsDelivered: 0,
    escalationAlertsLogged: 0,
    escalationAlertsDelivered: 0,
    skippedMissingOwner: 0,
    skippedMissingEscalationRecipient: 0,
  };

  for (const incident of incidents) {
    const dueAt = effectiveRemediationDueAt(incident);
    if (!dueAt) continue;
    const remediationControlStatus = reportRemediationControlStatus(
      incident.remediationControlStatus,
    );
    const reassignmentRequested =
      remediationControlStatus === "REASSIGNMENT_REQUESTED";

    const untilDueMs = dueAt.getTime() - now.getTime();
    const isDueSoon = untilDueMs > 0 && untilDueMs <= PRE_DUE_WINDOW_MS;
    const isOverdue = untilDueMs <= 0;

    if (isDueSoon) result.dueSoonCandidates += 1;
    if (isOverdue) result.overdueCandidates += 1;

    const shouldRemindOwner =
      !reassignmentRequested &&
      (isOverdue ||
        (isDueSoon && remediationControlStatus !== "OWNER_ENGAGED"));

    if (shouldRemindOwner) {
      if (!incident.remediationOwner) {
        result.skippedMissingOwner += 1;
      } else {
        const ownerPhase: FollowUpPhase = isOverdue ? "overdue" : "due_soon";
        const ownerAlert = await sendFollowUpAlert({
          incident,
          recipient: {
            userId: incident.remediationOwner.id,
            email: incident.remediationOwner.email,
            fullName: incident.remediationOwner.fullName,
          },
          phase: ownerPhase,
          now,
        });
        result.ownerAlertsLogged += Number(ownerAlert.logged);
        result.ownerAlertsDelivered += Number(ownerAlert.delivered);
      }
    }

    const overdueMs = Math.max(0, now.getTime() - dueAt.getTime());
    const shouldEscalate =
      reassignmentRequested || overdueMs >= OVERDUE_ESCALATION_THRESHOLD_MS;
    if (!shouldEscalate) {
      continue;
    }

    const escalationRecipients = escalationRecipientsForIncident(
      incident,
      fallbackRecipients,
    );
    if (escalationRecipients.length === 0) {
      emitOpsSignal("incident_remediation_follow_up", {
        incidentId: incident.id,
        source: reportSource(incident.source),
        phase: reassignmentRequested ? "reassignment_requested" : "escalated",
        recipientEmail: null,
        dueOn: isoDay(dueAt),
      });
      result.skippedMissingEscalationRecipient += 1;
      continue;
    }

    for (const recipient of escalationRecipients) {
      const escalationAlert = await sendFollowUpAlert({
        incident,
        recipient,
        phase: reassignmentRequested ? "reassignment_requested" : "escalated",
        now,
      });
      result.escalationAlertsLogged += Number(escalationAlert.logged);
      result.escalationAlertsDelivered += Number(escalationAlert.delivered);
    }
  }

  return result;
}
