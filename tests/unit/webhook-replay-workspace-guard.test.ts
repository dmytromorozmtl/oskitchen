import { beforeEach, describe, expect, it, vi } from "vitest";

const workspaceFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspaceMember: {
      findFirst: workspaceFindFirst,
    },
  },
}));

import { assertWorkspaceWebhookReplayAllowed } from "@/lib/webhooks/webhook-replay-permissions";

describe("assertWorkspaceWebhookReplayAllowed", () => {
  beforeEach(() => {
    workspaceFindFirst.mockReset();
  });

  it("allows when actor is the webhook event owner", async () => {
    await expect(
      assertWorkspaceWebhookReplayAllowed({ actorUserId: "same", eventOwnerUserId: "same" }),
    ).resolves.toBeUndefined();
    expect(workspaceFindFirst).not.toHaveBeenCalled();
  });

  it("allows workspace ADMIN for owner workspace", async () => {
    workspaceFindFirst.mockResolvedValueOnce({ id: "m1" });
    await expect(
      assertWorkspaceWebhookReplayAllowed({ actorUserId: "admin", eventOwnerUserId: "owner" }),
    ).resolves.toBeUndefined();
    expect(workspaceFindFirst).toHaveBeenCalled();
  });

  it("denies cross-tenant replay without membership", async () => {
    workspaceFindFirst.mockResolvedValueOnce(null);
    await expect(
      assertWorkspaceWebhookReplayAllowed({ actorUserId: "intruder", eventOwnerUserId: "owner" }),
    ).rejects.toThrow(/permission/);
  });
});
