export type FieldValidation = {
  key: string;
  ok: boolean;
  message: string;
  hint?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUrl(value: string, label: string): FieldValidation {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol)) {
      return { key: label, ok: false, message: "Must be http(s) URL", hint: "https://staging.yourdomain.com" };
    }
    return { key: label, ok: true, message: `URL ok (${u.host})` };
  } catch {
    return { key: label, ok: false, message: "Invalid URL", hint: "https://staging.yourdomain.com" };
  }
}

function validateEmail(value: string, key: string): FieldValidation {
  if (!EMAIL_RE.test(value)) {
    return { key, ok: false, message: "Invalid email format", hint: "owner@kitchen.com" };
  }
  return { key, ok: true, message: "Email format ok" };
}

function validateUuid(value: string, key: string): FieldValidation {
  if (!UUID_RE.test(value)) {
    return {
      key,
      ok: false,
      message: "Must be a valid UUID",
      hint: "Copy tenant B delivery connection id from staging DB",
    };
  }
  return { key, ok: true, message: "UUID format ok" };
}

function validateApiKey(value: string, key: string): FieldValidation {
  if (value.length < 8) {
    return { key, ok: false, message: "API key too short", hint: "kos_... from staging settings" };
  }
  if (!value.startsWith("kos_") && !value.startsWith("pk_")) {
    return {
      key,
      ok: true,
      message: "Set (non-standard prefix — verify in dashboard)",
    };
  }
  return { key, ok: true, message: "API key format ok" };
}

function validateDatabaseUrl(value: string): FieldValidation {
  if (!value.startsWith("postgresql://") && !value.startsWith("postgres://")) {
    return {
      key: "DATABASE_URL",
      ok: false,
      message: "Must be postgresql:// connection string",
      hint: "From Supabase → Project Settings → Database",
    };
  }
  return { key: "DATABASE_URL", ok: true, message: "PostgreSQL URL shape ok" };
}

/** Semantic validation for known beta env keys (values must be set). */
export function validateEnvField(key: string, value: string | undefined): FieldValidation | null {
  const v = value?.trim();
  if (!v) return null;

  switch (key) {
    case "SMOKE_BASE_URL":
    case "NEXT_PUBLIC_APP_URL":
      return validateUrl(v, key);
    case "E2E_LOGIN_EMAIL":
    case "E2E_STAFF_EMAIL":
    case "BETA_OWNER_EMAIL":
    case "NEXT_PUBLIC_SUPPORT_EMAIL":
      return validateEmail(v, key);
    case "SMOKE_DELIVERY_CONNECTION_ID":
    case "SMOKE_DELIVERY_CONNECTION_ID_OTHER":
      return validateUuid(v, key);
    case "SMOKE_PUBLIC_API_KEY":
      return validateApiKey(v, key);
    case "DATABASE_URL":
    case "DIRECT_URL":
      return validateDatabaseUrl(v);
    case "E2E_LOGIN_PASSWORD":
    case "E2E_STAFF_PASSWORD":
      return v.length >= 4
        ? { key, ok: true, message: "Password set" }
        : { key, ok: false, message: "Password too short", hint: "Min 4 characters" };
    case "BETA_COHORT_EMAILS": {
      const emails = v.split(/[,;\s]+/).filter(Boolean);
      const bad = emails.filter((e) => !EMAIL_RE.test(e));
      if (bad.length) {
        return {
          key,
          ok: false,
          message: `Invalid emails: ${bad.join(", ")}`,
          hint: "chef1@x.com,chef2@x.com",
        };
      }
      return { key, ok: true, message: `${emails.length} email(s) ok` };
    }
    case "BETA_SLACK_WEBHOOK_URL":
      return v.startsWith("https://hooks.slack.com/")
        ? { key, ok: true, message: "Slack webhook shape ok" }
        : { key, ok: false, message: "Must be hooks.slack.com URL", hint: "Slack → Incoming Webhooks" };
    default:
      return null;
  }
}

export function validateEnvKeys(keys: string[]): FieldValidation[] {
  const out: FieldValidation[] = [];
  for (const key of keys) {
    const v = validateEnvField(key, process.env[key]);
    if (v) out.push(v);
  }
  return out;
}
