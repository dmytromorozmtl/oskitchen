const SENSITIVE_KEY = /(secret|password|token|authorization|apikey|api_key|private_key|access_token|refresh_token|cookie)/i;

/** Remove likely secrets from diagnostic JSON before persistence. */
export function redactSupportJson(input: unknown): unknown {
  if (input == null) return input;
  if (Array.isArray(input)) return input.map((x) => redactSupportJson(x));
  if (typeof input !== "object") return input;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = typeof v === "object" && v !== null ? redactSupportJson(v) : v;
  }
  return out;
}
