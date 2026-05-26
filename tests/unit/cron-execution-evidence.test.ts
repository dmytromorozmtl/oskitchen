import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  cronExecutionHeartbeat: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    createMany: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  cronExecutionEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  supportTicket: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  supportTicketEvent: {
    create: vi.fn(),
  },
  supportSlaPolicy: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
const createSupportTicketMock = vi.hoisted(() => vi.fn());
const escalateSupportTicketNotifyMock = vi.hoisted(() => vi.fn());
const resolveCronEscalationAssignmentMock = vi.hoisted(() => vi.fn());
const pageCronEscalationEventMock = vi.hoisted(() => vi.fn());
vi.mock("@/services/support/ticket-service", () => ({
  createSupportTicket: createSupportTicketMock,
}));
vi.mock("@/services/support/escalation-service", () => ({
  escalateSupportTicketNotify: escalateSupportTicketNotifyMock,
}));
vi.mock("@/services/cron/cron-escalation-routing", () => ({
  resolveCronEscalationAssignment: resolveCronEscalationAssignmentMock,
}));
vi.mock("@/services/cron/cron-escalation-paging", () => ({
  pageCronEscalationEvent: pageCronEscalationEventMock,
}));

import {
  acknowledgeCronIncident,
  clearCronIncidentAcknowledgement,
  cronEvidenceWindowMsForSlug,
  cronScheduleIntervalMs,
  loadCriticalCronExecutionHealth,
  loadCronExecutionTimelineItems,
  loadProductionCronExecutionAudit,
  recordCronExecutionFinished,
  recordCronExecutionStarted,
  summarizeCriticalCronExecutionEvidence,
} from "@/services/cron/cron-execution-evidence";

const ORIGINAL_ENV = { ...process.env };

describe("cron execution evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupportTicketMock.mockReset();
    escalateSupportTicketNotifyMock.mockReset();
    resolveCronEscalationAssignmentMock.mockReset();
    pageCronEscalationEventMock.mockReset();
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("parses supported cron schedules into intervals", () => {
    expect(cronScheduleIntervalMs("*/5 * * * *")).toBe(5 * 60_000);
    expect(cronScheduleIntervalMs("0 */6 * * *")).toBe(6 * 60 * 60_000);
    expect(cronScheduleIntervalMs("0 14 * * *")).toBe(24 * 60 * 60_000);
    expect(cronScheduleIntervalMs("0 3 * * 0")).toBe(7 * 24 * 60 * 60_000);
    expect(cronEvidenceWindowMsForSlug("webhook-jobs")).toBe(20 * 60_000);
  });

  it("classifies critical cron evidence as healthy, pending, stale, or failing", () => {
    const now = new Date("2026-05-25T16:00:00.000Z");
    const summary = summarizeCriticalCronExecutionEvidence(
      [
        {
          slug: "webhook-jobs",
          createdAt: new Date("2026-05-25T15:00:00.000Z"),
          updatedAt: new Date("2026-05-25T15:59:00.000Z"),
          lastStartedAt: new Date("2026-05-25T15:59:00.000Z"),
          lastSucceededAt: new Date("2026-05-25T15:59:00.000Z"),
          lastFailedAt: null,
          lastDurationMs: 1400,
          lastStatusCode: 200,
          consecutiveFailures: 0,
        },
        {
          slug: "storefront-edge-sync",
          createdAt: new Date("2026-05-25T15:55:00.000Z"),
          updatedAt: new Date("2026-05-25T15:55:00.000Z"),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
        },
        {
          slug: "storefront-cart-recovery",
          createdAt: new Date("2026-05-25T14:00:00.000Z"),
          updatedAt: new Date("2026-05-25T14:00:00.000Z"),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
        },
        {
          slug: "doordash-sync",
          createdAt: new Date("2026-05-25T15:00:00.000Z"),
          updatedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastStartedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastSucceededAt: new Date("2026-05-25T15:40:00.000Z"),
          lastFailedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastDurationMs: 5000,
          lastStatusCode: 500,
          consecutiveFailures: 2,
        },
      ],
      now,
    );

    expect(summary.ok).toBe(false);
    expect(summary.tracked.find((row) => row.slug === "webhook-jobs")?.status).toBe("healthy");
    expect(summary.tracked.find((row) => row.slug === "storefront-edge-sync")?.status).toBe(
      "pending_initial_run",
    );
    expect(summary.tracked.find((row) => row.slug === "storefront-cart-recovery")?.status).toBe(
      "stale",
    );
    expect(summary.tracked.find((row) => row.slug === "doordash-sync")?.status).toBe("failing");
  });

  it("seeds tracked rows before loading health when evidence is missing", async () => {
    prismaMock.cronExecutionHeartbeat.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          slug: "webhook-jobs",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          slug: "webhook-jobs",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          slug: "webhook-jobs",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
        },
      ]);
    prismaMock.cronExecutionHeartbeat.createMany.mockResolvedValue({ count: 5 });

    const report = await loadCriticalCronExecutionHealth(new Date());

    expect(prismaMock.cronExecutionHeartbeat.createMany).toHaveBeenCalled();
    expect(report.tracked.some((row) => row.slug === "webhook-jobs")).toBe(true);
  });

  it("writes start and finish evidence rows without throwing", async () => {
    prismaMock.cronExecutionHeartbeat.upsert.mockResolvedValue({});
    prismaMock.cronExecutionHeartbeat.findUnique.mockResolvedValue(null);
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });

    await expect(
      recordCronExecutionStarted({
        slug: "webhook-jobs",
        productionTier: true,
        startedAt: new Date("2026-05-25T16:00:00.000Z"),
      }),
    ).resolves.toBeUndefined();

    await expect(
      recordCronExecutionFinished({
        slug: "webhook-jobs",
        productionTier: true,
        startedAt: new Date("2026-05-25T16:00:00.000Z"),
        finishedAt: new Date("2026-05-25T16:00:10.000Z"),
        statusCode: 200,
      }),
    ).resolves.toBeUndefined();

    expect(prismaMock.cronExecutionHeartbeat.upsert).toHaveBeenCalledTimes(2);
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "webhook-jobs",
          eventType: "SUCCEEDED",
          statusCode: 200,
        }),
      }),
    );
  });

  it("auto-escalates repeated critical cron failures into support workflow", async () => {
    prismaMock.cronExecutionHeartbeat.findUnique.mockResolvedValue({
      slug: "webhook-jobs",
      createdAt: new Date("2026-05-25T15:30:00.000Z"),
      updatedAt: new Date("2026-05-25T15:55:00.000Z"),
      lastStartedAt: new Date("2026-05-25T15:55:00.000Z"),
      lastSucceededAt: new Date("2026-05-25T15:40:00.000Z"),
      lastFailedAt: new Date("2026-05-25T15:55:00.000Z"),
      lastDurationMs: 1000,
      lastStatusCode: 500,
      consecutiveFailures: 2,
      lastError: "boom",
      incidentAcknowledgedAt: null,
      incidentAcknowledgedForMarker: null,
      incidentAcknowledgedByUserId: null,
      autoEscalatedAt: null,
      autoEscalatedForMarker: null,
      autoEscalationReason: null,
      autoEscalationTicketId: null,
      autoEscalationTicketRef: null,
    });
    prismaMock.cronExecutionHeartbeat.upsert.mockResolvedValue({});
    prismaMock.cronExecutionHeartbeat.update.mockResolvedValue({});
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});
    prismaMock.supportTicketEvent.create.mockResolvedValue({});
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "team_email_override",
      ownerTeam: "channels",
      assignee: {
        userId: "platform-user-42",
        fullName: "Channels Owner",
        email: "channels@example.com",
      },
      matchedRole: "PLATFORM_ADMIN",
      attemptedOverrideEmail: "channels@example.com",
    });
    createSupportTicketMock.mockResolvedValue({
      ticket: {
        id: "ticket-1",
        subject: "Critical cron auto-escalated: Webhook jobs",
        email: "platform-ops@system.kitchenos.local",
        category: "PRODUCTION",
        priority: "CRITICAL",
      },
      ticketRef: "KS-TICKET1",
    });

    await recordCronExecutionFinished({
      slug: "webhook-jobs",
      productionTier: true,
      startedAt: new Date("2026-05-25T16:00:00.000Z"),
      finishedAt: new Date("2026-05-25T16:00:15.000Z"),
      statusCode: 500,
      error: new Error("still failing"),
    });

    expect(createSupportTicketMock).toHaveBeenCalledWith(
      expect.objectContaining({
        relatedEntityType: "CRON_EXECUTION_INCIDENT",
        assignedToId: "platform-user-42",
        initialStatus: "ESCALATED",
        skipRequesterConfirmation: true,
      }),
    );
    expect(prismaMock.cronExecutionHeartbeat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "webhook-jobs" },
        data: expect.objectContaining({
          autoEscalationTicketId: "ticket-1",
          autoEscalationReason: "repeated_failures",
          autoEscalationTicketRef: "KS-TICKET1",
        }),
      }),
    );
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "AUTO_ESCALATED",
          incidentMarker: "failed:2026-05-25T16:00:15.000Z",
          errorMessage: expect.stringContaining("channels@example.com"),
        }),
      }),
    );
    expect(prismaMock.supportTicketEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          eventType: "ESCALATED",
        }),
      }),
    );
    expect(pageCronEscalationEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "webhook-jobs",
        phase: "auto_escalated",
        ticketId: "ticket-1",
      }),
    );
  });

  it("clears auto-escalation and resolves support ticket after recovery", async () => {
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });
    prismaMock.cronExecutionHeartbeat.findUnique
      .mockResolvedValueOnce({
        slug: "webhook-jobs",
        createdAt: new Date("2026-05-25T15:30:00.000Z"),
        updatedAt: new Date("2026-05-25T15:55:00.000Z"),
        lastStartedAt: new Date("2026-05-25T15:55:00.000Z"),
        lastSucceededAt: new Date("2026-05-25T15:40:00.000Z"),
        lastFailedAt: new Date("2026-05-25T15:55:00.000Z"),
        lastDurationMs: 1000,
        lastStatusCode: 500,
        consecutiveFailures: 3,
        lastError: "boom",
        incidentAcknowledgedAt: null,
        incidentAcknowledgedForMarker: null,
        incidentAcknowledgedByUserId: null,
        autoEscalatedAt: new Date("2026-05-25T15:56:00.000Z"),
        autoEscalatedForMarker: "failed:2026-05-25T15:55:00.000Z",
        autoEscalationReason: "repeated_failures",
        autoEscalationTicketId: "ticket-1",
        autoEscalationTicketRef: "KS-TICKET1",
      })
      .mockResolvedValueOnce({
        slug: "webhook-jobs",
        createdAt: new Date("2026-05-25T15:30:00.000Z"),
        updatedAt: new Date("2026-05-25T16:05:00.000Z"),
        lastStartedAt: new Date("2026-05-25T16:05:00.000Z"),
        lastSucceededAt: new Date("2026-05-25T16:05:00.000Z"),
        lastFailedAt: new Date("2026-05-25T15:55:00.000Z"),
        lastDurationMs: 900,
        lastStatusCode: 200,
        consecutiveFailures: 0,
        lastError: null,
        autoEscalatedAt: new Date("2026-05-25T15:56:00.000Z"),
        autoEscalatedForMarker: "failed:2026-05-25T15:55:00.000Z",
        autoEscalationReason: "repeated_failures",
        autoEscalationTicketId: "ticket-1",
        autoEscalationTicketRef: "KS-TICKET1",
      });
    prismaMock.cronExecutionHeartbeat.upsert.mockResolvedValue({});
    prismaMock.cronExecutionHeartbeat.update.mockResolvedValue({});
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});
    prismaMock.supportTicket.findUnique.mockResolvedValue({
      id: "ticket-1",
      status: "ESCALATED",
      resolutionSummary: null,
    });
    prismaMock.supportTicket.update.mockResolvedValue({});
    prismaMock.supportTicketEvent.create.mockResolvedValue({});

    await recordCronExecutionFinished({
      slug: "webhook-jobs",
      productionTier: true,
      startedAt: new Date("2026-05-25T16:05:00.000Z"),
      finishedAt: new Date("2026-05-25T16:05:05.000Z"),
      statusCode: 200,
    });

    expect(prismaMock.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-1" },
        data: expect.objectContaining({
          status: "RESOLVED",
        }),
      }),
    );
    expect(prismaMock.cronExecutionHeartbeat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "webhook-jobs" },
        data: expect.objectContaining({
          autoEscalatedAt: null,
          autoEscalationTicketId: null,
        }),
      }),
    );
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "AUTO_ESCALATION_CLEARED",
        }),
      }),
    );
  });

  it("builds an audit report with priority ordering and recovery metadata", async () => {
    process.env.NODE_ENV = "test";
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });
    prismaMock.cronExecutionHeartbeat.findMany
      .mockResolvedValueOnce([
        { slug: "webhook-jobs" },
        { slug: "doordash-sync" },
        { slug: "reminders" },
      ])
      .mockResolvedValueOnce([
        {
          slug: "webhook-jobs",
          createdAt: new Date("2026-05-25T15:00:00.000Z"),
          updatedAt: new Date("2026-05-25T15:59:00.000Z"),
          lastStartedAt: new Date("2026-05-25T15:59:00.000Z"),
          lastSucceededAt: new Date("2026-05-25T15:59:00.000Z"),
          lastFailedAt: null,
          lastDurationMs: 1100,
          lastStatusCode: 200,
          consecutiveFailures: 0,
          lastError: null,
          incidentAcknowledgedAt: null,
          incidentAcknowledgedForMarker: null,
          incidentAcknowledgedByUserId: null,
          incidentAcknowledger: null,
        },
        {
          slug: "doordash-sync",
          createdAt: new Date("2026-05-25T15:00:00.000Z"),
          updatedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastStartedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastSucceededAt: new Date("2026-05-25T15:40:00.000Z"),
          lastFailedAt: new Date("2026-05-25T15:58:00.000Z"),
          lastDurationMs: 4200,
          lastStatusCode: 500,
          consecutiveFailures: 3,
          lastError: "DoorDash upstream 500",
          incidentAcknowledgedAt: new Date("2026-05-25T15:59:00.000Z"),
          incidentAcknowledgedForMarker: "failed:2026-05-25T15:58:00.000Z",
          incidentAcknowledgedByUserId: "user-1",
          incidentAcknowledger: { id: "user-1", fullName: "Ops Admin", email: "ops@example.com" },
        },
        {
          slug: "reminders",
          createdAt: new Date("2026-05-24T12:00:00.000Z"),
          updatedAt: new Date("2026-05-24T12:00:00.000Z"),
          lastStartedAt: null,
          lastSucceededAt: null,
          lastFailedAt: null,
          lastDurationMs: null,
          lastStatusCode: null,
          consecutiveFailures: 0,
          lastError: null,
          incidentAcknowledgedAt: null,
          incidentAcknowledgedForMarker: null,
          incidentAcknowledgedByUserId: null,
          incidentAcknowledger: null,
        },
      ]);
    prismaMock.cronExecutionHeartbeat.createMany.mockResolvedValue({ count: 12 });

    const report = await loadProductionCronExecutionAudit(new Date("2026-05-25T16:00:00.000Z"));

    expect(report.summary.failing).toBe(1);
    expect(report.summary.healthy).toBe(1);
    expect(report.summary.attentionRequired).toBe(1);
    expect(report.summary.acknowledgedIncidents).toBe(1);
    expect(report.summary.openIncidents).toBe(0);
    expect(report.rows[0]?.slug).toBe("doordash-sync");
    expect(report.rows[0]).toEqual(
      expect.objectContaining({
        critical: true,
        ownerHref: "/dashboard/sales-channels/health",
        ownerLabel: "Open channel health",
        status: "failing",
        incidentState: "acknowledged",
        incidentAcknowledgedByName: "Ops Admin",
      }),
    );
    expect(report.rows.find((row) => row.slug === "reminders")).toEqual(
      expect.objectContaining({
        critical: false,
        ownerHref: "/dashboard/notifications",
        status: "pending_initial_run",
        incidentState: "none",
      }),
    );
  });

  it("surfaces stalled auto-escalations when first response is overdue", async () => {
    process.env.NODE_ENV = "test";
    prismaMock.cronExecutionHeartbeat.findMany
      .mockResolvedValueOnce([{ slug: "webhook-jobs" }])
      .mockResolvedValueOnce([
        {
          slug: "webhook-jobs",
          createdAt: new Date("2026-05-25T12:00:00.000Z"),
          updatedAt: new Date("2026-05-25T12:58:00.000Z"),
          lastStartedAt: new Date("2026-05-25T12:58:00.000Z"),
          lastSucceededAt: new Date("2026-05-25T12:40:00.000Z"),
          lastFailedAt: new Date("2026-05-25T12:58:00.000Z"),
          lastDurationMs: 1800,
          lastStatusCode: 500,
          consecutiveFailures: 4,
          lastError: "still failing",
          incidentAcknowledgedAt: null,
          incidentAcknowledgedForMarker: null,
          incidentAcknowledgedByUserId: null,
          incidentAcknowledger: null,
          autoEscalatedAt: new Date("2026-05-25T13:00:00.000Z"),
          autoEscalatedForMarker: "failed:2026-05-25T12:58:00.000Z",
          autoEscalationReason: "repeated_failures",
          autoEscalationTicketId: "ticket-1",
          autoEscalationTicketRef: "KS-TICKET1",
        },
      ]);
    prismaMock.cronExecutionHeartbeat.createMany.mockResolvedValue({ count: 12 });
    prismaMock.supportTicket.findMany.mockResolvedValue([
      {
        id: "ticket-1",
        status: "ESCALATED",
        assignedToId: "platform-user-1",
        firstResponseAt: null,
        createdAt: new Date("2026-05-25T13:00:00.000Z"),
        workspaceId: null,
        priority: "CRITICAL",
        category: "PRODUCTION",
        assignedTo: {
          id: "platform-user-1",
          fullName: "Ops Owner",
          email: "ops.owner@example.com",
        },
      },
    ]);
    prismaMock.supportSlaPolicy.findMany.mockResolvedValue([]);

    const report = await loadProductionCronExecutionAudit(new Date("2026-05-25T15:30:00.000Z"));

    expect(report.summary.stalledAutoEscalations).toBe(1);
    expect(report.summary.firstResponseOverdueAutoEscalations).toBe(1);
    expect(report.rows[0]).toEqual(
      expect.objectContaining({
        autoEscalationEngagementState: "first_response_overdue",
        autoEscalationAssignedToName: "Ops Owner",
        autoEscalationFirstResponseDueAt: "2026-05-25T14:00:00.000Z",
      }),
    );
  });

  it("auto-reroutes a stalled escalated ticket when an alternate owner exists", async () => {
    process.env.NODE_ENV = "production";
    prismaMock.cronExecutionHeartbeat.findMany.mockResolvedValue([
      {
        slug: "webhook-jobs",
        createdAt: new Date("2026-05-25T12:00:00.000Z"),
        updatedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastStartedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastSucceededAt: new Date("2026-05-25T12:40:00.000Z"),
        lastFailedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastDurationMs: 1800,
        lastStatusCode: 500,
        consecutiveFailures: 4,
        lastError: "still failing",
        incidentAcknowledgedAt: null,
        incidentAcknowledgedForMarker: null,
        incidentAcknowledgedByUserId: null,
        incidentAcknowledger: null,
        autoEscalatedAt: new Date("2026-05-25T13:00:00.000Z"),
        autoEscalatedForMarker: "failed:2026-05-25T12:58:00.000Z",
        autoEscalationReason: "repeated_failures",
        autoEscalationTicketId: "ticket-1",
        autoEscalationTicketRef: "KS-TICKET1",
        autoEscalationFollowUpAt: null,
        autoEscalationFollowUpForMarker: null,
        autoEscalationFollowUpKind: null,
      },
    ]);
    prismaMock.cronExecutionHeartbeat.createMany.mockResolvedValue({ count: 0 });
    prismaMock.cronExecutionHeartbeat.update.mockResolvedValue({});
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});
    prismaMock.supportTicket.findMany
      .mockResolvedValueOnce([
        {
          id: "ticket-1",
          subject: "Critical cron auto-escalated: Webhook job drain",
          email: "platform-ops@system.kitchenos.local",
          status: "ESCALATED",
          assignedToId: "platform-user-1",
          firstResponseAt: null,
          createdAt: new Date("2026-05-25T13:00:00.000Z"),
          workspaceId: null,
          priority: "CRITICAL",
          category: "PRODUCTION",
          assignedTo: {
            id: "platform-user-1",
            fullName: "Current Owner",
            email: "current.owner@example.com",
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "ticket-1",
          subject: "Critical cron auto-escalated: Webhook job drain",
          email: "platform-ops@system.kitchenos.local",
          status: "ESCALATED",
          assignedToId: "platform-user-2",
          firstResponseAt: null,
          createdAt: new Date("2026-05-25T13:00:00.000Z"),
          workspaceId: null,
          priority: "CRITICAL",
          category: "PRODUCTION",
          assignedTo: {
            id: "platform-user-2",
            fullName: "Fallback Owner",
            email: "fallback.owner@example.com",
          },
        },
      ]);
    prismaMock.supportTicket.update.mockResolvedValue({});
    prismaMock.supportTicketEvent.create.mockResolvedValue({});
    prismaMock.supportSlaPolicy.findMany.mockResolvedValue([]);
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "role_fallback",
      ownerTeam: "channels",
      assignee: {
        userId: "platform-user-2",
        fullName: "Fallback Owner",
        email: "fallback.owner@example.com",
      },
      matchedRole: "SUPPORT_ADMIN",
      attemptedOverrideEmail: null,
    });

    await loadProductionCronExecutionAudit(new Date("2026-05-25T15:30:00.000Z"));

    expect(prismaMock.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-1" },
        data: expect.objectContaining({
          assignedToId: "platform-user-2",
        }),
      }),
    );
    expect(prismaMock.supportTicketEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          eventType: "ASSIGNED",
          metadataJson: expect.objectContaining({
            source: "cron_auto_escalation_follow_up",
            reason: "first_response_overdue",
          }),
        }),
      }),
    );
    expect(prismaMock.cronExecutionHeartbeat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "webhook-jobs" },
        data: expect.objectContaining({
          autoEscalationFollowUpKind: "rerouted",
          autoEscalationFollowUpForMarker: "failed:2026-05-25T12:58:00.000Z",
        }),
      }),
    );
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "AUTO_ESCALATION_REROUTED",
        }),
      }),
    );
    expect(pageCronEscalationEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "webhook-jobs",
        phase: "auto_rerouted",
        ticketId: "ticket-1",
      }),
    );
  });

  it("emits a reminder when stalled escalation has no alternate owner", async () => {
    process.env.NODE_ENV = "production";
    prismaMock.cronExecutionHeartbeat.findMany.mockResolvedValue([
      {
        slug: "webhook-jobs",
        createdAt: new Date("2026-05-25T12:00:00.000Z"),
        updatedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastStartedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastSucceededAt: new Date("2026-05-25T12:40:00.000Z"),
        lastFailedAt: new Date("2026-05-25T12:58:00.000Z"),
        lastDurationMs: 1800,
        lastStatusCode: 500,
        consecutiveFailures: 4,
        lastError: "still failing",
        incidentAcknowledgedAt: null,
        incidentAcknowledgedForMarker: null,
        incidentAcknowledgedByUserId: null,
        incidentAcknowledger: null,
        autoEscalatedAt: new Date("2026-05-25T13:00:00.000Z"),
        autoEscalatedForMarker: "failed:2026-05-25T12:58:00.000Z",
        autoEscalationReason: "repeated_failures",
        autoEscalationTicketId: "ticket-1",
        autoEscalationTicketRef: "KS-TICKET1",
        autoEscalationFollowUpAt: null,
        autoEscalationFollowUpForMarker: null,
        autoEscalationFollowUpKind: null,
      },
    ]);
    prismaMock.cronExecutionHeartbeat.createMany.mockResolvedValue({ count: 0 });
    prismaMock.cronExecutionHeartbeat.update.mockResolvedValue({});
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});
    prismaMock.supportTicket.findMany
      .mockResolvedValueOnce([
        {
          id: "ticket-1",
          subject: "Critical cron auto-escalated: Webhook job drain",
          email: "platform-ops@system.kitchenos.local",
          status: "ESCALATED",
          assignedToId: null,
          firstResponseAt: null,
          createdAt: new Date("2026-05-25T13:00:00.000Z"),
          workspaceId: null,
          priority: "CRITICAL",
          category: "PRODUCTION",
          assignedTo: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "ticket-1",
          subject: "Critical cron auto-escalated: Webhook job drain",
          email: "platform-ops@system.kitchenos.local",
          status: "ESCALATED",
          assignedToId: null,
          firstResponseAt: null,
          createdAt: new Date("2026-05-25T13:00:00.000Z"),
          workspaceId: null,
          priority: "CRITICAL",
          category: "PRODUCTION",
          assignedTo: null,
        },
      ]);
    prismaMock.supportTicket.update.mockResolvedValue({});
    prismaMock.supportTicketEvent.create.mockResolvedValue({});
    prismaMock.supportSlaPolicy.findMany.mockResolvedValue([]);
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });

    await loadProductionCronExecutionAudit(new Date("2026-05-25T13:30:00.000Z"));

    expect(prismaMock.supportTicket.update).not.toHaveBeenCalled();
    expect(prismaMock.supportTicketEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          eventType: "SLA_WARNING",
          metadataJson: expect.objectContaining({
            source: "cron_auto_escalation_follow_up",
            reason: "unassigned",
          }),
        }),
      }),
    );
    expect(prismaMock.cronExecutionHeartbeat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "webhook-jobs" },
        data: expect.objectContaining({
          autoEscalationFollowUpKind: "reminded",
        }),
      }),
    );
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "AUTO_ESCALATION_REMINDED",
        }),
      }),
    );
    expect(pageCronEscalationEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "webhook-jobs",
        phase: "auto_reminded",
        ticketId: "ticket-1",
      }),
    );
  });

  it("acknowledges and clears the current degraded cycle marker", async () => {
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });
    prismaMock.cronExecutionHeartbeat.findMany.mockResolvedValue([{ slug: "webhook-jobs" }]);
    prismaMock.cronExecutionHeartbeat.findUnique.mockResolvedValue({
      slug: "webhook-jobs",
      createdAt: new Date("2026-05-25T15:00:00.000Z"),
      updatedAt: new Date("2026-05-25T15:58:00.000Z"),
      lastStartedAt: new Date("2026-05-25T15:58:00.000Z"),
      lastSucceededAt: new Date("2026-05-25T15:40:00.000Z"),
      lastFailedAt: new Date("2026-05-25T15:58:00.000Z"),
      lastDurationMs: 1200,
      lastStatusCode: 500,
      consecutiveFailures: 1,
      lastError: "boom",
      incidentAcknowledgedAt: null,
      incidentAcknowledgedForMarker: null,
      incidentAcknowledgedByUserId: null,
    });
    prismaMock.cronExecutionHeartbeat.upsert.mockResolvedValue({});
    prismaMock.cronExecutionHeartbeat.update.mockResolvedValue({});
    prismaMock.cronExecutionEvent.create.mockResolvedValue({});

    await expect(
      acknowledgeCronIncident({
        slug: "webhook-jobs",
        acknowledgedByUserId: "platform-user-1",
        now: new Date("2026-05-25T16:00:00.000Z"),
      }),
    ).resolves.toEqual({
      ok: true,
      incidentMarker: "failed:2026-05-25T15:58:00.000Z",
    });

    expect(prismaMock.cronExecutionHeartbeat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "webhook-jobs" },
        data: expect.objectContaining({
          incidentAcknowledgedByUserId: "platform-user-1",
          incidentAcknowledgedForMarker: "failed:2026-05-25T15:58:00.000Z",
        }),
      }),
    );
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "webhook-jobs",
          eventType: "ACKNOWLEDGED",
          actorUserId: "platform-user-1",
        }),
      }),
    );

    await expect(
      clearCronIncidentAcknowledgement({ slug: "webhook-jobs", actorUserId: "platform-user-1" }),
    ).resolves.toEqual({
      ok: true,
      incidentMarker: "failed:2026-05-25T15:58:00.000Z",
    });
    expect(prismaMock.cronExecutionEvent.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "webhook-jobs",
          eventType: "REOPENED",
          actorUserId: "platform-user-1",
        }),
      }),
    );
  });

  it("builds redacted timeline items from append-only cron events", async () => {
    resolveCronEscalationAssignmentMock.mockResolvedValue({
      resolution: "unassigned",
      ownerTeam: "channels",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });
    prismaMock.cronExecutionEvent.findMany.mockResolvedValue([
      {
        id: "evt-1",
        slug: "webhook-jobs",
        eventType: "FAILED",
        productionTier: true,
        statusCode: 500,
        durationMs: 1800,
        errorMessage: "Webhook auth failed for ops@example.com token=super-secret",
        incidentMarker: "failed:2026-05-25T15:58:00.000Z",
        actorUserId: null,
        createdAt: new Date("2026-05-25T15:58:00.000Z"),
        actorUserProfile: null,
      },
      {
        id: "evt-2",
        slug: "webhook-jobs",
        eventType: "ACKNOWLEDGED",
        productionTier: true,
        statusCode: null,
        durationMs: null,
        errorMessage: null,
        incidentMarker: "failed:2026-05-25T15:58:00.000Z",
        actorUserId: "platform-user-1",
        createdAt: new Date("2026-05-25T16:00:00.000Z"),
        actorUserProfile: { id: "platform-user-1", fullName: "Ops Admin", email: "ops@example.com" },
      },
    ]);

    const items = await loadCronExecutionTimelineItems("webhook-jobs", 10);

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(
      expect.objectContaining({
        title: "Cron run failed",
        severity: "CRITICAL",
      }),
    );
    expect(items[0]?.subtitle).toContain("status 500");
    expect(items[0]?.subtitle).toContain("[REDACTED_EMAIL]");
    expect(items[1]).toEqual(
      expect.objectContaining({
        title: "Incident acknowledged",
        severity: "WARNING",
      }),
    );
  });
});
