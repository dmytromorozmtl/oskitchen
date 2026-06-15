import { beforeEach, describe, expect, it, vi } from "vitest";

import { aiLimitScopeKey, assertAiRateLimit } from "@/lib/security/ai-rate-limit";

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken: vi.fn(),
}));

import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

describe("ai-rate-limit", () => {
  beforeEach(() => {
    vi.mocked(consumeRateLimitToken).mockReset();
  });

  it("aiLimitScopeKey prefers workspaceId", () => {
    expect(aiLimitScopeKey({ userId: "u1", workspaceId: "w1" })).toBe("w1");
    expect(aiLimitScopeKey({ userId: "u1", workspaceId: null })).toBe("u1");
  });

  it("assertAiRateLimit passes when tokens available", async () => {
    vi.mocked(consumeRateLimitToken).mockResolvedValue({ ok: true });
    const res = await assertAiRateLimit({ workspaceId: "w1", kind: "ai_copilot" });
    expect(res.ok).toBe(true);
  });

  it("assertAiRateLimit fails when exhausted", async () => {
    vi.mocked(consumeRateLimitToken).mockResolvedValue({ ok: false, retryAfterMs: 30_000 });
    const res = await assertAiRateLimit({ workspaceId: "w1", kind: "ai_ocr" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("AI usage limit");
    }
  });
});
