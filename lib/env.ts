import { z } from "zod";

import { logger } from "@/lib/logger";
import { collectProductionReadinessIssues } from "@/lib/startup/production-readiness";

/**
 * Client-safe keys only — import `clientEnvSchema` / `parseClientEnv` from server layouts if needed.
 * Do not import `getServerEnv` into Client Components.
 */
export const clientEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  /** Optional label for banners and diagnostics: development | staging | production */
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/** Core vars required for DB + Supabase; safe to call from server code (no secret values returned). */
const CORE_ENV_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/** True when all core database and public Supabase keys are non-empty (server-side check only). */
export function isEnvConfigured(): boolean {
  return CORE_ENV_KEYS.every((k) => Boolean(process.env[k]?.trim()));
}

function warnCoreEnvMissingInDevelopment(): void {
  if (process.env.NODE_ENV === "production") return;
  for (const k of CORE_ENV_KEYS) {
    if (!process.env[k]?.trim()) {
      logger.warn(
        `[env] Missing ${k} — add it to .env (Prisma CLI) and .env.local (Next.js). See docs/LOCAL_DATABASE_SETUP.md`,
      );
    }
  }

  // Catch the most common Prisma migration failure: DIRECT_URL still pointing
  // at the legacy IPv6-only Supabase direct host. Runtime won't break, but
  // every `prisma migrate ...` will fail with P1001 until it is fixed.
  const directUrl = process.env.DIRECT_URL?.trim();
  if (directUrl) {
    try {
      const u = new URL(directUrl);
      if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(u.hostname) && (u.port === "5432" || u.port === "")) {
        logger.warn(
          "[env] DIRECT_URL points at the legacy Supabase direct host (db.<ref>.supabase.co:5432). " +
            "That host is IPv6-only on current Supabase plans and breaks Prisma migrations on most networks. " +
            "Run `node scripts/migrate-direct-url-to-session-pooler.mjs` or see docs/SUPABASE_POOLER_SETUP.md.",
        );
      }
    } catch {
      // ignore — schema validation will catch malformed URLs
    }
  }
}

const serverEnvSchema = clientEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  WEBHOOK_SIGNING_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SHOPIFY_APP_SECRET: z.string().optional(),
  SHOPIFY_API_VERSION: z.string().optional(),
  CRON_ESCALATION_OWNER_EMAILS_JSON: z.string().optional(),
  WOOCOMMERCE_WEBHOOK_SECRET: z.string().optional(),
  UBER_EATS_CLIENT_ID: z.string().optional(),
  UBER_EATS_CLIENT_SECRET: z.string().optional(),
  UBER_DIRECT_CLIENT_ID: z.string().optional(),
  UBER_DIRECT_CLIENT_SECRET: z.string().optional(),
  UBER_DIRECT_WEBHOOK_SECRET: z.string().optional(),
  DEMO_MODE_ENABLED: z.string().optional(),
  DEMO_SEED_SECRET: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  /** Development only — skips subscription / trial enforcement when true. */
  DEV_BYPASS_BILLING: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServer: ServerEnv | null = null;

function parseServerEnv(): ServerEnv {
  warnCoreEnvMissingInDevelopment();
  const raw = { ...process.env };

  const result = serverEnvSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.flatten().fieldErrors;
    logger.error("Invalid environment configuration", issues);

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing or invalid environment variables. Check docs/ENVIRONMENT_VARIABLES.md and .env.example.",
      );
    }

    const fallback = serverEnvSchema.safeParse({
      ...raw,
      NEXT_PUBLIC_APP_URL:
        raw.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL:
        raw.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dev-anon-key-placeholder",
      DATABASE_URL:
        raw.DATABASE_URL ??
        "postgresql://postgres:postgres@127.0.0.1:5432/kitchenos",
      DIRECT_URL:
        raw.DIRECT_URL ??
        raw.DATABASE_URL ??
        "postgresql://postgres:postgres@127.0.0.1:5432/kitchenos",
    });

    if (!fallback.success) {
      throw new Error(
        "Development fallback env parsing failed — set DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    logger.warn(
      "Using development fallbacks for env validation — set real values in .env.local.",
    );
    return fallback.data;
  }

  return result.data;
}

/** Parsed server env — throws in production if core DB/Supabase keys invalid. */
export function getServerEnv(): ServerEnv {
  if (!cachedServer) cachedServer = parseServerEnv();
  return cachedServer;
}

export type EnvHealthRow = {
  key: string;
  group: string;
  /** ok = present; unset = not set (OK off prod); blocked = required for prod launch but missing */
  status: "ok" | "unset" | "blocked";
  hint?: string;
};

/** Presence-only checks for Developer Settings — never returns secret values. */
export function getEnvHealth(): EnvHealthRow[] {
  const p = process.env;
  const prod = p.NODE_ENV === "production";

  function row(
    key: string,
    group: string,
    present: boolean,
    requiredOnProd: boolean,
    hint?: string,
  ): EnvHealthRow {
    let status: EnvHealthRow["status"] = "ok";
    if (!present) {
      status = prod && requiredOnProd ? "blocked" : "unset";
    }
    return { key, group, status, hint };
  }

  return [
    row("NEXT_PUBLIC_APP_URL", "App", Boolean(p.NEXT_PUBLIC_APP_URL), true),
    row(
      "NEXT_PUBLIC_APP_ENV",
      "App",
      Boolean(p.NEXT_PUBLIC_APP_ENV),
      false,
      "Optional UI label: development | staging | production.",
    ),
    row(
      "NEXT_PUBLIC_SUPPORT_EMAIL",
      "App",
      Boolean(p.NEXT_PUBLIC_SUPPORT_EMAIL),
      false,
      "Shown for feedback / bug mailto links in dashboard.",
    ),
    row(
      "DATABASE_URL",
      "Database",
      Boolean(p.DATABASE_URL),
      true,
      "Supabase pooler :6543 for serverless.",
    ),
    row(
      "DIRECT_URL",
      "Database",
      Boolean(p.DIRECT_URL),
      true,
      "Direct :5432 for migrations.",
    ),
    row(
      "NEXT_PUBLIC_SUPABASE_URL",
      "Supabase",
      Boolean(p.NEXT_PUBLIC_SUPABASE_URL),
      true,
    ),
    row(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "Supabase",
      Boolean(p.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      true,
    ),
    row(
      "SUPABASE_SERVICE_ROLE_KEY",
      "Supabase",
      Boolean(p.SUPABASE_SERVICE_ROLE_KEY),
      false,
      "Recommended server-side.",
    ),
    row(
      "ENCRYPTION_KEY",
      "Security",
      Boolean(p.ENCRYPTION_KEY),
      true,
      "Required to encrypt stored integration secrets.",
    ),
    row(
      "CRON_SECRET",
      "Security",
      Boolean(p.CRON_SECRET),
      true,
      "Required for production cron auth, including webhook job draining.",
    ),
    row(
      "CRON_ESCALATION_OWNER_EMAILS_JSON",
      "Operations",
      Boolean(p.CRON_ESCALATION_OWNER_EMAILS_JSON),
      false,
      'Optional JSON owner overrides for cron auto-escalation, e.g. {"channels":"ops@example.com","default":"support@example.com"}.',
    ),
    row(
      "RATE_LIMIT_ADAPTER",
      "Security",
      Boolean(p.RATE_LIMIT_ADAPTER),
      false,
      "Optional override. Production must still resolve to a distributed backend (Upstash or Redis), not memory-only.",
    ),
    row(
      "REDIS_URL",
      "Security",
      Boolean(p.REDIS_URL),
      false,
      "TCP Redis backend for distributed production rate limits.",
    ),
    row(
      "UPSTASH_REDIS_REST_URL",
      "Security",
      Boolean(p.UPSTASH_REDIS_REST_URL),
      false,
      "Upstash REST URL for distributed production rate limits.",
    ),
    row(
      "UPSTASH_REDIS_REST_TOKEN",
      "Security",
      Boolean(p.UPSTASH_REDIS_REST_TOKEN),
      false,
      "Upstash REST token paired with UPSTASH_REDIS_REST_URL.",
    ),
    row("WEBHOOK_SIGNING_SECRET", "Security", Boolean(p.WEBHOOK_SIGNING_SECRET), false),
    row("STRIPE_SECRET_KEY", "Stripe", Boolean(p.STRIPE_SECRET_KEY), false),
    row("STRIPE_WEBHOOK_SECRET", "Stripe", Boolean(p.STRIPE_WEBHOOK_SECRET), false),
    row(
      "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID",
      "Stripe",
      Boolean(p.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID),
      false,
    ),
    row(
      "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
      "Stripe",
      Boolean(p.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID),
      false,
    ),
    row(
      "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID",
      "Stripe",
      Boolean(p.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID),
      false,
    ),
    row(
      "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID",
      "Stripe",
      Boolean(p.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID),
      false,
    ),
    row("RESEND_API_KEY", "Resend", Boolean(p.RESEND_API_KEY), false),
    row("RESEND_FROM_EMAIL", "Resend", Boolean(p.RESEND_FROM_EMAIL), false),
    row("SHOPIFY_APP_SECRET", "Integrations", Boolean(p.SHOPIFY_APP_SECRET), false),
    row("SHOPIFY_API_VERSION", "Integrations", Boolean(p.SHOPIFY_API_VERSION), false),
    row(
      "WOOCOMMERCE_WEBHOOK_SECRET",
      "Integrations",
      Boolean(p.WOOCOMMERCE_WEBHOOK_SECRET),
      false,
    ),
    row("UBER_EATS_CLIENT_ID", "Integrations", Boolean(p.UBER_EATS_CLIENT_ID), false),
    row(
      "UBER_EATS_CLIENT_SECRET",
      "Integrations",
      Boolean(p.UBER_EATS_CLIENT_SECRET),
      false,
    ),
    row(
      "UBER_DIRECT_CLIENT_ID",
      "Integrations",
      Boolean(p.UBER_DIRECT_CLIENT_ID),
      false,
    ),
    row(
      "UBER_DIRECT_CLIENT_SECRET",
      "Integrations",
      Boolean(p.UBER_DIRECT_CLIENT_SECRET),
      false,
    ),
    row(
      "UBER_DIRECT_WEBHOOK_SECRET",
      "Integrations",
      Boolean(p.UBER_DIRECT_WEBHOOK_SECRET),
      false,
      "Required to authenticate the Uber Direct placeholder webhook endpoint until live provider signature verification is implemented.",
    ),
    row("DEMO_MODE_ENABLED", "Demo", Boolean(p.DEMO_MODE_ENABLED), false),
    row("DEMO_SEED_SECRET", "Demo", Boolean(p.DEMO_SEED_SECRET), false),
    row("OPENAI_API_KEY", "AI", Boolean(p.OPENAI_API_KEY), false),
    row("GOOGLE_MAPS_API_KEY", "Maps", Boolean(p.GOOGLE_MAPS_API_KEY), false),
  ];
}

/** Blockers for a serious production deploy (beta-ready). */
export function getProductionLaunchGaps(): string[] {
  if (process.env.NODE_ENV !== "production") return [];
  const p = process.env;
  const gaps: string[] = [];
  const need = (cond: boolean, msg: string) => {
    if (!cond) gaps.push(msg);
  };
  need(Boolean(p.DATABASE_URL && p.DIRECT_URL), "DATABASE_URL and DIRECT_URL");
  need(Boolean(p.NEXT_PUBLIC_SUPABASE_URL && p.NEXT_PUBLIC_SUPABASE_ANON_KEY), "Supabase public keys");
  need(Boolean(p.NEXT_PUBLIC_APP_URL), "NEXT_PUBLIC_APP_URL (canonical site URL)");
  need(Boolean(p.ENCRYPTION_KEY), "ENCRYPTION_KEY (integration credential encryption)");
  need(Boolean(p.CRON_SECRET), "CRON_SECRET (production cron auth / webhook drain worker)");
  for (const issue of collectProductionReadinessIssues()) {
    gaps.push(issue.message);
  }
  return gaps;
}

export function getPublicSiteUrl(): string {
  try {
    const env = getServerEnv();
    return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
}

export function resolveStripePriceId(
  plan: "STARTER" | "PRO" | "TEAM",
): string | null {
  try {
    const env = getServerEnv();
    const id =
      plan === "STARTER"
        ? env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
        : plan === "PRO"
          ? env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
          : env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;
    return id ?? null;
  } catch {
    return (
      (plan === "STARTER"
        ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
        : plan === "PRO"
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) ?? null
    );
  }
}

export function isStripeConfigured(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(
      env.STRIPE_SECRET_KEY &&
        env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID &&
        env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID &&
        env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
    );
  } catch {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
}

export function isResendConfigured(): boolean {
  try {
    return Boolean(getServerEnv().RESEND_API_KEY);
  } catch {
    return Boolean(process.env.RESEND_API_KEY);
  }
}

export function isDemoGloballyFlagged(): boolean {
  const v = process.env.DEMO_MODE_ENABLED?.toLowerCase();
  return v === "1" || v === "true";
}

/**
 * Non-secret hints for Developer Settings — rotate credentials if any match.
 * Never includes env values in returned strings.
 */
export function getEnvSuspicionWarnings(): string[] {
  const p = process.env;
  const warnings: string[] = [];

  if (p.NEXT_PUBLIC_SUPABASE_ANON_KEY === "dev-anon-key-placeholder") {
    warnings.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY matches the local dev fallback — set a real anon key before serving users.",
    );
  }
  if (
    p.NODE_ENV === "production" &&
    (p.DATABASE_URL?.includes("127.0.0.1") || p.DATABASE_URL?.includes("localhost"))
  ) {
    warnings.push(
      "DATABASE_URL references localhost while NODE_ENV=production — use your Supabase pooler URL.",
    );
  }
  if (
    p.NODE_ENV === "production" &&
    (p.DIRECT_URL?.includes("127.0.0.1") || p.DIRECT_URL?.includes("localhost"))
  ) {
    warnings.push(
      "DIRECT_URL references localhost while NODE_ENV=production — use Supabase direct Postgres.",
    );
  }
  if (
    p.NODE_ENV === "production" &&
    (p.NEXT_PUBLIC_APP_URL?.includes("localhost") ||
      p.NEXT_PUBLIC_APP_URL?.includes("127.0.0.1"))
  ) {
    warnings.push(
      "NEXT_PUBLIC_APP_URL still looks like a dev URL — set your canonical HTTPS domain.",
    );
  }
  const anon = p.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (anon.length > 0 && anon.length < 32) {
    warnings.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is unusually short — confirm it is not a placeholder.",
    );
  }
  const sk = p.STRIPE_SECRET_KEY ?? "";
  if (sk.startsWith("sk_live") && p.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test")) {
    warnings.push(
      "Stripe secret key is live mode but publishable key is test mode — align keys per environment.",
    );
  }

  return warnings;
}
