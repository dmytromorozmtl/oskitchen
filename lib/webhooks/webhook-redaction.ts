const SENSITIVE_KEYS = new Set(
  [
    "authorization",
    "cookie",
    "set-cookie",
    "x-wc-webhook-signature",
    "x-shopify-hmac-sha256",
    "stripe-signature",
    "password",
    "secret",
    "client_secret",
    "api_key",
    "apikey",
    "token",
    "access_token",
    "refresh_token",
  ].map((k) => k.toLowerCase()),
);

function redactValue(key: string): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return "[REDACTED]";
  return undefined;
}

/** Recursively strip obvious secrets for logs / derived analytics — never store raw signing material. */
export function redactWebhookJsonForLog(value: unknown, depth = 0): unknown {
  if (depth > 12) return "[MAX_DEPTH]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (value.length > 4000) return `${value.slice(0, 2000)}…[truncated]`;
    return value;
  }
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redactWebhookJsonForLog(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const forced = redactValue(k);
    if (forced !== undefined) out[k] = forced;
    else out[k] = redactWebhookJsonForLog(v, depth + 1);
  }
  return out;
}
