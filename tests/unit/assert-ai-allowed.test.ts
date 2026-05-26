import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/ai/budget-guard", () => ({
  checkAIBudget: vi.fn().mockResolvedValue(undefined),
  estimateTokens: vi.fn(() => 40),
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn().mockResolvedValue("ws-1"),
}));

vi.mock("@/lib/security/ai-rate-limit", () => ({
  aiLimitScopeKey: vi.fn(({ workspaceId }: { workspaceId: string }) => workspaceId),
  assertAiRateLimit: vi.fn().mockResolvedValue({ ok: true }),
}));

import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { checkAIBudget } from "@/lib/ai/budget-guard";
import { assertAiRateLimit } from "@/lib/security/ai-rate-limit";

describe("assertAiAllowed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes when budget and rate limit succeed", async () => {
    const res = await assertAiAllowed({
      userId: "user-1",
      workspaceId: "ws-1",
      kind: "ai_ocr",
      estimatedText: "invoice image",
    });
    expect(res.ok).toBe(true);
    expect(checkAIBudget).toHaveBeenCalledWith("ws-1", 40);
    expect(assertAiRateLimit).toHaveBeenCalled();
  });
});
