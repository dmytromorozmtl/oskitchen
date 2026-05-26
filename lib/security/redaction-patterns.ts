/**
 * Ordered high-signal patterns for display-time redaction.
 * Longer / more specific patterns should run before generic token matchers.
 */
export const REDACTION_PATTERN_GROUPS: { name: string; pattern: RegExp; replacement: string }[] = [
  { name: "authorization_bearer", pattern: /authorization\s*:\s*Bearer\s+[\w\-._~+/]+=*/gi, replacement: "Authorization: Bearer [REDACTED]" },
  { name: "bearer_prefix", pattern: /Bearer\s+[\w\-._~+/]{20,}={0,2}/gi, replacement: "Bearer [REDACTED]" },
  { name: "basic_auth", pattern: /Basic\s+[A-Za-z0-9+/]{20,}={0,2}/gi, replacement: "Basic [REDACTED]" },
  { name: "stripe_sk_live", pattern: /sk_live_[0-9a-zA-Z]{20,}/g, replacement: "[REDACTED_STRIPE_SECRET]" },
  { name: "stripe_sk_test", pattern: /sk_test_[0-9a-zA-Z]{20,}/g, replacement: "[REDACTED_STRIPE_SECRET]" },
  { name: "stripe_rk", pattern: /rk_live_[0-9a-zA-Z]{20,}/g, replacement: "[REDACTED_STRIPE_RESTRICTED]" },
  { name: "stripe_pk", pattern: /pk_live_[0-9a-zA-Z]{20,}/g, replacement: "[REDACTED_STRIPE_PUBLISHABLE]" },
  { name: "supabase_service", pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: "[REDACTED_JWT]" },
  { name: "openai_sk", pattern: /sk-(?:proj|ant)-[A-Za-z0-9_-]{20,}/g, replacement: "[REDACTED_OPENAI_KEY]" },
  { name: "resend_re", pattern: /re_[A-Za-z0-9_]{20,}/g, replacement: "[REDACTED_RESEND_KEY]" },
  { name: "webhook_secret_kv", pattern: /(whsec|webhook[_-]?secret|signing[_-]?secret)\s*[:=]\s*[\w\-+/]{16,}/gi, replacement: "$1: [REDACTED]" },
  { name: "api_key_kv", pattern: /(api[_-]?key|apikey|token|secret)\s*[:=]\s*["']?[\w\-+/]{16,}/gi, replacement: "$1: [REDACTED]" },
  { name: "postgres_url", pattern: /postgres(?:ql)?:\/\/[^\s'"]+/gi, replacement: "[REDACTED_DATABASE_URL]" },
  { name: "mysql_url", pattern: /mysql:\/\/[^\s'"]+/gi, replacement: "[REDACTED_DATABASE_URL]" },
  { name: "mongodb_srv", pattern: /mongodb\+srv:\/\/[^\s'"]+/gi, replacement: "[REDACTED_DATABASE_URL]" },
  { name: "password_kv", pattern: /(password|passwd|pwd)\s*[:=]\s*["']?[^\s&"']{4,}/gi, replacement: "$1: [REDACTED]" },
  { name: "long_hex_token", pattern: /\b[0-9a-f]{40,}\b/gi, replacement: "[REDACTED_TOKEN]" },
  { name: "long_base64_blob", pattern: /\b[A-Za-z0-9+/]{80,}={0,2}\b/g, replacement: "[REDACTED_BLOB]" },
];
