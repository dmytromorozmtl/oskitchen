import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  userProfile: { count: vi.fn() },
  workspace: { count: vi.fn() },
  organization: { count: vi.fn() },
  trialState: { count: vi.fn() },
  subscription: { count: vi.fn() },
  supportTicket: { count: vi.fn() },
  integrationConnection: { count: vi.fn() },
  webhookEvent: { count: vi.fn() },
  order: { count: vi.fn() },
  automationExecution: { count: vi.fn() },
  productionIncident: { count: vi.fn() },
  auditLog: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { getPlatformDashboardSnapshot } from "@/services/platform/platform-service";

describe("platform service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes persistent production incident counts in the dashboard snapshot", async () => {
    prismaMock.userProfile.count.mockResolvedValue(10);
    prismaMock.workspace.count.mockResolvedValueOnce(6).mockResolvedValueOnce(4);
    prismaMock.organization.count.mockResolvedValue(3);
    prismaMock.trialState.count.mockResolvedValue(2);
    prismaMock.subscription.count.mockResolvedValue(5);
    prismaMock.supportTicket.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2);
    prismaMock.integrationConnection.count.mockResolvedValueOnce(9).mockResolvedValueOnce(1);
    prismaMock.webhookEvent.count.mockResolvedValue(14);
    prismaMock.order.count.mockResolvedValue(120);
    prismaMock.automationExecution.count.mockResolvedValue(8);
    prismaMock.productionIncident.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    prismaMock.auditLog.findMany.mockResolvedValue([]);

    const snapshot = await getPlatformDashboardSnapshot();

    expect(snapshot.activeIncidents).toBe(5);
    expect(snapshot.criticalProductionIncidents).toBe(2);
    expect(snapshot.openTickets).toBe(7);
    expect(snapshot.webhookPending).toBe(14);
  });
});
