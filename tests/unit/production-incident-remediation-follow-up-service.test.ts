import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  productionIncident: {
    findMany: vi.fn(),
  },
  productionIncidentEvent: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  platformUserRole: {
    findMany: vi.fn(),
  },
}));
const fireInternalAlertMock = vi.hoisted(() => vi.fn());
const emitOpsSignalMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/notifications/alert-service", () => ({
  fireInternalAlert: fireInternalAlertMock,
}));
vi.mock("@/services/observability/ops-signals", () => ({
  emitOpsSignal: emitOpsSignalMock,
}));

import { runProductionIncidentRemediationFollowUp } from "@/services/incidents/production-incident-remediation-follow-up-service";

describe("production incident remediation follow-up service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.productionIncidentEvent.findFirst.mockResolvedValue(null);
    prismaMock.productionIncidentEvent.create.mockResolvedValue({});
  });

  it("sends due-soon and overdue remediation alerts with escalation routing", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-due-soon",
        title: "Startup readiness blocker",
        source: "startup_readiness",
        href: "/dashboard/system-health",
        workflowStatus: "RESOLVED",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "configuration",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        remediationDueAt: new Date("2026-05-26T12:00:00.000Z"),
        remediationOwnerId: "owner-1",
        assignedToId: "manager-1",
        remediationOwner: { id: "owner-1", email: "owner@example.com", fullName: "Owner One" },
        assignedTo: { id: "manager-1", email: "manager@example.com", fullName: "Manager One" },
      },
      {
        id: "incident-overdue",
        title: "Webhook recovery blockers",
        source: "webhook_recovery",
        href: "/platform/webhooks",
        workflowStatus: "MONITORING",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "third_party",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        remediationDueAt: new Date("2026-05-21T23:59:59.999Z"),
        remediationOwnerId: "owner-2",
        assignedToId: "owner-2",
        remediationOwner: { id: "owner-2", email: "owner2@example.com", fullName: "Owner Two" },
        assignedTo: { id: "owner-2", email: "owner2@example.com", fullName: "Owner Two" },
      },
      {
        id: "incident-reassign",
        title: "DoorDash sync follow-up",
        source: "critical_cron",
        href: "/platform/incidents",
        workflowStatus: "ACKNOWLEDGED",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationControlStatus: "REASSIGNMENT_REQUESTED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Current owner cannot complete the partner outreach.",
        remediationDueAt: new Date("2026-05-27T23:59:59.999Z"),
        remediationOwnerId: "owner-3",
        assignedToId: "manager-2",
        remediationOwner: { id: "owner-3", email: "owner3@example.com", fullName: "Owner Three" },
        assignedTo: { id: "manager-2", email: "manager2@example.com", fullName: "Manager Two" },
      },
    ]);
    prismaMock.platformUserRole.findMany.mockResolvedValue([
      {
        userId: "fallback-1",
        role: "PLATFORM_ADMIN",
        user: { email: "fallback@example.com", fullName: "Fallback Admin" },
      },
    ]);
    fireInternalAlertMock
      .mockResolvedValueOnce({ ok: true, status: "SENT", logId: "log-1" })
      .mockResolvedValueOnce({ ok: true, status: "SENT", logId: "log-2" })
      .mockResolvedValueOnce({ ok: true, status: "SENT", logId: "log-3" })
      .mockResolvedValueOnce({ ok: true, status: "SENT", logId: "log-4" });

    const result = await runProductionIncidentRemediationFollowUp(now);

    expect(result).toEqual({
      scanned: 3,
      dueSoonCandidates: 1,
      overdueCandidates: 1,
      ownerAlertsLogged: 2,
      ownerAlertsDelivered: 2,
      escalationAlertsLogged: 2,
      escalationAlertsDelivered: 2,
      skippedMissingOwner: 0,
      skippedMissingEscalationRecipient: 0,
    });
    expect(fireInternalAlertMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        triggerType: "INCIDENT_REMEDIATION_DUE_SOON",
        sourceId: "incident-due-soon:due_soon:2026-05-26",
        recipientEmail: "owner@example.com",
      }),
    );
    expect(fireInternalAlertMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        triggerType: "INCIDENT_REMEDIATION_OVERDUE",
        sourceId: "incident-overdue:overdue:2026-05-25",
        recipientEmail: "owner2@example.com",
      }),
    );
    expect(fireInternalAlertMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        triggerType: "INCIDENT_REMEDIATION_ESCALATED",
        sourceId: "incident-overdue:escalated:2026-05-25",
        recipientEmail: "fallback@example.com",
      }),
    );
    expect(fireInternalAlertMock).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        triggerType: "INCIDENT_REMEDIATION_REASSIGNMENT_REQUESTED",
        sourceId: "incident-reassign:reassignment_requested:2026-05-25",
        recipientEmail: "manager2@example.com",
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenCalledTimes(4);
    expect(emitOpsSignalMock).toHaveBeenCalledWith(
      "incident_remediation_follow_up",
      expect.objectContaining({
        phase: "reassignment_requested",
        recipientEmail: "manager2@example.com",
      }),
    );
  });

  it("counts legacy incidents without owner or escalation target as skipped", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-legacy",
        title: "Legacy remediation row",
        source: "critical_cron",
        href: "/platform/incidents",
        workflowStatus: "RESOLVED",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "unknown",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        remediationDueAt: new Date("2026-05-20T23:59:59.999Z"),
        remediationOwnerId: null,
        assignedToId: null,
        remediationOwner: null,
        assignedTo: null,
      },
    ]);
    prismaMock.platformUserRole.findMany.mockResolvedValue([]);

    const result = await runProductionIncidentRemediationFollowUp(now);

    expect(result).toEqual({
      scanned: 1,
      dueSoonCandidates: 0,
      overdueCandidates: 1,
      ownerAlertsLogged: 0,
      ownerAlertsDelivered: 0,
      escalationAlertsLogged: 0,
      escalationAlertsDelivered: 0,
      skippedMissingOwner: 1,
      skippedMissingEscalationRecipient: 1,
    });
    expect(fireInternalAlertMock).not.toHaveBeenCalled();
    expect(emitOpsSignalMock).toHaveBeenCalledWith(
      "incident_remediation_follow_up",
      expect.objectContaining({
        incidentId: "incident-legacy",
        phase: "escalated",
        recipientEmail: null,
      }),
    );
  });

  it("suppresses follow-up while remediation is snoozed into the future", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-snoozed",
        title: "Storefront edge sync",
        source: "critical_cron",
        href: "/platform/incidents",
        workflowStatus: "MONITORING",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "dependency",
        remediationControlStatus: "SNOOZED",
        remediationSnoozedUntil: new Date("2026-05-30T23:59:59.999Z"),
        remediationControlSummary: "Waiting for upstream provider patch window.",
        remediationDueAt: new Date("2026-05-25T12:00:00.000Z"),
        remediationOwnerId: "owner-1",
        assignedToId: "owner-1",
        remediationOwner: { id: "owner-1", email: "owner@example.com", fullName: "Owner One" },
        assignedTo: { id: "owner-1", email: "owner@example.com", fullName: "Owner One" },
      },
    ]);
    prismaMock.platformUserRole.findMany.mockResolvedValue([]);

    const result = await runProductionIncidentRemediationFollowUp(now);

    expect(result).toEqual({
      scanned: 1,
      dueSoonCandidates: 0,
      overdueCandidates: 0,
      ownerAlertsLogged: 0,
      ownerAlertsDelivered: 0,
      escalationAlertsLogged: 0,
      escalationAlertsDelivered: 0,
      skippedMissingOwner: 0,
      skippedMissingEscalationRecipient: 0,
    });
    expect(fireInternalAlertMock).not.toHaveBeenCalled();
    expect(prismaMock.productionIncidentEvent.create).not.toHaveBeenCalled();
  });
});
