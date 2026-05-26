import { beforeEach, describe, expect, it, vi } from "vitest";

const collectProductionReadinessIssuesMock = vi.hoisted(() => vi.fn());
const shouldFatalOnNodeStartupMock = vi.hoisted(() => vi.fn());
const loadProductionCronExecutionAuditMock = vi.hoisted(() => vi.fn());
const countOpenWebhookJobRecoveriesMock = vi.hoisted(() => vi.fn());
const listOpenWebhookJobRecoveriesMock = vi.hoisted(() => vi.fn());
const loadActiveProductionIncidentRemediationTaskSnapshotsMock = vi.hoisted(() => vi.fn());
const syncProductionIncidentRemediationTasksForIncidentMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  productionIncident: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  productionIncidentEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  platformUserRole: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/startup/production-readiness", () => ({
  collectProductionReadinessIssues: collectProductionReadinessIssuesMock,
  shouldFatalOnNodeStartup: shouldFatalOnNodeStartupMock,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/cron/cron-execution-evidence", () => ({
  loadProductionCronExecutionAudit: loadProductionCronExecutionAuditMock,
}));
vi.mock("@/services/webhooks/webhook-error-recovery-service", () => ({
  countOpenWebhookJobRecoveries: countOpenWebhookJobRecoveriesMock,
  listOpenWebhookJobRecoveries: listOpenWebhookJobRecoveriesMock,
}));
vi.mock("@/services/incidents/production-incident-remediation-task-service", () => ({
  loadActiveProductionIncidentRemediationTaskSnapshots:
    loadActiveProductionIncidentRemediationTaskSnapshotsMock,
  syncProductionIncidentRemediationTasksForIncident: syncProductionIncidentRemediationTasksForIncidentMock,
  expectedRemediationTaskKindForIncident: vi.fn(() => null),
}));

import {
  loadProductionIncidentRollup,
  updateProductionIncidentRemediationControl,
  updateProductionIncidentReview,
  updateProductionIncidentWorkflow,
} from "@/services/incidents/production-incident-rollup-service";

describe("production incident rollup service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.productionIncidentEvent.findMany.mockResolvedValue([]);
    loadActiveProductionIncidentRemediationTaskSnapshotsMock.mockResolvedValue({});
    syncProductionIncidentRemediationTasksForIncidentMock.mockResolvedValue({
      scanned: 1,
      created: 0,
      updated: 0,
      completed: 0,
    });
  });

  it("syncs live signals into persisted incidents and auto-resolves stale rows", async () => {
    collectProductionReadinessIssuesMock.mockReturnValue([
      {
        id: "rate_limit",
        message: "Production rate limiting is still using memory mode.",
      },
    ]);
    shouldFatalOnNodeStartupMock.mockReturnValue(true);
    loadProductionCronExecutionAuditMock.mockResolvedValue({
      summary: {},
      rows: [
        {
          slug: "webhook-jobs",
          schedule: "*/5 * * * *",
          windowMs: 20 * 60_000,
          status: "failing",
          lastStartedAt: "2026-05-25T16:00:00.000Z",
          lastSucceededAt: "2026-05-25T15:40:00.000Z",
          lastFailedAt: "2026-05-25T16:00:00.000Z",
          lastDurationMs: 1200,
          lastStatusCode: 500,
          consecutiveFailures: 4,
          critical: true,
          label: "Webhook job drain",
          summary: "Processes queued webhook jobs.",
          ownerHref: "/dashboard/sales-channels/webhooks",
          ownerLabel: "Open webhooks",
          responseHint: "Check backlog.",
          lastError: "boom",
          incidentState: "open",
          incidentMarker: "failed:2026-05-25T16:00:00.000Z",
          incidentAcknowledgedAt: null,
          incidentAcknowledgedByUserId: null,
          incidentAcknowledgedByName: null,
          autoEscalatedAt: "2026-05-25T16:01:00.000Z",
          autoEscalatedForMarker: "failed:2026-05-25T16:00:00.000Z",
          autoEscalationReason: "repeated_failures",
          autoEscalationTicketId: "ticket-1",
          autoEscalationTicketRef: "KS-TICKET1",
          autoEscalationEngagementState: "first_response_overdue",
          autoEscalationAssignedToId: "owner-1",
          autoEscalationAssignedToName: "Ops Owner",
          autoEscalationAssignedToEmail: "ops@example.com",
          autoEscalationTicketStatus: "ESCALATED",
          autoEscalationFirstResponseAt: null,
          autoEscalationFirstResponseDueAt: "2026-05-25T17:00:00.000Z",
          autoEscalationFollowUpAt: "2026-05-25T17:10:00.000Z",
          autoEscalationFollowUpKind: "reminded",
        },
        {
          slug: "reminders",
          schedule: "0 8 * * *",
          windowMs: 30 * 60_000,
          status: "healthy",
          lastStartedAt: "2026-05-25T08:00:00.000Z",
          lastSucceededAt: "2026-05-25T08:00:00.000Z",
          lastFailedAt: null,
          lastDurationMs: 400,
          lastStatusCode: 200,
          consecutiveFailures: 0,
          critical: false,
          label: "Reminder dispatch",
          summary: "Sends reminders.",
          ownerHref: "/dashboard/notifications",
          ownerLabel: "Open notifications",
          responseHint: "Check notifications.",
          lastError: null,
          incidentState: "none",
          incidentMarker: null,
          incidentAcknowledgedAt: null,
          incidentAcknowledgedByUserId: null,
          incidentAcknowledgedByName: null,
          autoEscalatedAt: null,
          autoEscalatedForMarker: null,
          autoEscalationReason: null,
          autoEscalationTicketId: null,
          autoEscalationTicketRef: null,
          autoEscalationEngagementState: "none",
          autoEscalationAssignedToId: null,
          autoEscalationAssignedToName: null,
          autoEscalationAssignedToEmail: null,
          autoEscalationTicketStatus: null,
          autoEscalationFirstResponseAt: null,
          autoEscalationFirstResponseDueAt: null,
          autoEscalationFollowUpAt: null,
          autoEscalationFollowUpKind: null,
        },
      ],
    });
    countOpenWebhookJobRecoveriesMock.mockResolvedValue(4);
    listOpenWebhookJobRecoveriesMock.mockResolvedValue([
      {
        id: "recovery-1",
        provider: "SHOPIFY",
        eventType: "orders/create",
        lastError: "Provider returned 500",
        attempts: 3,
        maxAttempts: 5,
        webhookEventId: "evt-1",
        webhookJobId: "job-1",
        updatedAt: new Date("2026-05-25T16:30:00.000Z"),
      },
    ]);
    prismaMock.productionIncident.findMany
      .mockResolvedValueOnce([
        {
          id: "stale-incident",
          sourceKey: "startup:old",
          workflowStatus: "OPEN",
          assignedToId: null,
          acknowledgedAt: null,
          acknowledgedByUserId: null,
          resolutionSummary: null,
          resolvedAt: null,
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
          autoResolved: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "cron-incident",
          sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
          source: "critical_cron",
          title: "Critical cron incident: Webhook job drain",
          summary: "failing critical cron incident. Support ticket KS-TICKET1. Engagement: first response overdue. Follow-up: reminded.",
          severity: "critical",
          workflowStatus: "OPEN",
          href: "/dashboard/system-health/cron-execution/webhook-jobs",
          ownerLabel: "Ops Owner",
          assignedToId: "owner-1",
          acknowledgedAt: null,
          acknowledgedByUserId: null,
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
          autoResolved: false,
          sourceDetectedAt: new Date("2026-05-25T16:00:00.000Z"),
          firstSeenAt: new Date("2026-05-25T16:00:00.000Z"),
          lastSeenAt: new Date("2026-05-25T16:35:00.000Z"),
          metadataJson: {
            badges: ["webhook-jobs", "KS-TICKET1", "first-response-overdue"],
          },
          assignedTo: { id: "owner-1", fullName: "Ops Owner", email: "ops@example.com" },
          remediationOwner: null,
          remediationControlUpdatedBy: null,
          acknowledgedBy: null,
          resolvedBy: null,
          reviewedBy: null,
        },
        {
          id: "startup-incident",
          sourceKey: "startup:rate_limit",
          source: "startup_readiness",
          title: "Production startup readiness blocked by rate limiting",
          summary: "Production rate limiting is still using memory mode.",
          severity: "critical",
          workflowStatus: "OPEN",
          href: "/dashboard/system-health",
          ownerLabel: "Platform runtime",
          assignedToId: null,
          acknowledgedAt: null,
          acknowledgedByUserId: null,
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
          autoResolved: false,
          sourceDetectedAt: new Date("2026-05-25T16:35:00.000Z"),
          firstSeenAt: new Date("2026-05-25T16:35:00.000Z"),
          lastSeenAt: new Date("2026-05-25T16:35:00.000Z"),
          metadataJson: { badges: ["fatal-on-boot"] },
          assignedTo: null,
          remediationOwner: null,
          remediationControlUpdatedBy: null,
          acknowledgedBy: null,
          resolvedBy: null,
          reviewedBy: null,
        },
        {
          id: "webhook-incident",
          sourceKey: "webhook-recovery:open",
          source: "webhook_recovery",
          title: "Webhook recovery blockers",
          summary: "4 open webhook recovery items awaiting operator attention. Latest provider: SHOPIFY. Event: orders/create. Attempts: 3/5.",
          severity: "high",
          workflowStatus: "OPEN",
          href: "/dashboard/sales-channels/webhooks",
          ownerLabel: "Open webhooks",
          assignedToId: null,
          acknowledgedAt: null,
          acknowledgedByUserId: null,
          resolvedAt: null,
          resolvedByUserId: null,
          resolutionSummary: null,
          reviewStatus: "IN_REMEDIATION",
          rootCauseCategory: "third_party",
          remediationOwnerId: "owner-1",
          remediationDueAt: new Date("2026-05-26T23:59:59.999Z"),
          remediationControlStatus: "SNOOZED",
          remediationSnoozedUntil: new Date("2026-05-29T23:59:59.999Z"),
          remediationControlSummary: "Provider requested a maintenance freeze.",
          remediationControlUpdatedAt: new Date("2026-05-25T17:00:00.000Z"),
          remediationControlUpdatedByUserId: "owner-1",
          reviewSummary: "Shopify webhook retries require provider follow-up.",
          reviewedAt: new Date("2026-05-25T16:40:00.000Z"),
          reviewedByUserId: "owner-1",
          autoResolved: false,
          sourceDetectedAt: new Date("2026-05-25T16:30:00.000Z"),
          firstSeenAt: new Date("2026-05-25T16:30:00.000Z"),
          lastSeenAt: new Date("2026-05-25T16:35:00.000Z"),
          metadataJson: { badges: ["4-open", "shopify"] },
          assignedTo: null,
          remediationOwner: { id: "owner-1", fullName: "Ops Owner", email: "ops@example.com" },
          remediationControlUpdatedBy: {
            id: "owner-1",
            fullName: "Ops Owner",
            email: "ops@example.com",
          },
          acknowledgedBy: null,
          resolvedBy: null,
          reviewedBy: { id: "owner-1", fullName: "Ops Owner", email: "ops@example.com" },
        },
      ]);
    prismaMock.productionIncident.create.mockImplementation(async ({ data }) => ({
      id: crypto.randomUUID(),
      ...data,
    }));

    const rollup = await loadProductionIncidentRollup("user-1");

    expect(rollup.summary).toEqual({
      open: 3,
      critical: 2,
      high: 1,
      startupReadiness: 1,
      criticalCron: 1,
      webhookRecovery: 1,
    });
    expect(rollup.items.map((item) => item.source)).toEqual([
      "startup_readiness",
      "critical_cron",
      "webhook_recovery",
    ]);
    expect(prismaMock.productionIncident.create).toHaveBeenCalledTimes(3);
    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "stale-incident" },
        data: expect.objectContaining({
          workflowStatus: "RESOLVED",
          autoResolved: true,
        }),
      }),
    );
    expect(rollup.items[0]).toEqual(
      expect.objectContaining({
        title: "Production startup readiness blocked by rate limiting",
        severity: "critical",
        status: "investigating",
      }),
    );
    expect(rollup.items[1]).toEqual(
      expect.objectContaining({
        title: "Critical cron incident: Webhook job drain",
        assignedToName: "Ops Owner",
      }),
    );
    expect(rollup.items[2]).toEqual(
      expect.objectContaining({
        title: "Webhook recovery blockers",
        severity: "high",
        ownerLabel: "Open webhooks",
        remediationControlStatus: "SNOOZED",
        remediationDueAt: "2026-05-29T23:59:59.999Z",
      }),
    );
    expect(rollup.timeline).toHaveLength(0);
  });

  it("validates workflow updates and records assignment plus resolution events", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-1",
      href: "/dashboard/system-health/incidents",
      source: "critical_cron",
      sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
      metadataJson: { slug: "webhook-jobs" },
      workflowStatus: "OPEN",
      assignedToId: null,
      acknowledgedAt: null,
    });
    prismaMock.platformUserRole.findFirst.mockResolvedValue({
      user: { fullName: "Ops Owner", email: "ops@example.com" },
    });
    prismaMock.productionIncident.update.mockResolvedValue({});

    const result = await updateProductionIncidentWorkflow({
      incidentId: "incident-1",
      actorUserId: "platform-user-1",
      workflowStatus: "RESOLVED",
      assignedToId: "owner-1",
      resolutionSummary: "Recovered after restoring distributed limiter.",
    });

    expect(result).toEqual({
      ok: true,
      incident: expect.objectContaining({
        id: "incident-1",
        source: "critical_cron",
        sourceKey: expect.any(String),
        workflowStatus: "RESOLVED",
        assignedToId: "owner-1",
      }),
    });
    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "incident-1" },
        data: expect.objectContaining({
          workflowStatus: "RESOLVED",
          assignedToId: "owner-1",
          resolvedByUserId: "platform-user-1",
          autoResolved: false,
        }),
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: "incident-1",
          eventType: "ASSIGNED",
        }),
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: "incident-1",
          eventType: "RESOLVED",
        }),
      }),
    );
  });

  it("requires a resolution summary for manual resolve", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-1",
      href: "/dashboard/system-health/incidents",
      source: "critical_cron",
      sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
      metadataJson: null,
      workflowStatus: "OPEN",
      assignedToId: null,
      acknowledgedAt: null,
    });

    await expect(
      updateProductionIncidentWorkflow({
        incidentId: "incident-1",
        actorUserId: "platform-user-1",
        workflowStatus: "RESOLVED",
        assignedToId: null,
        resolutionSummary: null,
      }),
    ).resolves.toEqual({
      error: "Resolution summary is required when resolving an incident.",
    });
    expect(prismaMock.productionIncident.update).not.toHaveBeenCalled();
  });

  it("resets review metadata when a resolved incident is manually reopened", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-reopen-1",
      href: "/dashboard/system-health/incidents",
      source: "startup_readiness",
      sourceKey: "startup:rate_limit",
      metadataJson: null,
      workflowStatus: "RESOLVED",
      assignedToId: "owner-1",
      acknowledgedAt: new Date("2026-05-25T16:00:00.000Z"),
    });
    prismaMock.productionIncident.update.mockResolvedValue({});

    const result = await updateProductionIncidentWorkflow({
      incidentId: "incident-reopen-1",
      actorUserId: "platform-user-1",
      workflowStatus: "OPEN",
      assignedToId: "owner-1",
      resolutionSummary: null,
    });

    expect(result).toEqual({
      ok: true,
      incident: expect.objectContaining({
        id: "incident-reopen-1",
        workflowStatus: "OPEN",
      }),
    });
    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "incident-reopen-1" },
        data: expect.objectContaining({
          reviewStatus: "PENDING",
          rootCauseCategory: null,
          remediationOwnerId: null,
          remediationDueAt: null,
          remediationControlStatus: "TRACKING",
          remediationSnoozedUntil: null,
          remediationControlSummary: null,
          reviewSummary: null,
          reviewedByUserId: null,
        }),
      }),
    );
  });

  it("updates durable review metadata and records review events", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-review-1",
      reviewStatus: "PENDING",
      rootCauseCategory: null,
      remediationOwnerId: null,
      remediationDueAt: null,
          remediationControlStatus: "TRACKING",
          remediationSnoozedUntil: null,
          remediationControlSummary: null,
      reviewSummary: null,
    });
    prismaMock.platformUserRole.findFirst.mockResolvedValue({ id: "role-1" });
    prismaMock.productionIncident.update.mockResolvedValue({});

    const result = await updateProductionIncidentReview({
      incidentId: "incident-review-1",
      actorUserId: "platform-user-1",
      reviewStatus: "COMPLETED",
      rootCauseCategory: "configuration",
      remediationOwnerId: "owner-1",
      remediationDueAt: new Date("2026-05-31T23:59:59.999Z"),
      reviewSummary: "Redis limiter was deployed without production credentials.",
    });

    expect(result).toEqual({ ok: true });
    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "incident-review-1" },
        data: expect.objectContaining({
          reviewStatus: "COMPLETED",
          rootCauseCategory: "configuration",
          remediationOwnerId: "owner-1",
          remediationDueAt: new Date("2026-05-31T23:59:59.999Z"),
          remediationControlStatus: "TRACKING",
          remediationSnoozedUntil: null,
          remediationControlSummary: null,
          reviewedByUserId: "platform-user-1",
        }),
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: "incident-review-1",
          eventType: "REVIEW_UPDATED",
        }),
      }),
    );
  });

  it("requires remediation owner and due date while review is in remediation", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-review-2",
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
    });

    await expect(
      updateProductionIncidentReview({
        incidentId: "incident-review-2",
        actorUserId: "platform-user-1",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "configuration",
        remediationOwnerId: null,
        remediationDueAt: null,
        reviewSummary: "Tracking follow-up work.",
      }),
    ).resolves.toEqual({
      error: "Remediation owner and due date are required while incident review is in remediation.",
    });
    expect(prismaMock.productionIncident.update).not.toHaveBeenCalled();
  });

  it("updates remediation controls and records control events", async () => {
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-control-1",
      reviewStatus: "IN_REMEDIATION",
      remediationControlStatus: "TRACKING",
      remediationSnoozedUntil: null,
      remediationControlSummary: null,
    });
    prismaMock.productionIncident.update.mockResolvedValue({});

    const result = await updateProductionIncidentRemediationControl({
      incidentId: "incident-control-1",
      actorUserId: "platform-user-1",
      remediationControlStatus: "REASSIGNMENT_REQUESTED",
      remediationSnoozedUntil: null,
      remediationControlSummary: "Current owner is out on leave.",
    });

    expect(result).toEqual({ ok: true });
    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "incident-control-1" },
        data: expect.objectContaining({
          remediationControlStatus: "REASSIGNMENT_REQUESTED",
          remediationControlSummary: "Current owner is out on leave.",
          remediationControlUpdatedByUserId: "platform-user-1",
        }),
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: "incident-control-1",
          eventType: "REMEDIATION_CONTROL_UPDATED",
        }),
      }),
    );
  });
});
