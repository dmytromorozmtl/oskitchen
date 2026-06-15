import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  supportTicket: {
    create: vi.fn(),
  },
  supportTicketEvent: {
    create: vi.fn(),
  },
}));

const computeSlaDueAtMock = vi.hoisted(() => vi.fn());
const trySendTicketCreatedConfirmationMock = vi.hoisted(() => vi.fn());
const notifyGrowthInboundMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/services/support/sla-service", () => ({
  computeSlaDueAt: computeSlaDueAtMock,
}));
vi.mock("@/services/support/support-notification-service", () => ({
  trySendTicketCreatedConfirmation: trySendTicketCreatedConfirmationMock,
}));
vi.mock("@/lib/growth/growth-notify", () => ({
  notifyGrowthInbound: notifyGrowthInboundMock,
}));

import { createSupportTicket } from "@/services/support/ticket-service";

describe("support ticket service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists assigned auto-escalated tickets without requester notifications", async () => {
    const slaDueAt = new Date("2026-05-25T17:00:00.000Z");
    computeSlaDueAtMock.mockResolvedValue(slaDueAt);
    prismaMock.supportTicket.create.mockResolvedValue({
      id: "ticket-1",
      email: "platform-ops@system.kitchenos.local",
      subject: "Critical cron auto-escalated: Webhook job drain",
      source: "API",
      category: "PRODUCTION",
      priority: "CRITICAL",
    });
    prismaMock.supportTicketEvent.create.mockResolvedValue({});

    const result = await createSupportTicket({
      userId: null,
      email: "platform-ops@system.kitchenos.local",
      requesterName: "OS Kitchen Cron Guard",
      subject: "Critical cron auto-escalated: Webhook job drain",
      message: "Critical cron incident.",
      category: "PRODUCTION",
      priority: "CRITICAL",
      severity: "CRITICAL",
      source: "API",
      moduleKey: "cron-execution",
      relatedEntityType: "CRON_EXECUTION_INCIDENT",
      relatedEntityId: "webhook-jobs:failed:2026-05-25T16:00:00.000Z",
      assignedToId: "platform-user-1",
      initialStatus: "ESCALATED",
      skipRequesterConfirmation: true,
      skipInboundNotification: true,
    });

    expect(prismaMock.supportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assignedToId: "platform-user-1",
          status: "ESCALATED",
          slaDueAt,
        }),
      }),
    );
    expect(prismaMock.supportTicketEvent.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          eventType: "CREATED",
        }),
      }),
    );
    expect(prismaMock.supportTicketEvent.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          eventType: "ASSIGNED",
          metadataJson: expect.objectContaining({
            assigneeId: "platform-user-1",
          }),
        }),
      }),
    );
    expect(trySendTicketCreatedConfirmationMock).not.toHaveBeenCalled();
    expect(notifyGrowthInboundMock).not.toHaveBeenCalled();
    expect(result.ticketRef).toBe("KS-TICKET1");
  });
});
