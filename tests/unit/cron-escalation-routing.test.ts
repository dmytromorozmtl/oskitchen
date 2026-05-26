import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  platformUserRole: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { resolveCronEscalationAssignment } from "@/services/cron/cron-escalation-routing";

const ORIGINAL_ENV = { ...process.env };

describe("cron escalation routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("prefers the team email override when it matches an eligible platform user", async () => {
    process.env.CRON_ESCALATION_OWNER_EMAILS_JSON = JSON.stringify({
      channels: "channels.owner@example.com",
    });
    prismaMock.platformUserRole.findMany.mockResolvedValue([
      {
        userId: "user-1",
        role: "PLATFORM_ADMIN",
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        user: {
          id: "user-1",
          fullName: "Channels Owner",
          email: "channels.owner@example.com",
        },
      },
    ]);

    const assignment = await resolveCronEscalationAssignment("doordash-sync");

    expect(assignment).toEqual(
      expect.objectContaining({
        resolution: "team_email_override",
        ownerTeam: "channels",
        assignee: {
          userId: "user-1",
          fullName: "Channels Owner",
          email: "channels.owner@example.com",
        },
        matchedRole: "PLATFORM_ADMIN",
        attemptedOverrideEmail: "channels.owner@example.com",
      }),
    );
    expect(prismaMock.platformUserRole.findMany).toHaveBeenCalledTimes(1);
  });

  it("falls back to role priority when overrides are absent or unmatched", async () => {
    process.env.CRON_ESCALATION_OWNER_EMAILS_JSON = JSON.stringify({
      default: "missing.owner@example.com",
    });
    prismaMock.platformUserRole.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          userId: "user-2",
          role: "SUPPORT_ADMIN",
          createdAt: new Date("2026-05-03T00:00:00.000Z"),
          user: {
            id: "user-2",
            fullName: "Support Owner",
            email: "support.owner@example.com",
          },
        },
        {
          userId: "user-1",
          role: "PLATFORM_ADMIN",
          createdAt: new Date("2026-05-04T00:00:00.000Z"),
          user: {
            id: "user-1",
            fullName: "Platform Owner",
            email: "platform.owner@example.com",
          },
        },
        {
          userId: "user-1",
          role: "SUPPORT_ADMIN",
          createdAt: new Date("2026-05-02T00:00:00.000Z"),
          user: {
            id: "user-1",
            fullName: "Platform Owner",
            email: "platform.owner@example.com",
          },
        },
      ]);

    const assignment = await resolveCronEscalationAssignment("webhook-jobs");

    expect(assignment).toEqual(
      expect.objectContaining({
        resolution: "role_fallback",
        ownerTeam: "channels",
        assignee: {
          userId: "user-1",
          fullName: "Platform Owner",
          email: "platform.owner@example.com",
        },
        matchedRole: "PLATFORM_ADMIN",
        attemptedOverrideEmail: "missing.owner@example.com",
      }),
    );
    expect(prismaMock.platformUserRole.findMany).toHaveBeenCalledTimes(2);
  });

  it("returns unassigned when no eligible triage owner exists", async () => {
    prismaMock.platformUserRole.findMany.mockResolvedValue([]);

    const assignment = await resolveCronEscalationAssignment("kds-overdue-alerts");

    expect(assignment).toEqual({
      resolution: "unassigned",
      ownerTeam: "orders",
      assignee: null,
      matchedRole: null,
      attemptedOverrideEmail: null,
    });
  });
});
