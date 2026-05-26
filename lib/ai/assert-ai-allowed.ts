import "server-only";

import { AIBudgetExceededError, checkAIBudget, estimateTokens } from "@/lib/ai/budget-guard";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  aiLimitScopeKey,
  assertAiRateLimit,
  type AiRateLimitKind,
} from "@/lib/security/ai-rate-limit";

/**
 * Monthly token budget + per-minute rate limit before OpenAI calls.
 */
export async function assertAiAllowed(params: {
  userId: string;
  workspaceId?: string | null;
  kind: AiRateLimitKind;
  estimatedText?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ws =
    params.workspaceId?.trim() ||
    (await resolveOwnerWorkspaceId(params.userId).catch(() => null));

  if (!ws) {
    return { ok: false, error: "Workspace not found for AI request." };
  }

  const tokens = estimateTokens(params.estimatedText ?? "x".repeat(120));

  try {
    await checkAIBudget(ws, tokens);
  } catch (e) {
    if (e instanceof AIBudgetExceededError) {
      return { ok: false, error: e.message };
    }
    throw e;
  }

  const limit = await assertAiRateLimit({
    workspaceId: aiLimitScopeKey({ userId: params.userId, workspaceId: ws }),
    kind: params.kind,
  });

  if (!limit.ok) {
    return { ok: false, error: limit.error };
  }

  return { ok: true };
}
