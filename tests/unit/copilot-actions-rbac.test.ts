import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCopilotMutation = vi.hoisted(() => vi.fn());
const runChatTurn = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/ai/require-copilot-mutation", () => ({
  requireCopilotMutation,
}));

vi.mock("@/services/ai/copilot-service", () => ({
  createCopilotActionDraft: vi.fn(),
  executeApprovedAction: vi.fn(),
  persistDeterministicInsights: vi.fn(),
  resolveInsight: vi.fn(),
  runChatTurn,
  setActionDraftStatus: vi.fn(),
  upsertCopilotSettings: vi.fn(),
}));

import { chatTurnAction } from "@/actions/copilot";

const copilotScope = {
  userId: "owner-1",
  workspaceId: "ws-1",
  email: "owner@example.com",
  isOwner: true,
  role: null,
  platformBypass: false,
};

describe("copilot actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runChatTurn.mockResolvedValue({
      conversationId: "conv-1",
      reply: "hello",
      narrativeStatus: "ok",
    });
  });

  it("denies chat without copilot.chat capability", async () => {
    requireCopilotMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to use Copilot.",
    });

    const result = await chatTurnAction({ message: "Summarize today" });

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to use Copilot.",
    });
    expect(requireCopilotMutation).toHaveBeenCalledWith({
      capability: "copilot.chat",
      operation: "copilot.chat_turn",
    });
    expect(runChatTurn).not.toHaveBeenCalled();
  });

  it("allows chat when copilot mutation passes", async () => {
    requireCopilotMutation.mockResolvedValue({ ok: true, scope: copilotScope });

    const result = await chatTurnAction({ message: "Summarize today" });

    expect(result.ok).toBe(true);
    expect(runChatTurn).toHaveBeenCalledWith(copilotScope, {
      conversationId: null,
      message: "Summarize today",
    });
  });
});
