/** Strip high-risk substrings from observability context maps before logging or forwarding. */

const SENSITIVE_KEY = /key|token|secret|authorization|cookie|password|dsn|connection|stripe|supabase|openai|resend/i;

export function redactObservabilityContext(
  ctx?: Record<string, string>,
): Record<string, string> | undefined {
  if (!ctx) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v.length > 200 ? `${v.slice(0, 200)}…` : v;
    }
  }
  return out;
}

/** Human-readable error snippets for UI tables — not a cryptographic guarantee. */
export function redactFreeText(input: string): string {
  let s = input.length > 2000 ? `${input.slice(0, 2000)}…` : input;
  s = s.replace(/\bsk_live_[a-zA-Z0-9]+\b/g, "sk_live_[REDACTED]");
  s = s.replace(/\bsk_test_[a-zA-Z0-9]+\b/g, "sk_test_[REDACTED]");
  s = s.replace(/\bBearer\s+[a-zA-Z0-9._-]+\b/gi, "Bearer [REDACTED]");
  s = s.replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, "[JWT_REDACTED]");
  s = s.replace(/postgresql:\/\/[^\s]+/gi, "postgresql://[REDACTED]");
  return s;
}
