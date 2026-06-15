import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsActor = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const webhookEventFindUnique = vi.hoisted(() => vi.fn());
const requestWebhookReplay = vi.hoisted(() => vi.fn());
const assertWorkspaceWebhookReplayAllowed = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/require-integrations-actor", () => ({
  requireIntegrationsActor,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/webhooks/webhook-replay-permissions", () => ({
  assertWorkspaceWebhookReplayAllowed,
}));

vi.mock("@/services/webhooks/webhook-replay-service", () => ({
  requestWebhookReplay,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhookEvent: {
      findUnique: webhookEventFindUnique,
    },
  },
}));

import { replayWebhookEventAction } from "@/actions/webhook-replay";

const EVENT_ID = "11111111-1111-4111-8111-111111111111";

function workspaceFormData() {
  const formData = new FormData();
  formData.set("webhookEventId", EVENT_ID);
  formData.set("reason", "Retry after transient failure");
  formData.set("surface", "workspace");
  return formData;
}

describe("webhook replay workspace RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "manager-1", email: "manager@example.com" },
    });
    webhookEventFindUnique.mockResolvedValue({ userId: "owner-1" });
    assertWorkspaceWebhookReplayAllowed.mockResolvedValue(undefined);
    requestWebhookReplay.mockResolvedValue({ ok: true });
  });

  it("denies workspace replay without integrations.manage", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await replayWebhookEventAction(undefined, workspaceFormData());

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(requireIntegrationsActor).toHaveBeenCalledWith({
      operation: "webhooks.replay",
      metadata: { surface: "workspace", webhookEventId: EVENT_ID },
    });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(webhookEventFindUnique).not.toHaveBeenCalled();
    expect(requestWebhookReplay).not.toHaveBeenCalled();
  });

  it("allows workspace replay when integrations.manage is granted", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: true,
      actor: { sessionUserId: "manager-1", workspaceId: "ws-1" },
      workspaceId: "ws-1",
    });

    const result = await replayWebhookEventAction(undefined, workspaceFormData());

    expect(result).toEqual({ ok: true, message: "Replay recorded." });
    expect(assertWorkspaceWebhookReplayAllowed).toHaveBeenCalledWith({
      actorUserId: "manager-1",
      eventOwnerUserId: "owner-1",
    });
    expect(requestWebhookReplay).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookEventId: EVENT_ID,
        surface: "workspace",
        actorUserId: "manager-1",
      }),
    );
  });
});
