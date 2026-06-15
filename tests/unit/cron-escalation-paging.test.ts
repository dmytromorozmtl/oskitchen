import { beforeEach, describe, expect, it, vi } from "vitest";

const fireInternalAlertMock = vi.hoisted(() => vi.fn());
const emitOpsSignalMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/notifications/alert-service", () => ({
  fireInternalAlert: fireInternalAlertMock,
}));
vi.mock("@/services/observability/ops-signals", () => ({
  emitOpsSignal: emitOpsSignalMock,
}));

import { pageCronEscalationEvent } from "@/services/cron/cron-escalation-paging";

describe("cron escalation paging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits ops signal and internal alert for assigned recipient", async () => {
    fireInternalAlertMock.mockResolvedValue({ ok: true, status: "SENT", logId: "log-1" });

    await pageCronEscalationEvent({
      slug: "webhook-jobs",
      incidentMarker: "failed:2026-05-25T16:00:00.000Z",
      phase: "auto_rerouted",
      ticketId: "ticket-1",
      ticketRef: "KS-TICKET1",
      ticketSubject: "Critical cron auto-escalated: Webhook job drain",
      recipient: {
        userId: "user-1",
        email: "owner@example.com",
        fullName: "Owner",
      },
      reason: "Escalation rerouted after first_response_overdue.",
    });

    expect(emitOpsSignalMock).toHaveBeenCalledWith(
      "cron_escalation_follow_up",
      expect.objectContaining({
        slug: "webhook-jobs",
        phase: "auto_rerouted",
        recipientEmail: "owner@example.com",
      }),
    );
    expect(fireInternalAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        templateKey: "internal_cron_escalation",
        triggerType: "CRON_AUTO_REROUTED",
        sourceType: "CRON_EXECUTION_INCIDENT",
        sourceId: "webhook-jobs:failed:2026-05-25T16:00:00.000Z:auto_rerouted",
        recipientEmail: "owner@example.com",
      }),
    );
  });

  it("still emits ops signal when no recipient exists", async () => {
    await pageCronEscalationEvent({
      slug: "webhook-jobs",
      incidentMarker: "failed:2026-05-25T16:00:00.000Z",
      phase: "auto_reminded",
      ticketId: "ticket-1",
      ticketRef: "KS-TICKET1",
      ticketSubject: "Critical cron auto-escalated: Webhook job drain",
      recipient: null,
      reason: "Escalation is still unassigned.",
    });

    expect(emitOpsSignalMock).toHaveBeenCalledWith(
      "cron_escalation_follow_up",
      expect.objectContaining({
        recipientEmail: null,
      }),
    );
    expect(fireInternalAlertMock).not.toHaveBeenCalled();
  });
});
