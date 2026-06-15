import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  productionIncident: {
    findMany: vi.fn(),
  },
  productionIncidentEvent: {
    findMany: vi.fn(),
  },
  kitchenTask: {
    findMany: vi.fn(),
  },
}));
const loadProductionIncidentRollupMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/incidents/production-incident-rollup-service", () => ({
  loadProductionIncidentRollup: loadProductionIncidentRollupMock,
}));

import { loadProductionIncidentExecutiveSnapshot } from "@/services/incidents/production-incident-reporting-service";

describe("production incident reporting service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes SLA, aging, and response metrics from persistent incidents", async () => {
    loadProductionIncidentRollupMock.mockResolvedValue({
      summary: {
        open: 2,
        critical: 1,
        high: 1,
        startupReadiness: 1,
        criticalCron: 1,
        webhookRecovery: 0,
      },
      items: [],
      timeline: [],
    });

    const now = new Date("2026-05-25T18:00:00.000Z");
    const analyticsRows = [
      {
        id: "incident-open-critical",
        title: "Critical startup readiness blocker",
        severity: "critical",
        workflowStatus: "OPEN",
        reviewStatus: "PENDING",
        rootCauseCategory: null,
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        source: "startup_readiness",
        sourceKey: "startup:rate_limit",
        href: "/dashboard/system-health",
        ownerLabel: "Platform runtime",
        assignedToId: null,
        remediationOwnerId: null,
        remediationDueAt: null,
        firstSeenAt: new Date("2026-05-25T16:00:00.000Z"),
        lastSeenAt: new Date("2026-05-25T17:50:00.000Z"),
        acknowledgedAt: null,
        resolvedAt: null,
        metadataJson: { issueId: "rate_limit" },
        assignedTo: null,
        remediationOwner: null,
      },
      {
        id: "incident-open-high",
        title: "Webhook recovery blockers",
        severity: "high",
        workflowStatus: "MONITORING",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "third_party",
        remediationControlStatus: "SNOOZED",
        remediationSnoozedUntil: new Date("2026-05-28T23:59:59.999Z"),
        remediationControlSummary: "Provider maintenance freeze was accepted by platform.",
        source: "webhook_recovery",
        sourceKey: "webhook-recovery:open",
        href: "/platform/webhooks",
        ownerLabel: "Open webhooks",
        assignedToId: "owner-1",
        remediationOwnerId: "owner-1",
        remediationDueAt: new Date("2026-05-25T12:00:00.000Z"),
        firstSeenAt: new Date("2026-05-24T10:00:00.000Z"),
        lastSeenAt: new Date("2026-05-25T17:55:00.000Z"),
        acknowledgedAt: new Date("2026-05-24T10:30:00.000Z"),
        resolvedAt: null,
        metadataJson: { latestProvider: "SHOPIFY" },
        assignedTo: { fullName: "Ops Owner", email: "ops@example.com" },
        remediationOwner: { fullName: "Ops Owner", email: "ops@example.com" },
      },
      {
        id: "incident-reassign",
        title: "Partner escalation handoff",
        severity: "medium",
        workflowStatus: "ACKNOWLEDGED",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationControlStatus: "REASSIGNMENT_REQUESTED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Current owner cannot complete vendor follow-up.",
        source: "critical_cron",
        sourceKey: "critical-cron:partner-sync:failed:2026-05-24T08:00:00.000Z",
        href: "/platform/incidents",
        ownerLabel: "Platform operations",
        assignedToId: "manager-2",
        remediationOwnerId: "owner-2",
        remediationDueAt: new Date("2026-05-29T12:00:00.000Z"),
        firstSeenAt: new Date("2026-05-24T08:00:00.000Z"),
        lastSeenAt: new Date("2026-05-25T17:40:00.000Z"),
        acknowledgedAt: new Date("2026-05-24T08:20:00.000Z"),
        resolvedAt: null,
        metadataJson: { slug: "partner-sync" },
        assignedTo: { fullName: "Platform Lead", email: "lead@example.com" },
        remediationOwner: { fullName: "Ops Owner Two", email: "ops2@example.com" },
      },
      {
        id: "incident-resolved",
        title: "Critical cron incident: Webhook job drain",
        severity: "critical",
        workflowStatus: "RESOLVED",
        reviewStatus: "COMPLETED",
        rootCauseCategory: "configuration",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        source: "critical_cron",
        sourceKey: "critical-cron:webhook-jobs:failed:2026-05-20T10:00:00.000Z",
        href: "/dashboard/system-health/cron-execution/webhook-jobs",
        ownerLabel: "Ops Owner",
        assignedToId: "owner-1",
        remediationOwnerId: "owner-1",
        remediationDueAt: null,
        firstSeenAt: new Date("2026-05-20T10:00:00.000Z"),
        lastSeenAt: new Date("2026-05-20T11:55:00.000Z"),
        acknowledgedAt: new Date("2026-05-20T10:10:00.000Z"),
        resolvedAt: new Date("2026-05-20T12:00:00.000Z"),
        metadataJson: { slug: "webhook-jobs" },
        assignedTo: { fullName: "Ops Owner", email: "ops@example.com" },
        remediationOwner: { fullName: "Ops Owner", email: "ops@example.com" },
      },
    ];
    prismaMock.productionIncident.findMany
      .mockResolvedValueOnce(analyticsRows)
      .mockResolvedValueOnce([
        ...analyticsRows,
        {
          id: "incident-startup-reopen",
          title: "Critical startup readiness blocker",
          severity: "critical",
          workflowStatus: "OPEN",
          reviewStatus: "PENDING",
          rootCauseCategory: null,
          remediationControlStatus: "TRACKING",
          remediationSnoozedUntil: null,
          remediationControlSummary: null,
          source: "startup_readiness",
          sourceKey: "startup:rate_limit",
          href: "/dashboard/system-health",
          ownerLabel: "Platform runtime",
          assignedToId: null,
          remediationOwnerId: null,
          remediationDueAt: null,
          firstSeenAt: new Date("2026-05-10T16:00:00.000Z"),
          lastSeenAt: new Date("2026-05-25T17:58:00.000Z"),
          acknowledgedAt: null,
          resolvedAt: null,
          metadataJson: { issueId: "rate_limit" },
          assignedTo: null,
          remediationOwner: null,
        },
      ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([
      {
        id: "task-reassign-1",
        sourceId: "incident-reassign",
        userId: "manager-2",
        title: "Reassign remediation owner: Partner escalation handoff",
        dueAt: new Date("2026-05-25T18:00:00.000Z"),
        priority: "URGENT",
        status: "OPEN",
        createdAt: new Date("2026-05-25T17:50:00.000Z"),
        metadataJson: {
          kind: "production_incident_remediation",
          taskKind: "reassignment",
          incidentId: "incident-reassign",
        },
        userProfile: { fullName: "Platform Lead", email: "lead@example.com" },
      },
    ]);
    prismaMock.productionIncidentEvent.findMany.mockResolvedValue([
      { incidentId: "incident-open-critical" },
      { incidentId: "incident-open-critical" },
    ]);

    const snapshot = await loadProductionIncidentExecutiveSnapshot(now);

    expect(snapshot.report.summary).toEqual({
      open: 3,
      critical: 1,
      high: 1,
      unassigned: 1,
      awaitingAcknowledgement: 1,
      ackOverdue: 1,
      resolutionOverdue: 1,
      agedOver24h: 2,
      agedOver72h: 0,
      resolvedLast30d: 1,
      pendingReview: 1,
      inRemediation: 2,
      completedReview: 1,
      remediationOverdue: 0,
      remediationDueNext7d: 2,
      remediationTracking: 0,
      remediationOwnerEngaged: 0,
      remediationSnoozed: 1,
      remediationReassignmentRequested: 1,
      remediationTaskBacked: 1,
      remediationTaskMissing: 0,
      remediationReassignmentTasks: 1,
      remediationOwnerFollowUpTasks: 0,
      mttaMs: 20 * 60_000,
      mttrMs: 2 * 60 * 60_000,
    });
    expect(snapshot.report.bySource).toEqual({
      startup_readiness: 1,
      critical_cron: 1,
      webhook_recovery: 1,
    });
    expect(snapshot.report.byWorkflow).toEqual({
      OPEN: 1,
      ACKNOWLEDGED: 1,
      MONITORING: 1,
    });
    expect(snapshot.report.byReview).toEqual({
      PENDING: 1,
      IN_REMEDIATION: 2,
      COMPLETED: 1,
    });
    expect(snapshot.report.byRemediationControl).toEqual({
      TRACKING: 0,
      OWNER_ENGAGED: 0,
      SNOOZED: 1,
      REASSIGNMENT_REQUESTED: 1,
    });
    expect(snapshot.report.attention[0]).toEqual(
      expect.objectContaining({
        id: "incident-open-critical",
        ackOverdue: true,
        resolutionOverdue: false,
        unassigned: true,
      }),
    );
    expect(snapshot.report.attention[1]).toEqual(
      expect.objectContaining({
        id: "incident-open-high",
        resolutionOverdue: true,
        assignedToName: "Ops Owner",
      }),
    );
    expect(snapshot.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        id: "incident-open-high",
        remediationControlStatus: "SNOOZED",
        remediationOverdue: false,
        dueWithin7d: true,
        rootCauseCategory: "third_party",
      }),
    );
    expect(snapshot.report.remediationAttention[1]).toEqual(
      expect.objectContaining({
        id: "incident-reassign",
        remediationTaskKind: "reassignment",
        remediationTaskStatus: "OPEN",
        remediationTaskOwnerName: "Platform Lead",
        remediationTaskMissing: false,
      }),
    );
    expect(snapshot.report.rootCauseTrends[0]).toEqual(
      expect.objectContaining({
        category: "third_party",
        incidentCount: 1,
        openCount: 1,
        remediationOverdueCount: 0,
      }),
    );
    expect(snapshot.report.repeatOffenders[0]).toEqual(
      expect.objectContaining({
        familyKey: "startup:rate_limit",
        cycleCount: 4,
        openCount: 2,
        pendingReviewCount: 2,
      }),
    );
  });
});
