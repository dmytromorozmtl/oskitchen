import "server-only";

import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

export type AiRateLimitKind = "ai_copilot" | "ai_ocr" | "ai_forecast";

const ESTIMATED_UNITS: Record<AiRateLimitKind, number> = {
  ai_copilot: 1,
  ai_ocr: 3,
  ai_forecast: 2,
};

/**
 * Per-workspace AI usage guard (Upstash/memory adapter).
 * Prevents runaway OpenAI spend from OCR uploads or copilot abuse.
 */
export async function assertAiRateLimit(params: {
  workspaceId: string;
  kind: AiRateLimitKind;
}): Promise<{ ok: true } | { ok: false; error: string; retryAfterMs?: number }> {
  const bucket = `ai:${params.kind}:${params.workspaceId}`;
  const policyKey = params.kind;

  for (let i = 0; i < ESTIMATED_UNITS[policyKey]; i++) {
    const res = await consumeRateLimitToken(bucket, policyKey);
    if (!res.ok) {
      return {
        ok: false,
        error: "AI usage limit reached for this workspace. Try again later or upgrade your plan.",
        retryAfterMs: res.retryAfterMs,
      };
    }
  }

  return { ok: true };
}

/** Resolve workspace id for AI limits — prefer workspaceId, fall back to userId for legacy scope. */
export function aiLimitScopeKey(scope: { workspaceId?: string | null; userId: string }): string {
  return scope.workspaceId?.trim() || scope.userId;
}
