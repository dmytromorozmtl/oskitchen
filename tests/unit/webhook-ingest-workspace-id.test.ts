import { describe, expect, it, vi, beforeEach } from "vitest";

import { resolveWebhookJobWorkspaceId } from "@/services/webhooks/webhook-ingest-service";

const mockResolveOwnerWorkspaceId = vi.fn();

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: (...args: unknown[]) => mockResolveOwnerWorkspaceId(...args),
}));

describe("resolveWebhookJobWorkspaceId", () => {
  beforeEach(() => {
    mockResolveOwnerWorkspaceId.mockReset();
  });

  it("returns explicit workspaceId when provided", async () => {
    const id = await resolveWebhookJobWorkspaceId({
      userId: "user-1",
      workspaceId: "ws-explicit",
    });
    expect(id).toBe("ws-explicit");
    expect(mockResolveOwnerWorkspaceId).not.toHaveBeenCalled();
  });

  it("falls back to owner workspace when connection workspace is null", async () => {
    mockResolveOwnerWorkspaceId.mockResolvedValue("ws-owner");
    const id = await resolveWebhookJobWorkspaceId({
      userId: "user-1",
      workspaceId: null,
    });
    expect(id).toBe("ws-owner");
    expect(mockResolveOwnerWorkspaceId).toHaveBeenCalledWith("user-1");
  });

  it("throws when workspace cannot be resolved", async () => {
    mockResolveOwnerWorkspaceId.mockResolvedValue(null);
    await expect(
      resolveWebhookJobWorkspaceId({ userId: "user-orphan", workspaceId: null }),
    ).rejects.toThrow(/workspace could not be resolved/i);
  });
});
