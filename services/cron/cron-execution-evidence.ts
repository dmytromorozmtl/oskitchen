import type { ActivityTimelineItem } from "@/lib/activity/activity-types";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS,
  PRODUCTION_CRON_SCHEDULES,
  isAllowedProductionCronSlug,
  type ProductionCronSlug,
} from "@/services/cron/production-manifest";
import { getProductionCronOpsMetadata } from "@/services/cron/cron-ops-catalog";
import { pageCronEscalationEvent } from "@/services/cron/cron-escalation-paging";
import { resolveCronEscalationAssignment } from "@/services/cron/cron-escalation-routing";
import { PLATFORM_OPEN_TICKET_STATUSES } from "@/services/platform/platform-service";
import {
  computeSupportTicketFirstResponseDueAt,
  deriveSupportEscalationEngagementState,
  type SupportEscalationEngagementState,
} from "@/services/support/support-engagement-service";
import { escalateSupportTicketNotify } from "@/services/support/escalation-service";
import { createSupportTicket } from "@/services/support/ticket-service";

const MIN_CRON_EVIDENCE_GRACE_MS = 15 * 60 * 1000;
const CRITICAL_CRON_AUTO_ESCALATION_FAILURE_THRESHOLD = 3;
const CRITICAL_CRON_AUTO_ESCALATION_MIN_OUTAGE_MS = 60 * 60 * 1000;
const CRITICAL_CRON_EVIDENCE_SET = new Set<string>(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS);

export type CronExecutionEvidenceStatus =
  | "healthy"
  | "pending_initial_run"
  | "failing"
  | "stale";

export type CronExecutionIncidentState = "none" | "open" | "acknowledged" | "resolved";
export type CronAutoEscalationReason = "repeated_failures" | "prolonged_outage";
export type CronAutoEscalationFollowUpKind = "rerouted" | "reminded";
export type CronExecutionEventType =
  | "SUCCEEDED"
  | "FAILED"
  | "RESOLVED"
  | "ACKNOWLEDGED"
  | "REOPENED"
  | "AUTO_ESCALATED"
  | "AUTO_ESCALATION_CLEARED"
  | "AUTO_ESCALATION_REROUTED"
  | "AUTO_ESCALATION_REMINDED";

export type CronExecutionEvidenceDetail = {
  slug: ProductionCronSlug;
  schedule: string;
  windowMs: number;
  status: CronExecutionEvidenceStatus;
  lastStartedAt: string | null;
  lastSucceededAt: string | null;
  lastFailedAt: string | null;
  lastDurationMs: number | null;
  lastStatusCode: number | null;
  consecutiveFailures: number;
};

export type CronExecutionAuditRow = CronExecutionEvidenceDetail & {
  critical: boolean;
  label: string;
  summary: string;
  ownerHref: string;
  ownerLabel: string;
  responseHint: string;
  lastError: string | null;
  incidentState: CronExecutionIncidentState;
  incidentMarker: string | null;
  incidentAcknowledgedAt: string | null;
  incidentAcknowledgedByUserId: string | null;
  incidentAcknowledgedByName: string | null;
  autoEscalatedAt: string | null;
  autoEscalatedForMarker: string | null;
  autoEscalationReason: CronAutoEscalationReason | null;
  autoEscalationTicketId: string | null;
  autoEscalationTicketRef: string | null;
  autoEscalationEngagementState: SupportEscalationEngagementState;
  autoEscalationAssignedToId: string | null;
  autoEscalationAssignedToName: string | null;
  autoEscalationAssignedToEmail: string | null;
  autoEscalationTicketStatus: string | null;
  autoEscalationFirstResponseAt: string | null;
  autoEscalationFirstResponseDueAt: string | null;
  autoEscalationFollowUpAt: string | null;
  autoEscalationFollowUpKind: CronAutoEscalationFollowUpKind | null;
};

type CronExecutionEvidenceRow = {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  lastStartedAt: Date | null;
  lastSucceededAt: Date | null;
  lastFailedAt: Date | null;
  lastDurationMs: number | null;
  lastStatusCode: number | null;
  consecutiveFailures: number;
  lastError?: string | null;
  incidentAcknowledgedAt?: Date | null;
  incidentAcknowledgedForMarker?: string | null;
  incidentAcknowledgedByUserId?: string | null;
  incidentAcknowledger?: { id: string; fullName: string; email: string } | null;
  autoEscalatedAt?: Date | null;
  autoEscalatedForMarker?: string | null;
  autoEscalationReason?: string | null;
  autoEscalationTicketId?: string | null;
  autoEscalationTicketRef?: string | null;
  autoEscalationFollowUpAt?: Date | null;
  autoEscalationFollowUpForMarker?: string | null;
  autoEscalationFollowUpKind?: string | null;
};

type CronExecutionHeartbeatModel = {
  findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  createMany: (args: unknown) => Promise<unknown>;
  upsert: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
};

type CronExecutionEventRow = {
  id: string;
  slug: string;
  eventType: CronExecutionEventType;
  productionTier: boolean;
  statusCode: number | null;
  durationMs: number | null;
  errorMessage: string | null;
  incidentMarker: string | null;
  actorUserId: string | null;
  createdAt: Date;
  actorUserProfile?: { id: string; fullName: string; email: string } | null;
};

type CronExecutionEventModel = {
  create: (args: unknown) => Promise<unknown>;
  findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
};

type AutoEscalationSupportTicketRow = {
  id: string;
  subject: string;
  email: string;
  status: import("@prisma/client").SupportTicketStatus;
  assignedToId: string | null;
  firstResponseAt: Date | null;
  createdAt: Date;
  workspaceId: string | null;
  priority: import("@prisma/client").SupportTicketPriority;
  category: import("@prisma/client").SupportTicketCategory;
  assignedTo?: { id: string; fullName: string; email: string } | null;
};

function cronExecutionHeartbeatModel(): CronExecutionHeartbeatModel {
  return (prisma as unknown as { cronExecutionHeartbeat: CronExecutionHeartbeatModel })
    .cronExecutionHeartbeat;
}

function cronExecutionEventModel(): CronExecutionEventModel {
  return (prisma as unknown as { cronExecutionEvent: CronExecutionEventModel }).cronExecutionEvent;
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function cronIncidentMarkerForRow(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): string | null {
  const detail = buildCronExecutionEvidenceDetail(slug, row, now);
  if (detail.status !== "failing" && detail.status !== "stale") return null;
  if (row?.lastFailedAt) return `failed:${row.lastFailedAt.toISOString()}`;
  if (row?.lastSucceededAt) return `stale:${row.lastSucceededAt.toISOString()}`;
  const createdAt = row?.createdAt ?? now;
  return `stale:${createdAt.toISOString()}`;
}

function cronIncidentStateForRow(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): CronExecutionIncidentState {
  const detail = buildCronExecutionEvidenceDetail(slug, row, now);
  const marker = cronIncidentMarkerForRow(slug, row, now);
  if (marker) {
    return row?.incidentAcknowledgedAt && row.incidentAcknowledgedForMarker === marker
      ? "acknowledged"
      : "open";
  }
  if (row?.lastFailedAt && row?.lastSucceededAt && row.lastSucceededAt.getTime() >= row.lastFailedAt.getTime()) {
    return "resolved";
  }
  return "none";
}

function incidentStartedAtForRow(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): Date | null {
  const detail = buildCronExecutionEvidenceDetail(slug, row, now);
  if (detail.status === "failing") {
    return row?.lastFailedAt ?? row?.createdAt ?? now;
  }
  if (detail.status === "stale") {
    return row?.lastSucceededAt ?? row?.createdAt ?? now;
  }
  return null;
}

function autoEscalationThresholdMs(detail: CronExecutionEvidenceDetail): number {
  return Math.max(CRITICAL_CRON_AUTO_ESCALATION_MIN_OUTAGE_MS, detail.windowMs * 2);
}

function autoEscalationReasonLabel(reason: CronAutoEscalationReason): string {
  switch (reason) {
    case "repeated_failures":
      return `Repeated failures (${CRITICAL_CRON_AUTO_ESCALATION_FAILURE_THRESHOLD}+ consecutive cycles)`;
    case "prolonged_outage":
      return "Prolonged outage without recovery";
  }
}

function autoEscalationAssignmentLabel(resolution: string): string {
  switch (resolution) {
    case "team_email_override":
      return "team owner override";
    case "default_email_override":
      return "default owner override";
    case "role_fallback":
      return "role fallback";
    default:
      return "unassigned fallback";
  }
}

function cronAutoEscalationReasonForRow(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): CronAutoEscalationReason | null {
  if (!CRITICAL_CRON_EVIDENCE_SET.has(slug)) return null;
  const detail = buildCronExecutionEvidenceDetail(slug, row, now);
  if (detail.status !== "failing" && detail.status !== "stale") return null;
  if (
    detail.status === "failing" &&
    detail.consecutiveFailures >= CRITICAL_CRON_AUTO_ESCALATION_FAILURE_THRESHOLD
  ) {
    return "repeated_failures";
  }
  const incidentStartedAt = incidentStartedAtForRow(slug, row, now);
  if (!incidentStartedAt) return null;
  const incidentAgeMs = Math.max(0, now.getTime() - incidentStartedAt.getTime());
  return incidentAgeMs >= autoEscalationThresholdMs(detail) ? "prolonged_outage" : null;
}

function isAutoEscalationActiveForMarker(
  row: CronExecutionEvidenceRow | undefined,
  marker: string | null,
): boolean {
  return Boolean(
    marker &&
      row?.autoEscalatedAt &&
      row.autoEscalatedForMarker === marker &&
      row.autoEscalationTicketId,
  );
}

function hasAutoEscalationFollowUpForMarker(
  row: CronExecutionEvidenceRow | undefined,
  marker: string | null,
): boolean {
  return Boolean(
    marker &&
      row?.autoEscalationFollowUpAt &&
      row.autoEscalationFollowUpForMarker === marker &&
      (row.autoEscalationFollowUpKind === "rerouted" || row.autoEscalationFollowUpKind === "reminded"),
  );
}

type LoadedAutoEscalationSupportState = {
  supportTicketById: Map<string, AutoEscalationSupportTicketRow>;
  firstResponseDueAtByTicketId: Map<string, Date | null>;
};

async function loadBaseCronExecutionHeartbeatRows(
  slugs: readonly ProductionCronSlug[],
): Promise<CronExecutionEvidenceRow[]> {
  return (await cronExecutionHeartbeatModel().findMany({
    where: { slug: { in: [...slugs] } },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
      lastStartedAt: true,
      lastSucceededAt: true,
      lastFailedAt: true,
      lastDurationMs: true,
      lastStatusCode: true,
      consecutiveFailures: true,
      lastError: true,
    },
  })) as CronExecutionEvidenceRow[];
}

async function loadAutoEscalationSupportState(
  ticketIds: readonly string[],
): Promise<LoadedAutoEscalationSupportState> {
  if (ticketIds.length === 0) {
    return {
      supportTicketById: new Map(),
      firstResponseDueAtByTicketId: new Map(),
    };
  }

  const supportTickets = (await prisma.supportTicket.findMany({
    where: { id: { in: [...ticketIds] } },
    select: {
      id: true,
      subject: true,
      email: true,
      status: true,
      assignedToId: true,
      firstResponseAt: true,
      createdAt: true,
      workspaceId: true,
      priority: true,
      category: true,
      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  })) as AutoEscalationSupportTicketRow[];
  const supportTicketById = new Map(supportTickets.map((ticket) => [ticket.id, ticket]));
  const firstResponseDueAtEntries = await Promise.all(
    supportTickets.map(async (ticket) => {
      if (!PLATFORM_OPEN_TICKET_STATUSES.includes(ticket.status)) {
        return [ticket.id, null] as const;
      }
      return [
        ticket.id,
        await computeSupportTicketFirstResponseDueAt({
          createdAt: ticket.createdAt,
          workspaceId: ticket.workspaceId,
          priority: ticket.priority,
          category: ticket.category,
        }),
      ] as const;
    }),
  );

  return {
    supportTicketById,
    firstResponseDueAtByTicketId: new Map(firstResponseDueAtEntries),
  };
}

async function appendCronExecutionEvent(params: {
  slug: ProductionCronSlug;
  eventType: CronExecutionEventType;
  productionTier: boolean;
  statusCode?: number | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  incidentMarker?: string | null;
  actorUserId?: string | null;
  createdAt?: Date;
}): Promise<void> {
  try {
    await cronExecutionEventModel().create({
      data: {
        slug: params.slug,
        eventType: params.eventType,
        productionTier: params.productionTier,
        statusCode: params.statusCode ?? null,
        durationMs: params.durationMs ?? null,
        errorMessage: params.errorMessage?.slice(0, 1000) ?? null,
        incidentMarker: params.incidentMarker ?? null,
        actorUserId: params.actorUserId ?? null,
        createdAt: params.createdAt ?? new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logger.error("cron_execution_event_write_failed", {
      slug: params.slug,
      eventType: params.eventType,
      message,
    });
  }
}

function buildCronExecutionEvidenceDetail(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): CronExecutionEvidenceDetail {
  const windowMs = cronEvidenceWindowMsForSlug(slug);
  const schedule = PRODUCTION_CRON_SCHEDULES[slug];
  const lastSucceededAt = row?.lastSucceededAt ?? null;
  const lastFailedAt = row?.lastFailedAt ?? null;
  const lastStartedAt = row?.lastStartedAt ?? null;
  const failureIsCurrent =
    !!lastFailedAt && (!lastSucceededAt || lastFailedAt.getTime() >= lastSucceededAt.getTime()) &&
    (row?.consecutiveFailures ?? 0) > 0;

  let status: CronExecutionEvidenceStatus;
  if (failureIsCurrent) {
    status = "failing";
  } else if (lastSucceededAt) {
    status = now.getTime() - lastSucceededAt.getTime() > windowMs ? "stale" : "healthy";
  } else {
    const createdAt = row?.createdAt ?? now;
    status = now.getTime() - createdAt.getTime() > windowMs ? "stale" : "pending_initial_run";
  }

  return {
    slug,
    schedule,
    windowMs,
    status,
    lastStartedAt: toIso(lastStartedAt),
    lastSucceededAt: toIso(lastSucceededAt),
    lastFailedAt: toIso(lastFailedAt),
    lastDurationMs: row?.lastDurationMs ?? null,
    lastStatusCode: row?.lastStatusCode ?? null,
    consecutiveFailures: row?.consecutiveFailures ?? 0,
  };
}

export function cronScheduleIntervalMs(schedule: string): number | null {
  const everyMinutes = schedule.match(/^\*\/(\d+)\s+\*\s+\*\s+\*\s+\*$/);
  if (everyMinutes) return Number(everyMinutes[1]) * 60_000;

  const everyHours = schedule.match(/^\d+\s+\*\/(\d+)\s+\*\s+\*\s+\*$/);
  if (everyHours) return Number(everyHours[1]) * 60 * 60_000;

  const daily = schedule.match(/^\d+\s+\d+\s+\*\s+\*\s+\*$/);
  if (daily) return 24 * 60 * 60_000;

  const weekly = schedule.match(/^\d+\s+\d+\s+\*\s+\*\s+\d+$/);
  if (weekly) return 7 * 24 * 60 * 60_000;

  return null;
}

export function cronEvidenceWindowMsForSlug(slug: ProductionCronSlug): number {
  const intervalMs = cronScheduleIntervalMs(PRODUCTION_CRON_SCHEDULES[slug]);
  if (!intervalMs) return 6 * 60 * 60_000;
  return intervalMs + Math.max(MIN_CRON_EVIDENCE_GRACE_MS, Math.floor(intervalMs / 2));
}

export function summarizeCriticalCronExecutionEvidence(
  rows: CronExecutionEvidenceRow[],
  now = new Date(),
): {
  ok: boolean;
  tracked: CronExecutionEvidenceDetail[];
  productionFailure: string | null;
} {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const tracked = CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS.map((slug) =>
    buildCronExecutionEvidenceDetail(slug, bySlug.get(slug), now),
  );

  const bad = tracked.filter((row) => row.status === "failing" || row.status === "stale");
  return {
    ok: bad.length === 0,
    tracked,
    productionFailure:
      bad.length === 0
        ? null
        : `Critical production cron execution evidence is stale or failing: ${bad.map((row) => `${row.slug}:${row.status}`).join(", ")}`,
  };
}

async function ensureCronEvidenceSeedRows(slugs: readonly ProductionCronSlug[]): Promise<void> {
  const existing = await cronExecutionHeartbeatModel().findMany({
    where: { slug: { in: [...slugs] } },
    select: { slug: true },
  });
  const existingSet = new Set(
    existing
      .map((row) => (typeof row.slug === "string" ? row.slug : null))
      .filter((slug): slug is string => slug !== null),
  );
  const missing = slugs.filter((slug) => !existingSet.has(slug));
  if (missing.length === 0) return;

  await cronExecutionHeartbeatModel().createMany({
    data: missing.map((slug) => ({
      slug,
      productionTier: true,
    })),
    skipDuplicates: true,
  });
}

async function autoEscalateTrackedCronIfNeeded(
  slug: ProductionCronSlug,
  row: CronExecutionEvidenceRow | undefined,
  now: Date,
): Promise<void> {
  const marker = cronIncidentMarkerForRow(slug, row, now);
  const reason = cronAutoEscalationReasonForRow(slug, row, now);
  if (!marker || !reason || isAutoEscalationActiveForMarker(row, marker)) {
    return;
  }
  try {
    const meta = getProductionCronOpsMetadata(slug);
    const assignment = await resolveCronEscalationAssignment(slug);
    const detail = buildCronExecutionEvidenceDetail(slug, row, now);
    const incidentStartedAt = incidentStartedAtForRow(slug, row, now);
    const incidentAgeMinutes = incidentStartedAt
      ? Math.max(1, Math.round((now.getTime() - incidentStartedAt.getTime()) / 60_000))
      : null;
    const reasonLabel = autoEscalationReasonLabel(reason);
    const assignmentSummary = assignment.assignee
      ? `${assignment.assignee.fullName} <${assignment.assignee.email}> via ${autoEscalationAssignmentLabel(assignment.resolution)}`
      : `No assignee resolved (${autoEscalationAssignmentLabel(assignment.resolution)})`;
    const messageLines = [
      `${meta.label} (${slug}) auto-escalated from cron execution evidence.`,
      ``,
      `Reason: ${reasonLabel}`,
      `Status: ${detail.status}`,
      `Schedule: ${detail.schedule}`,
      `Evidence window: ${Math.round(detail.windowMs / 60_000)}m`,
      `Consecutive failures: ${detail.consecutiveFailures}`,
      `Last success: ${detail.lastSucceededAt ?? "never"}`,
      `Last failure: ${detail.lastFailedAt ?? "none"}`,
      `Incident marker: ${marker}`,
      incidentAgeMinutes != null ? `Outage age: ${incidentAgeMinutes}m` : null,
      `Routing team: ${meta.ownerTeam}`,
      `Routing result: ${assignmentSummary}`,
      assignment.attemptedOverrideEmail ? `Attempted owner override: ${assignment.attemptedOverrideEmail}` : null,
      `Owner module: ${meta.ownerLabel} (${meta.ownerHref})`,
      `Recovery hint: ${meta.responseHint}`,
    ].filter((value): value is string => Boolean(value));

    const { ticket, ticketRef } = await createSupportTicket({
      userId: null,
      email: "platform-ops@system.kitchenos.local",
      requesterName: "OS Kitchen Cron Guard",
      subject: `Critical cron auto-escalated: ${meta.label}`,
      message: messageLines.join("\n"),
      category: "PRODUCTION",
      priority: "CRITICAL",
      severity: "CRITICAL",
      source: "API",
      moduleKey: "cron-execution",
      relatedEntityType: "CRON_EXECUTION_INCIDENT",
      relatedEntityId: `${slug}:${marker}`,
      assignedToId: assignment.assignee?.userId ?? null,
      initialStatus: "ESCALATED",
      skipRequesterConfirmation: true,
      skipInboundNotification: true,
    });

    await prisma.supportTicketEvent.create({
      data: {
        ticketId: ticket.id,
        eventType: "ESCALATED",
        performedById: null,
        metadataJson: {
          source: "cron_auto_escalation",
          slug,
          incidentMarker: marker,
          reason,
          routingTeam: meta.ownerTeam,
          routingResolution: assignment.resolution,
          assignedToId: assignment.assignee?.userId ?? null,
          assignedToEmail: assignment.assignee?.email ?? null,
        },
      },
    });

    await cronExecutionHeartbeatModel().update({
      where: { slug },
      data: {
        autoEscalatedAt: now,
        autoEscalatedForMarker: marker,
        autoEscalationReason: reason,
        autoEscalationTicketId: ticket.id,
        autoEscalationTicketRef: ticketRef,
      },
    });

    await appendCronExecutionEvent({
      slug,
      eventType: "AUTO_ESCALATED",
      productionTier: true,
      incidentMarker: marker,
      errorMessage: assignment.assignee
        ? `${reasonLabel}. Support ticket ${ticketRef} assigned to ${assignment.assignee.email}.`
        : `${reasonLabel}. Support ticket ${ticketRef} created without an assignee.`,
      createdAt: now,
    });

    void escalateSupportTicketNotify({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        email: ticket.email,
        category: ticket.category,
        priority: ticket.priority,
      },
      reasons: [reasonLabel, `${slug}:${detail.status}`],
    });
    await pageCronEscalationEvent({
      slug,
      incidentMarker: marker,
      phase: "auto_escalated",
      ticketId: ticket.id,
      ticketRef,
      ticketSubject: ticket.subject,
      recipient: assignment.assignee
        ? {
            userId: assignment.assignee.userId,
            email: assignment.assignee.email,
            fullName: assignment.assignee.fullName,
          }
        : null,
      reason: `${reasonLabel}; ${slug}:${detail.status}`,
    });
  } catch (error) {
    logger.error("cron_auto_escalation_failed", {
      slug,
      marker,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

async function recordAutoEscalationFollowUp(params: {
  slug: ProductionCronSlug;
  marker: string;
  kind: CronAutoEscalationFollowUpKind;
  now: Date;
}): Promise<void> {
  await cronExecutionHeartbeatModel().update({
    where: { slug: params.slug },
    data: {
      autoEscalationFollowUpAt: params.now,
      autoEscalationFollowUpForMarker: params.marker,
      autoEscalationFollowUpKind: params.kind,
    },
  });
}

async function applyCriticalCronAutoEscalationFollowUp(params: {
  slug: ProductionCronSlug;
  row: CronExecutionEvidenceRow;
  marker: string;
  supportTicket: AutoEscalationSupportTicketRow | null;
  firstResponseDueAt: Date | null;
  now: Date;
}): Promise<void> {
  if (hasAutoEscalationFollowUpForMarker(params.row, params.marker)) {
    return;
  }

  const engagementState = deriveSupportEscalationEngagementState({
    ticket: params.supportTicket,
    firstResponseDueAt: params.firstResponseDueAt,
    now: params.now,
  });
  if (
    engagementState !== "unassigned" &&
    engagementState !== "first_response_overdue"
  ) {
    return;
  }
  if (!params.supportTicket) {
    return;
  }

  const reasons = [`${params.slug}:${engagementState}`];
  try {
    const alternateAssignment = await resolveCronEscalationAssignment(params.slug, {
      excludeUserIds: params.supportTicket.assignedToId ? [params.supportTicket.assignedToId] : [],
    });

    if (alternateAssignment.assignee) {
      await prisma.supportTicket.update({
        where: { id: params.supportTicket.id },
        data: {
          assignedToId: alternateAssignment.assignee.userId,
        },
      });
      await prisma.supportTicketEvent.create({
        data: {
          ticketId: params.supportTicket.id,
          eventType: "ASSIGNED",
          performedById: null,
          metadataJson: {
            source: "cron_auto_escalation_follow_up",
            reason: engagementState,
            previousAssigneeId: params.supportTicket.assignedToId,
            assigneeId: alternateAssignment.assignee.userId,
            assigneeEmail: alternateAssignment.assignee.email,
            incidentMarker: params.marker,
          },
        },
      });
      await recordAutoEscalationFollowUp({
        slug: params.slug,
        marker: params.marker,
        kind: "rerouted",
        now: params.now,
      });
      await appendCronExecutionEvent({
        slug: params.slug,
        eventType: "AUTO_ESCALATION_REROUTED",
        productionTier: true,
        incidentMarker: params.marker,
        errorMessage: `Escalation rerouted to ${alternateAssignment.assignee.email} after ${engagementState}.`,
        createdAt: params.now,
      });
      void escalateSupportTicketNotify({
        ticket: {
          id: params.supportTicket.id,
          subject: params.supportTicket.subject,
          email: params.supportTicket.email,
          category: params.supportTicket.category,
          priority: params.supportTicket.priority,
        },
        reasons: [
          ...reasons,
          `rerouted_to:${alternateAssignment.assignee.email}`,
        ],
      });
      await pageCronEscalationEvent({
        slug: params.slug,
        incidentMarker: params.marker,
        phase: "auto_rerouted",
        ticketId: params.supportTicket.id,
        ticketRef: params.row.autoEscalationTicketRef ?? null,
        ticketSubject: params.supportTicket.subject,
        recipient: {
          userId: alternateAssignment.assignee.userId,
          email: alternateAssignment.assignee.email,
          fullName: alternateAssignment.assignee.fullName,
        },
        reason: `Escalation rerouted after ${engagementState}.`,
      });
      return;
    }

    await prisma.supportTicketEvent.create({
      data: {
        ticketId: params.supportTicket.id,
        eventType: "SLA_WARNING",
        performedById: null,
        metadataJson: {
          source: "cron_auto_escalation_follow_up",
          reason: engagementState,
          assigneeId: params.supportTicket.assignedToId,
          incidentMarker: params.marker,
        },
      },
    });
    await recordAutoEscalationFollowUp({
      slug: params.slug,
      marker: params.marker,
      kind: "reminded",
      now: params.now,
    });
    await appendCronExecutionEvent({
      slug: params.slug,
      eventType: "AUTO_ESCALATION_REMINDED",
      productionTier: true,
      incidentMarker: params.marker,
      errorMessage:
        engagementState === "unassigned"
          ? "Escalation is still unassigned; reminder emitted for manual intervention."
          : "Assigned owner missed first-response SLA; reminder emitted for manual intervention.",
      createdAt: params.now,
    });
    void escalateSupportTicketNotify({
      ticket: {
        id: params.supportTicket.id,
        subject: params.supportTicket.subject,
        email: params.supportTicket.email,
        category: params.supportTicket.category,
        priority: params.supportTicket.priority,
      },
      reasons: [
        ...reasons,
        params.supportTicket.assignedTo?.email
          ? `current_owner:${params.supportTicket.assignedTo.email}`
          : "no_alternate_owner_available",
      ],
    });
    await pageCronEscalationEvent({
      slug: params.slug,
      incidentMarker: params.marker,
      phase: "auto_reminded",
      ticketId: params.supportTicket.id,
      ticketRef: params.row.autoEscalationTicketRef ?? null,
      ticketSubject: params.supportTicket.subject,
      recipient: params.supportTicket.assignedTo
        ? {
            userId: params.supportTicket.assignedTo.id,
            email: params.supportTicket.assignedTo.email,
            fullName: params.supportTicket.assignedTo.fullName,
          }
        : null,
      reason:
        engagementState === "unassigned"
          ? "Escalation is still unassigned."
          : "Assigned owner missed first-response SLA.",
    });
  } catch (error) {
    logger.error("cron_auto_escalation_follow_up_failed", {
      slug: params.slug,
      incidentMarker: params.marker,
      engagementState,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

async function reconcileCriticalCronEscalationFollowUps(now = new Date()): Promise<void> {
  const rows = (await cronExecutionHeartbeatModel().findMany({
    where: { slug: { in: [...CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS] } },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
      lastStartedAt: true,
      lastSucceededAt: true,
      lastFailedAt: true,
      lastDurationMs: true,
      lastStatusCode: true,
      consecutiveFailures: true,
      lastError: true,
      autoEscalatedAt: true,
      autoEscalatedForMarker: true,
      autoEscalationReason: true,
      autoEscalationTicketId: true,
      autoEscalationTicketRef: true,
      autoEscalationFollowUpAt: true,
      autoEscalationFollowUpForMarker: true,
      autoEscalationFollowUpKind: true,
    },
  })) as CronExecutionEvidenceRow[];

  const ticketIds = rows
    .map((row) => row.autoEscalationTicketId ?? null)
    .filter((id): id is string => Boolean(id));
  const { supportTicketById, firstResponseDueAtByTicketId } =
    await loadAutoEscalationSupportState(ticketIds);

  for (const row of rows) {
    if (!isAllowedProductionCronSlug(row.slug)) continue;
    const marker = row.autoEscalatedForMarker ?? cronIncidentMarkerForRow(row.slug, row, now);
    if (!marker || row.autoEscalatedForMarker !== marker || !row.autoEscalationTicketId) continue;
    await applyCriticalCronAutoEscalationFollowUp({
      slug: row.slug,
      row,
      marker,
      supportTicket: supportTicketById.get(row.autoEscalationTicketId) ?? null,
      firstResponseDueAt: firstResponseDueAtByTicketId.get(row.autoEscalationTicketId) ?? null,
      now,
    });
  }
}

async function reconcileCriticalCronAutoEscalations(now = new Date()): Promise<void> {
  await ensureCronEvidenceSeedRows(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS);
  const rows = (await cronExecutionHeartbeatModel().findMany({
    where: { slug: { in: [...CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS] } },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
      lastStartedAt: true,
      lastSucceededAt: true,
      lastFailedAt: true,
      lastDurationMs: true,
      lastStatusCode: true,
      consecutiveFailures: true,
      lastError: true,
      incidentAcknowledgedAt: true,
      incidentAcknowledgedForMarker: true,
      incidentAcknowledgedByUserId: true,
      autoEscalatedAt: true,
      autoEscalatedForMarker: true,
      autoEscalationReason: true,
      autoEscalationTicketId: true,
      autoEscalationTicketRef: true,
      autoEscalationFollowUpAt: true,
      autoEscalationFollowUpForMarker: true,
      autoEscalationFollowUpKind: true,
    },
  })) as CronExecutionEvidenceRow[];

  for (const row of rows) {
    if (!isAllowedProductionCronSlug(row.slug)) continue;
    await autoEscalateTrackedCronIfNeeded(row.slug, row, now);
  }
}

async function clearAutoEscalationForRecoveredIncident(params: {
  slug: ProductionCronSlug;
  incidentMarker: string | null;
  now: Date;
}): Promise<void> {
  if (!params.incidentMarker) return;
  try {
    const row = (await cronExecutionHeartbeatModel().findUnique({
      where: { slug: params.slug },
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
        lastStartedAt: true,
        lastSucceededAt: true,
        lastFailedAt: true,
        lastDurationMs: true,
        lastStatusCode: true,
        consecutiveFailures: true,
        lastError: true,
        autoEscalatedAt: true,
        autoEscalatedForMarker: true,
        autoEscalationReason: true,
        autoEscalationTicketId: true,
        autoEscalationTicketRef: true,
        autoEscalationFollowUpAt: true,
        autoEscalationFollowUpForMarker: true,
        autoEscalationFollowUpKind: true,
      },
    })) as CronExecutionEvidenceRow | null;

    if (!row?.autoEscalatedAt || row.autoEscalatedForMarker !== params.incidentMarker) {
      return;
    }

    const resolutionSummary = `Automatically resolved after ${params.slug} recovered with a successful cron run.`;
    if (row.autoEscalationTicketId) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: row.autoEscalationTicketId },
        select: {
          id: true,
          status: true,
          resolutionSummary: true,
        },
      });
      if (ticket && PLATFORM_OPEN_TICKET_STATUSES.includes(ticket.status)) {
        await prisma.supportTicket.update({
          where: { id: ticket.id },
          data: {
            status: "RESOLVED",
            resolvedAt: params.now,
            resolutionSummary: ticket.resolutionSummary ?? resolutionSummary,
          },
        });
        await prisma.supportTicketEvent.create({
          data: {
            ticketId: ticket.id,
            eventType: "RESOLVED",
            performedById: null,
            metadataJson: {
              source: "cron_auto_escalation",
              slug: params.slug,
              incidentMarker: params.incidentMarker,
            },
          },
        });
      }
    }

    await cronExecutionHeartbeatModel().update({
      where: { slug: params.slug },
      data: {
        autoEscalatedAt: null,
        autoEscalatedForMarker: null,
        autoEscalationReason: null,
        autoEscalationTicketId: null,
        autoEscalationTicketRef: null,
        autoEscalationFollowUpAt: null,
        autoEscalationFollowUpForMarker: null,
        autoEscalationFollowUpKind: null,
      },
    });

    await appendCronExecutionEvent({
      slug: params.slug,
      eventType: "AUTO_ESCALATION_CLEARED",
      productionTier: true,
      incidentMarker: params.incidentMarker,
      errorMessage: row.autoEscalationTicketRef
        ? `Recovered after auto-escalation. Support ticket ${row.autoEscalationTicketRef} resolved.`
        : "Recovered after auto-escalation.",
      createdAt: params.now,
    });
  } catch (error) {
    logger.error("cron_auto_escalation_clear_failed", {
      slug: params.slug,
      incidentMarker: params.incidentMarker,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

export async function loadCriticalCronExecutionHealth(now = new Date()): Promise<{
  ok: boolean;
  tracked: CronExecutionEvidenceDetail[];
  productionFailure: string | null;
}> {
  if (process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      tracked: [],
      productionFailure: null,
    };
  }
  try {
    await reconcileCriticalCronAutoEscalations(now);
    await reconcileCriticalCronEscalationFollowUps(now);
    const rows = (await cronExecutionHeartbeatModel().findMany({
      where: { slug: { in: [...CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS] } },
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
        lastStartedAt: true,
        lastSucceededAt: true,
        lastFailedAt: true,
        lastDurationMs: true,
        lastStatusCode: true,
        consecutiveFailures: true,
        autoEscalatedAt: true,
        autoEscalatedForMarker: true,
        autoEscalationReason: true,
        autoEscalationTicketId: true,
        autoEscalationTicketRef: true,
      },
    })) as CronExecutionEvidenceRow[];
    return summarizeCriticalCronExecutionEvidence(rows, now);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logger.error("cron_execution_health_load_failed", { message });
    try {
      const rows = await loadBaseCronExecutionHeartbeatRows(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS);
      return summarizeCriticalCronExecutionEvidence(rows, now);
    } catch (fallbackError) {
      logger.error("cron_execution_health_load_fallback_failed", {
        message: fallbackError instanceof Error ? fallbackError.message : "unknown_error",
      });
      return {
        ok: false,
        tracked: [],
        productionFailure: "Cron execution evidence could not be loaded from the database.",
      };
    }
  }
}

function statusPriority(status: CronExecutionEvidenceStatus): number {
  switch (status) {
    case "failing":
      return 0;
    case "stale":
      return 1;
    case "pending_initial_run":
      return 2;
    case "healthy":
      return 3;
  }
}

function lastSignalEpoch(row: CronExecutionAuditRow): number {
  return Math.max(
    row.lastFailedAt ? Date.parse(row.lastFailedAt) : 0,
    row.lastSucceededAt ? Date.parse(row.lastSucceededAt) : 0,
    row.lastStartedAt ? Date.parse(row.lastStartedAt) : 0,
  );
}

function isEscalationAttentionState(state: SupportEscalationEngagementState): boolean {
  return state === "missing_ticket" || state === "unassigned" || state === "first_response_overdue";
}

function titleForExecutionEvent(event: CronExecutionEventRow): string {
  switch (event.eventType) {
    case "FAILED":
      return "Cron run failed";
    case "SUCCEEDED":
      return "Cron run succeeded";
    case "RESOLVED":
      return "Incident resolved by successful run";
    case "ACKNOWLEDGED":
      return "Incident acknowledged";
    case "REOPENED":
      return "Acknowledgement cleared";
    case "AUTO_ESCALATED":
      return "Auto-escalated to support";
    case "AUTO_ESCALATION_CLEARED":
      return "Auto-escalation cleared after recovery";
    case "AUTO_ESCALATION_REROUTED":
      return "Auto-escalation rerouted";
    case "AUTO_ESCALATION_REMINDED":
      return "Auto-escalation reminded";
  }
}

function subtitleForExecutionEvent(event: CronExecutionEventRow): string | null {
  const parts: string[] = [];
  const actor = event.actorUserProfile?.fullName ?? event.actorUserId ?? null;
  if (actor && (event.eventType === "ACKNOWLEDGED" || event.eventType === "REOPENED")) {
    parts.push(actor);
  }
  if (event.statusCode != null) {
    parts.push(`status ${event.statusCode}`);
  }
  if (event.durationMs != null) {
    parts.push(`${event.durationMs}ms`);
  }
  if (event.errorMessage) {
    const preview = toSafeErrorPreview(event.errorMessage, 140, {
      redactEmail: true,
      redactPhone: true,
    });
    if (preview.text && preview.text !== "—") {
      parts.push(preview.text);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function loadProductionCronExecutionAudit(now = new Date()): Promise<{
  summary: {
    total: number;
    critical: number;
    healthy: number;
    pendingInitialRun: number;
    stale: number;
    failing: number;
    attentionRequired: number;
    criticalAttentionRequired: number;
    openIncidents: number;
    acknowledgedIncidents: number;
    criticalOpenIncidents: number;
    criticalAcknowledgedIncidents: number;
    autoEscalatedIncidents: number;
    criticalAutoEscalatedIncidents: number;
    stalledAutoEscalations: number;
    criticalStalledAutoEscalations: number;
    unassignedAutoEscalations: number;
    firstResponseOverdueAutoEscalations: number;
  };
  rows: CronExecutionAuditRow[];
}> {
  let rows: CronExecutionEvidenceRow[];
  try {
    if (process.env.NODE_ENV === "production") {
      await reconcileCriticalCronAutoEscalations(now);
      await reconcileCriticalCronEscalationFollowUps(now);
    }
    await ensureCronEvidenceSeedRows(ALLOWED_PRODUCTION_CRON_SLUGS);
    rows = (await cronExecutionHeartbeatModel().findMany({
      where: { slug: { in: [...ALLOWED_PRODUCTION_CRON_SLUGS] } },
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
        lastStartedAt: true,
        lastSucceededAt: true,
        lastFailedAt: true,
        lastDurationMs: true,
        lastStatusCode: true,
        consecutiveFailures: true,
        lastError: true,
        incidentAcknowledgedAt: true,
        incidentAcknowledgedForMarker: true,
        incidentAcknowledgedByUserId: true,
        incidentAcknowledger: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        autoEscalatedAt: true,
        autoEscalatedForMarker: true,
        autoEscalationReason: true,
        autoEscalationTicketId: true,
        autoEscalationTicketRef: true,
        autoEscalationFollowUpAt: true,
        autoEscalationFollowUpForMarker: true,
        autoEscalationFollowUpKind: true,
      },
    })) as CronExecutionEvidenceRow[];
  } catch (error) {
    logger.error("cron_execution_audit_load_failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    await ensureCronEvidenceSeedRows(ALLOWED_PRODUCTION_CRON_SLUGS);
    rows = await loadBaseCronExecutionHeartbeatRows(ALLOWED_PRODUCTION_CRON_SLUGS);
  }

  const autoEscalationTicketIds = rows
    .map((row) => row.autoEscalationTicketId ?? null)
    .filter((id): id is string => Boolean(id));
  const { supportTicketById, firstResponseDueAtByTicketId } =
    await loadAutoEscalationSupportState(autoEscalationTicketIds);

  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const auditRows = ALLOWED_PRODUCTION_CRON_SLUGS.map((slug) => {
    const row = bySlug.get(slug);
    const detail = buildCronExecutionEvidenceDetail(slug, row, now);
    const meta = getProductionCronOpsMetadata(slug);
    const incidentMarker = cronIncidentMarkerForRow(slug, row, now);
    const activeAutoEscalationTicketId =
      incidentMarker === row?.autoEscalatedForMarker ? row?.autoEscalationTicketId ?? null : null;
    const supportTicket = activeAutoEscalationTicketId
      ? supportTicketById.get(activeAutoEscalationTicketId) ?? null
      : null;
    const firstResponseDueAt = activeAutoEscalationTicketId
      ? firstResponseDueAtByTicketId.get(activeAutoEscalationTicketId) ?? null
      : null;
    const autoEscalationEngagementState = activeAutoEscalationTicketId
      ? deriveSupportEscalationEngagementState({
          ticket: supportTicket,
          firstResponseDueAt,
          now,
        })
      : "none";
    return {
      ...detail,
      critical: CRITICAL_CRON_EVIDENCE_SET.has(slug),
      label: meta.label,
      summary: meta.summary,
      ownerHref: meta.ownerHref,
      ownerLabel: meta.ownerLabel,
      responseHint: meta.responseHint,
      lastError: row?.lastError ?? null,
      incidentState: cronIncidentStateForRow(slug, row, now),
      incidentMarker,
      incidentAcknowledgedAt: toIso(row?.incidentAcknowledgedAt ?? null),
      incidentAcknowledgedByUserId: row?.incidentAcknowledgedByUserId ?? null,
      incidentAcknowledgedByName: row?.incidentAcknowledger?.fullName ?? null,
      autoEscalatedAt: incidentMarker === row?.autoEscalatedForMarker ? toIso(row?.autoEscalatedAt ?? null) : null,
      autoEscalatedForMarker: incidentMarker === row?.autoEscalatedForMarker ? row?.autoEscalatedForMarker ?? null : null,
      autoEscalationReason:
        incidentMarker === row?.autoEscalatedForMarker &&
        (row?.autoEscalationReason === "repeated_failures" ||
          row?.autoEscalationReason === "prolonged_outage")
          ? row.autoEscalationReason
          : null,
      autoEscalationTicketId: activeAutoEscalationTicketId,
      autoEscalationTicketRef:
        incidentMarker === row?.autoEscalatedForMarker ? row?.autoEscalationTicketRef ?? null : null,
      autoEscalationEngagementState,
      autoEscalationAssignedToId: supportTicket?.assignedToId ?? null,
      autoEscalationAssignedToName: supportTicket?.assignedTo?.fullName ?? null,
      autoEscalationAssignedToEmail: supportTicket?.assignedTo?.email ?? null,
      autoEscalationTicketStatus: supportTicket?.status ?? null,
      autoEscalationFirstResponseAt: toIso(supportTicket?.firstResponseAt ?? null),
      autoEscalationFirstResponseDueAt: toIso(firstResponseDueAt ?? null),
      autoEscalationFollowUpAt:
        incidentMarker === row?.autoEscalationFollowUpForMarker
          ? toIso(row?.autoEscalationFollowUpAt ?? null)
          : null,
      autoEscalationFollowUpKind:
        incidentMarker === row?.autoEscalationFollowUpForMarker &&
        (row?.autoEscalationFollowUpKind === "rerouted" || row?.autoEscalationFollowUpKind === "reminded")
          ? row.autoEscalationFollowUpKind
          : null,
    } satisfies CronExecutionAuditRow;
  }).sort((a, b) => {
    const criticalDelta = Number(b.critical) - Number(a.critical);
    if (criticalDelta !== 0) return criticalDelta;
    const statusDelta = statusPriority(a.status) - statusPriority(b.status);
    if (statusDelta !== 0) return statusDelta;
    const escalationAttentionDelta =
      Number(isEscalationAttentionState(b.autoEscalationEngagementState)) -
      Number(isEscalationAttentionState(a.autoEscalationEngagementState));
    if (escalationAttentionDelta !== 0) return escalationAttentionDelta;
    return lastSignalEpoch(b) - lastSignalEpoch(a);
  });

  const summary = {
    total: auditRows.length,
    critical: auditRows.filter((row) => row.critical).length,
    healthy: auditRows.filter((row) => row.status === "healthy").length,
    pendingInitialRun: auditRows.filter((row) => row.status === "pending_initial_run").length,
    stale: auditRows.filter((row) => row.status === "stale").length,
    failing: auditRows.filter((row) => row.status === "failing").length,
    attentionRequired: auditRows.filter((row) => row.status === "stale" || row.status === "failing").length,
    criticalAttentionRequired: auditRows.filter(
      (row) => row.critical && (row.status === "stale" || row.status === "failing"),
    ).length,
    openIncidents: auditRows.filter((row) => row.incidentState === "open").length,
    acknowledgedIncidents: auditRows.filter((row) => row.incidentState === "acknowledged").length,
    criticalOpenIncidents: auditRows.filter(
      (row) => row.critical && row.incidentState === "open",
    ).length,
    criticalAcknowledgedIncidents: auditRows.filter(
      (row) => row.critical && row.incidentState === "acknowledged",
    ).length,
    autoEscalatedIncidents: auditRows.filter((row) => row.autoEscalatedAt).length,
    criticalAutoEscalatedIncidents: auditRows.filter(
      (row) => row.critical && row.autoEscalatedAt,
    ).length,
    stalledAutoEscalations: auditRows.filter((row) =>
      isEscalationAttentionState(row.autoEscalationEngagementState),
    ).length,
    criticalStalledAutoEscalations: auditRows.filter(
      (row) => row.critical && isEscalationAttentionState(row.autoEscalationEngagementState),
    ).length,
    unassignedAutoEscalations: auditRows.filter(
      (row) => row.autoEscalationEngagementState === "unassigned" || row.autoEscalationEngagementState === "missing_ticket",
    ).length,
    firstResponseOverdueAutoEscalations: auditRows.filter(
      (row) => row.autoEscalationEngagementState === "first_response_overdue",
    ).length,
  };

  return { summary, rows: auditRows };
}

export async function listRecentCronExecutionEvents(params: {
  slug?: ProductionCronSlug;
  take: number;
}): Promise<CronExecutionEventRow[]> {
  const rows = (await cronExecutionEventModel().findMany({
    where: params.slug ? { slug: params.slug } : { slug: { in: [...ALLOWED_PRODUCTION_CRON_SLUGS] } },
    orderBy: { createdAt: "desc" },
    take: params.take,
    select: {
      id: true,
      slug: true,
      eventType: true,
      productionTier: true,
      statusCode: true,
      durationMs: true,
      errorMessage: true,
      incidentMarker: true,
      actorUserId: true,
      createdAt: true,
      actorUserProfile: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  })) as CronExecutionEventRow[];
  return rows;
}

export async function loadCronExecutionTimelineItems(
  slug: ProductionCronSlug,
  take: number,
): Promise<ActivityTimelineItem[]> {
  const events = await listRecentCronExecutionEvents({ slug, take });
  return events.map((event) => ({
    id: event.id,
    title: titleForExecutionEvent(event),
    subtitle: subtitleForExecutionEvent(event),
    createdAt: event.createdAt.toISOString(),
    severity:
      event.eventType === "FAILED"
        ? "CRITICAL"
        : event.eventType === "ACKNOWLEDGED" ||
            event.eventType === "REOPENED" ||
            event.eventType === "AUTO_ESCALATION_REROUTED" ||
            event.eventType === "AUTO_ESCALATION_REMINDED"
          ? "WARNING"
          : "INFO",
    href: null,
  }));
}

export async function acknowledgeCronIncident(params: {
  slug: ProductionCronSlug;
  acknowledgedByUserId: string;
  now?: Date;
}): Promise<{ ok: true; incidentMarker: string } | { error: string }> {
  const now = params.now ?? new Date();
  await ensureCronEvidenceSeedRows([params.slug]);
  const row = (await cronExecutionHeartbeatModel().findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
      lastStartedAt: true,
      lastSucceededAt: true,
      lastFailedAt: true,
      lastDurationMs: true,
      lastStatusCode: true,
      consecutiveFailures: true,
      lastError: true,
      incidentAcknowledgedAt: true,
      incidentAcknowledgedForMarker: true,
      incidentAcknowledgedByUserId: true,
    },
  })) as CronExecutionEvidenceRow | null;
  const marker = cronIncidentMarkerForRow(params.slug, row ?? undefined, now);
  if (!marker) {
    return { error: "Cron incident no longer needs acknowledgement." };
  }
  await cronExecutionHeartbeatModel().update({
    where: { slug: params.slug },
    data: {
      incidentAcknowledgedAt: now,
      incidentAcknowledgedForMarker: marker,
      incidentAcknowledgedByUserId: params.acknowledgedByUserId,
    },
  });
  await appendCronExecutionEvent({
    slug: params.slug,
    eventType: "ACKNOWLEDGED",
    productionTier: true,
    actorUserId: params.acknowledgedByUserId,
    incidentMarker: marker,
    createdAt: now,
  });
  return { ok: true, incidentMarker: marker };
}

export async function clearCronIncidentAcknowledgement(params: {
  slug: ProductionCronSlug;
  actorUserId?: string | null;
  now?: Date;
}): Promise<{ ok: true; incidentMarker: string | null } | { error: string }> {
  await ensureCronEvidenceSeedRows([params.slug]);
  const now = params.now ?? new Date();
  const row = (await cronExecutionHeartbeatModel().findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
      lastStartedAt: true,
      lastSucceededAt: true,
      lastFailedAt: true,
      lastDurationMs: true,
      lastStatusCode: true,
      consecutiveFailures: true,
      lastError: true,
      incidentAcknowledgedAt: true,
      incidentAcknowledgedForMarker: true,
      incidentAcknowledgedByUserId: true,
    },
  })) as CronExecutionEvidenceRow | null;
  const marker =
    row?.incidentAcknowledgedForMarker ??
    cronIncidentMarkerForRow(params.slug, row as CronExecutionEvidenceRow | undefined, now);
  await cronExecutionHeartbeatModel().update({
    where: { slug: params.slug },
    data: {
      incidentAcknowledgedAt: null,
      incidentAcknowledgedForMarker: null,
      incidentAcknowledgedByUserId: null,
    },
  });
  await appendCronExecutionEvent({
    slug: params.slug,
    eventType: "REOPENED",
    productionTier: true,
    actorUserId: params.actorUserId ?? null,
    createdAt: now,
  });
  return { ok: true, incidentMarker: marker };
}

export async function recordCronExecutionStarted(params: {
  slug: string;
  productionTier: boolean;
  startedAt?: Date;
}): Promise<void> {
  try {
    await cronExecutionHeartbeatModel().upsert({
      where: { slug: params.slug },
      update: {
        productionTier: params.productionTier,
        lastStartedAt: params.startedAt ?? new Date(),
      },
      create: {
        slug: params.slug,
        productionTier: params.productionTier,
        lastStartedAt: params.startedAt ?? new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logger.error("cron_execution_evidence_start_write_failed", {
      slug: params.slug,
      productionTier: params.productionTier,
      message,
    });
  }
}

export async function recordCronExecutionFinished(params: {
  slug: string;
  productionTier: boolean;
  startedAt: Date;
  finishedAt?: Date;
  statusCode: number;
  error?: unknown;
}): Promise<void> {
  const finishedAt = params.finishedAt ?? new Date();
  const durationMs = Math.max(0, finishedAt.getTime() - params.startedAt.getTime());
  const failed = params.statusCode >= 400 || params.error != null;
  const errorMessage =
    typeof params.error === "string"
      ? params.error
      : params.error instanceof Error
        ? params.error.message
        : params.error != null
          ? String(params.error)
          : null;

  try {
    const trackedProductionSlug =
      params.productionTier && isAllowedProductionCronSlug(params.slug) ? params.slug : null;
    const previousRow = trackedProductionSlug
      ? ((await cronExecutionHeartbeatModel().findUnique({
          where: { slug: trackedProductionSlug },
          select: {
            slug: true,
            createdAt: true,
            updatedAt: true,
            lastStartedAt: true,
            lastSucceededAt: true,
            lastFailedAt: true,
            lastDurationMs: true,
            lastStatusCode: true,
            consecutiveFailures: true,
            lastError: true,
            incidentAcknowledgedAt: true,
            incidentAcknowledgedForMarker: true,
            incidentAcknowledgedByUserId: true,
            autoEscalatedAt: true,
            autoEscalatedForMarker: true,
            autoEscalationReason: true,
            autoEscalationTicketId: true,
            autoEscalationTicketRef: true,
          },
        })) as CronExecutionEvidenceRow | null)
      : null;
    const previousIncidentMarker = trackedProductionSlug
      ? cronIncidentMarkerForRow(trackedProductionSlug, previousRow ?? undefined, finishedAt)
      : null;

    await cronExecutionHeartbeatModel().upsert({
      where: { slug: params.slug },
      update: failed
        ? {
            productionTier: params.productionTier,
            lastStartedAt: params.startedAt,
            lastFailedAt: finishedAt,
            lastDurationMs: durationMs,
            lastStatusCode: params.statusCode,
            lastError: errorMessage?.slice(0, 1000) ?? null,
            consecutiveFailures: { increment: 1 },
          }
        : {
            productionTier: params.productionTier,
            lastStartedAt: params.startedAt,
            lastSucceededAt: finishedAt,
            lastDurationMs: durationMs,
            lastStatusCode: params.statusCode,
            lastError: null,
            consecutiveFailures: 0,
          },
      create: failed
        ? {
            slug: params.slug,
            productionTier: params.productionTier,
            lastStartedAt: params.startedAt,
            lastFailedAt: finishedAt,
            lastDurationMs: durationMs,
            lastStatusCode: params.statusCode,
            lastError: errorMessage?.slice(0, 1000) ?? null,
            consecutiveFailures: 1,
          }
        : {
            slug: params.slug,
            productionTier: params.productionTier,
            lastStartedAt: params.startedAt,
            lastSucceededAt: finishedAt,
            lastDurationMs: durationMs,
            lastStatusCode: params.statusCode,
            consecutiveFailures: 0,
          },
    });

    if (trackedProductionSlug) {
      if (failed) {
        await appendCronExecutionEvent({
          slug: trackedProductionSlug,
          eventType: "FAILED",
          productionTier: true,
          statusCode: params.statusCode,
          durationMs,
          errorMessage,
          incidentMarker: `failed:${finishedAt.toISOString()}`,
          createdAt: finishedAt,
        });
        await autoEscalateTrackedCronIfNeeded(trackedProductionSlug, {
          ...(previousRow ?? {
            slug: trackedProductionSlug,
            createdAt: finishedAt,
            updatedAt: finishedAt,
            lastStartedAt: null,
            lastSucceededAt: null,
            lastFailedAt: null,
            lastDurationMs: null,
            lastStatusCode: null,
            consecutiveFailures: 0,
          }),
          lastStartedAt: params.startedAt,
          lastFailedAt: finishedAt,
          lastDurationMs: durationMs,
          lastStatusCode: params.statusCode,
          consecutiveFailures: (previousRow?.consecutiveFailures ?? 0) + 1,
          lastError: errorMessage?.slice(0, 1000) ?? null,
        }, finishedAt);
      } else {
        await appendCronExecutionEvent({
          slug: trackedProductionSlug,
          eventType: previousIncidentMarker ? "RESOLVED" : "SUCCEEDED",
          productionTier: true,
          statusCode: params.statusCode,
          durationMs,
          incidentMarker: previousIncidentMarker,
          createdAt: finishedAt,
        });
        await clearAutoEscalationForRecoveredIncident({
          slug: trackedProductionSlug,
          incidentMarker: previousIncidentMarker,
          now: finishedAt,
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logger.error("cron_execution_evidence_finish_write_failed", {
      slug: params.slug,
      productionTier: params.productionTier,
      failed,
      message,
    });
  }
}
