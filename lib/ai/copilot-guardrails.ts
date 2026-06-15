import type { CopilotRedactionLevel } from "@prisma/client";

import { detectLeakRisks, redactText } from "@/lib/ai/copilot-redaction";

/**
 * Final pre-send guardrail. We trust earlier redaction passes, but we
 * never want to send a prompt with obvious secrets or unmasked
 * email / phone / card content. If the guardrail trips, callers MUST
 * abort the AI call and fall back to the deterministic path.
 */
export type GuardrailVerdict =
  | { ok: true; sanitised: string }
  | { ok: false; reason: string };

export function runOutboundGuardrail(
  prompt: string,
  level: CopilotRedactionLevel,
): GuardrailVerdict {
  const sanitised = redactText(prompt, level);
  const risks = detectLeakRisks(sanitised);
  if (risks.hasSecret) return { ok: false, reason: "secret_detected" };
  if (level !== "FULL_INTERNAL_ALLOWED") {
    if (risks.hasEmail) return { ok: false, reason: "email_leak" };
    if (risks.hasPhone) return { ok: false, reason: "phone_leak" };
    if (risks.hasCard) return { ok: false, reason: "card_leak" };
  }
  if (sanitised.length > 16_000) {
    return { ok: false, reason: "prompt_too_large" };
  }
  return { ok: true, sanitised };
}

export const COPILOT_MAX_OUTPUT_TOKENS = 600;
export const COPILOT_MAX_INPUT_TOKENS_APPROX = 6_000;
export const COPILOT_MAX_TOOLS_PER_CALL = 6;
