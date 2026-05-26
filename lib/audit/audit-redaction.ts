/**
 * Redacts sensitive keys from arbitrary JSON-like structures before persisting audit trails.
 * Never log secrets, tokens, card data, or raw auth headers.
 */

const SENSITIVE_KEY_PATTERN =
  /^(password|token|accessToken|refreshToken|apiKey|api[_-]?key|secret|webhookSecret|webhook[_-]?secret|databaseUrl|connectionString|authorization|cookie|set-cookie|session|privateKey|stripeSecret|stripe[_-]?secret|supabaseServiceRole|resendApiKey|openaiApiKey|anthropicApiKey)$/i;

const ENV_KEY_PATTERN =
  /^(STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|DATABASE_URL)$/;

export type RedactionResult<T> = {
  value: T;
  redactionApplied: boolean;
  redactedKeys: string[];
};

function isSensitiveKey(key: string): boolean {
  const k = key.trim();
  if (ENV_KEY_PATTERN.test(k)) return true;
  if (SENSITIVE_KEY_PATTERN.test(k)) return true;
  if (k.toLowerCase().includes("password")) return true;
  if (k.toLowerCase().includes("secret")) return true;
  if (k.toLowerCase().includes("token")) return true;
  return false;
}

function maskCardLike(): string {
  return "[REDACTED_CARD]";
}

export function redactUnknown(input: unknown, path = ""): RedactionResult<unknown> {
  const redactedKeys: string[] = [];
  if (input === null || input === undefined) {
    return { value: input, redactionApplied: false, redactedKeys };
  }
  if (typeof input === "string") {
    const cardish = /^\d{12,19}$/;
    if (cardish.test(input.replace(/\s/g, ""))) {
      return { value: maskCardLike(), redactionApplied: true, redactedKeys: [path || "value"] };
    }
    return { value: input, redactionApplied: false, redactedKeys };
  }
  if (typeof input !== "object") {
    return { value: input, redactionApplied: false, redactedKeys };
  }
  if (Array.isArray(input)) {
    let applied = false;
    const out: unknown[] = [];
    for (let i = 0; i < input.length; i++) {
      const r = redactUnknown(input[i], `${path}[${i}]`);
      if (r.redactionApplied) applied = true;
      redactedKeys.push(...r.redactedKeys);
      out.push(r.value);
    }
    return { value: out, redactionApplied: applied, redactedKeys };
  }
  const out: Record<string, unknown> = {};
  let applied = false;
  for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
    const p = path ? `${path}.${key}` : key;
    if (isSensitiveKey(key)) {
      applied = true;
      redactedKeys.push(p);
      out[key] = "[REDACTED]";
      continue;
    }
    const r = redactUnknown(val, p);
    if (r.redactionApplied) applied = true;
    redactedKeys.push(...r.redactedKeys);
    out[key] = r.value;
  }
  return { value: out, redactionApplied: applied, redactedKeys };
}

/** Mask PII strings for storage when maskPii flag set (emails partially, phones heavily). */
export function maskEmail(email: string): string {
  const [a, b] = email.split("@");
  if (!b) return "[REDACTED_EMAIL]";
  const head = a.slice(0, 2);
  return `${head}***@${b}`;
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return "[REDACTED_PHONE]";
  return `***${d.slice(-4)}`;
}

export function redactMetadataForPolicy(
  meta: Record<string, unknown> | undefined,
  options: { maskEmail?: boolean; maskPhone?: boolean },
): RedactionResult<Record<string, unknown> | undefined> {
  const base = redactUnknown(meta ?? {});
  let v = base.value as Record<string, unknown>;
  let applied = base.redactionApplied;
  const keys = [...base.redactedKeys];
  if (options.maskEmail && v) {
    for (const k of Object.keys(v)) {
      if (/email/i.test(k) && typeof v[k] === "string") {
        v = { ...v, [k]: maskEmail(v[k] as string) };
        applied = true;
        keys.push(k);
      }
    }
  }
  if (options.maskPhone && v) {
    for (const k of Object.keys(v)) {
      if (/phone|mobile|tel/i.test(k) && typeof v[k] === "string") {
        v = { ...v, [k]: maskPhone(v[k] as string) };
        applied = true;
        keys.push(k);
      }
    }
  }
  return { value: v, redactionApplied: applied, redactedKeys: keys };
}
