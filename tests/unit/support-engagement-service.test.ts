import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveSlaFirstResponseMinutesMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/support/sla-service", () => ({
  resolveSlaFirstResponseMinutes: resolveSlaFirstResponseMinutesMock,
}));

import {
  computeSupportTicketFirstResponseDueAt,
  deriveSupportEscalationEngagementState,
  resolveFirstResponseStamp,
} from "@/services/support/support-engagement-service";

describe("support engagement service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stamps first response only for triage or assigned owner actions", () => {
    const now = new Date("2026-05-25T16:00:00.000Z");
    expect(
      resolveFirstResponseStamp(
        {
          firstResponseAt: null,
          actorCanTriage: true,
          actorIsAssignedOwner: false,
        },
        now,
      )?.toISOString(),
    ).toBe("2026-05-25T16:00:00.000Z");

    expect(
      resolveFirstResponseStamp(
        {
          firstResponseAt: null,
          actorCanTriage: false,
          actorIsAssignedOwner: false,
        },
        now,
      ),
    ).toBeNull();

    expect(
      resolveFirstResponseStamp(
        {
          firstResponseAt: new Date("2026-05-25T15:00:00.000Z"),
          actorCanTriage: true,
          actorIsAssignedOwner: true,
        },
        now,
      )?.toISOString(),
    ).toBe("2026-05-25T15:00:00.000Z");
  });

  it("derives escalation engagement states from assignment and first response", () => {
    const now = new Date("2026-05-25T16:00:00.000Z");
    const dueAt = new Date("2026-05-25T15:00:00.000Z");

    expect(
      deriveSupportEscalationEngagementState({ ticket: null, firstResponseDueAt: null, now }),
    ).toBe("missing_ticket");
    expect(
      deriveSupportEscalationEngagementState({
        ticket: {
          status: "ESCALATED",
          assignedToId: null,
          firstResponseAt: null,
        },
        firstResponseDueAt: dueAt,
        now,
      }),
    ).toBe("unassigned");
    expect(
      deriveSupportEscalationEngagementState({
        ticket: {
          status: "ESCALATED",
          assignedToId: "owner-1",
          firstResponseAt: null,
        },
        firstResponseDueAt: new Date("2026-05-25T17:00:00.000Z"),
        now,
      }),
    ).toBe("awaiting_first_response");
    expect(
      deriveSupportEscalationEngagementState({
        ticket: {
          status: "ESCALATED",
          assignedToId: "owner-1",
          firstResponseAt: null,
        },
        firstResponseDueAt: dueAt,
        now,
      }),
    ).toBe("first_response_overdue");
    expect(
      deriveSupportEscalationEngagementState({
        ticket: {
          status: "ESCALATED",
          assignedToId: "owner-1",
          firstResponseAt: new Date("2026-05-25T15:30:00.000Z"),
        },
        firstResponseDueAt: dueAt,
        now,
      }),
    ).toBe("engaged");
    expect(
      deriveSupportEscalationEngagementState({
        ticket: {
          status: "RESOLVED",
          assignedToId: "owner-1",
          firstResponseAt: null,
        },
        firstResponseDueAt: dueAt,
        now,
      }),
    ).toBe("resolved");
  });

  it("computes first response due time from SLA policy minutes", async () => {
    resolveSlaFirstResponseMinutesMock.mockResolvedValue(90);

    const dueAt = await computeSupportTicketFirstResponseDueAt({
      createdAt: new Date("2026-05-25T13:00:00.000Z"),
      workspaceId: null,
      priority: "CRITICAL",
      category: "PRODUCTION",
    });

    expect(dueAt.toISOString()).toBe("2026-05-25T14:30:00.000Z");
  });
});
