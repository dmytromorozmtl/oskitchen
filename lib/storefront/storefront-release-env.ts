/**
 * Storefront production readiness checks — never logs secret values.
 */
import { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";
import { isStripeSecretConfigured } from "@/lib/storefront/stripe-readiness";
import { isTurnstileConfigured } from "@/lib/storefront/turnstile";

export type StorefrontEnvCheck = {
  id: string;
  label: string;
  level: "critical" | "warning" | "info";
  passed: boolean;
  detail: string;
};

function present(key: string, env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env[key]?.trim());
}

function minLength(key: string, min: number, env: NodeJS.ProcessEnv = process.env): boolean {
  const v = env[key]?.trim();
  return Boolean(v && v.length >= min);
}

/** Hostnames that must not ship to Vercel Production. */
export function isPlaceholderAppHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  const blocked = [
    "yourdomain.com",
    "example.com",
    "example.org",
    "example.net",
    "test",
    "invalid",
    "changeme",
    "placeholder",
  ];
  if (blocked.some((b) => h === b || h.endsWith(`.${b}`))) return true;
  if (h.includes("yourdomain")) return true;
  return false;
}

export function isPlaceholderAppUrl(raw: string): boolean {
  try {
    return isPlaceholderAppHost(new URL(raw).hostname);
  } catch {
    return true;
  }
}

function appUrlValid(env: NodeJS.ProcessEnv = process.env): { ok: boolean; detail: string } {
  const raw = env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return { ok: false, detail: "Not set" };
  if (raw.endsWith("/")) return { ok: false, detail: "Remove trailing slash" };
  try {
    const u = new URL(raw);
    if (isPlaceholderAppHost(u.hostname)) {
      return {
        ok: false,
        detail: `Placeholder host "${u.hostname}" — set real prod URL in .env.production.local + Vercel`,
      };
    }
    const target = env.STOREFRONT_ENV_TARGET?.trim() || "production";
    if (target === "production" && u.protocol !== "https:") {
      return { ok: false, detail: "Use https:// for production (not http://localhost)" };
    }
    if (u.protocol !== "https:" && env.NODE_ENV === "production") {
      return { ok: false, detail: "Use https:// in production" };
    }
    return { ok: true, detail: u.host };
  } catch {
    return { ok: false, detail: "Invalid URL" };
  }
}

export function evaluateStorefrontReleaseEnv(
  opts?: {
    requireStripe?: boolean;
    requireEmail?: boolean;
    /** Week 1 hardening — treat Turnstile as warning if missing */
    week1Mode?: boolean;
  },
): StorefrontEnvCheck[] {
  const requireStripe = opts?.requireStripe ?? false;
  const requireEmail = opts?.requireEmail ?? false;
  const week1 = opts?.week1Mode ?? false;
  const checks: StorefrontEnvCheck[] = [];

  const dbOk = present("DATABASE_URL");
  checks.push({
    id: "database_url",
    label: "DATABASE_URL",
    level: "critical",
    passed: dbOk,
    detail: dbOk ? "Set" : "Required for runtime",
  });

  const directOk = present("DIRECT_URL");
  checks.push({
    id: "direct_url",
    label: "DIRECT_URL",
    level: "warning",
    passed: directOk,
    detail: directOk ? "Set (migrations)" : "Required for Prisma migrate deploy",
  });

  const app = appUrlValid();
  checks.push({
    id: "app_url",
    label: "NEXT_PUBLIC_APP_URL",
    level: "critical",
    passed: app.ok,
    detail: app.detail,
  });

  const mwOk = minLength("STOREFRONT_MIDDLEWARE_SECRET", 32);
  checks.push({
    id: "middleware_secret",
    label: "STOREFRONT_MIDDLEWARE_SECRET",
    level: "critical",
    passed: mwOk,
    detail: mwOk ? "≥32 chars" : "Required for custom host + redirects",
  });

  const cronOk = minLength("CRON_SECRET", 16);
  checks.push({
    id: "cron_secret",
    label: "CRON_SECRET",
    level: "critical",
    passed: cronOk,
    detail: cronOk ? "Set" : "Cron routes return 401 without it",
  });

  const authOk = present("AUTH_SECRET") || present("NEXTAUTH_SECRET");
  checks.push({
    id: "auth_secret",
    label: "AUTH_SECRET / NEXTAUTH_SECRET",
    level: "critical",
    passed: authOk,
    detail: authOk ? "Set" : "Dashboard sessions will fail",
  });

  if (requireEmail) {
    const emailOk = present("RESEND_API_KEY");
    checks.push({
      id: "resend",
      label: "RESEND_API_KEY",
      level: "critical",
      passed: emailOk,
      detail: emailOk ? "Set" : "Required for team invites and order emails",
    });
    const fromOk = present("RESEND_FROM_EMAIL");
    checks.push({
      id: "resend_from",
      label: "RESEND_FROM_EMAIL",
      level: "critical",
      passed: fromOk,
      detail: fromOk ? "Set" : "Verified sender domain required on prod",
    });
  }

  if (requireStripe) {
    const stripeOk = isStripeSecretConfigured();
    checks.push({
      id: "stripe_secret",
      label: "STRIPE_SECRET_KEY",
      level: "critical",
      passed: stripeOk,
      detail: stripeOk ? "Configured" : "Required for online checkout",
    });
    const whOk = present("STRIPE_WEBHOOK_SECRET");
    checks.push({
      id: "stripe_webhook",
      label: "STRIPE_WEBHOOK_SECRET",
      level: "critical",
      passed: whOk,
      detail: whOk ? "Set" : "Paid orders need checkout.session.completed webhook",
    });
    const pubOk = present("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    checks.push({
      id: "stripe_publishable",
      label: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      level: "warning",
      passed: pubOk,
      detail: pubOk ? "Set" : "Optional for Checkout redirect-only",
    });
  }

  const supabasePublic =
    present("NEXT_PUBLIC_SUPABASE_URL") && present("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  checks.push({
    id: "supabase_public",
    label: "Supabase public keys",
    level: "warning",
    passed: supabasePublic,
    detail: supabasePublic ? "Set" : "Dashboard auth / some features need public Supabase keys",
  });

  const turnstileOn = isTurnstileConfigured();
  checks.push({
    id: "turnstile",
    label: "Turnstile (checkout + contact)",
    level: week1 ? "warning" : "info",
    passed: turnstileOn,
    detail: turnstileOn
      ? "Site + secret keys set — CAPTCHA enforced when keys present"
      : week1
        ? "Recommended for prod — rate limits still apply without keys"
        : "Optional — rate limits still apply; set keys for prod hardening",
  });

  const rootDomain = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.trim();
  const rootOk = Boolean(rootDomain && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(rootDomain));
  checks.push({
    id: "storefront_root_domain",
    label: "NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN",
    level: "warning",
    passed: rootOk,
    detail: rootOk
      ? rootDomain!
      : "Set for brand/market vanity hosts (e.g. kitchenos.com) — required before wildcard DNS",
  });

  const redirectsOn = process.env.STOREFRONT_REDIRECTS_ENABLED === "true";
  checks.push({
    id: "redirects_flag",
    label: "STOREFRONT_REDIRECTS_ENABLED",
    level: week1 ? "warning" : "info",
    passed: redirectsOn,
    detail: redirectsOn ? "true — middleware uses redirect table" : "Not enabled — vanity redirects inactive",
  });

  const mediaOn = isStorefrontMediaUploadConfigured();
  checks.push({
    id: "media_bucket",
    label: "Storefront media bucket",
    level: "info",
    passed: mediaOn,
    detail: mediaOn ? "Storage provider configured" : "HTTPS URLs only until bucket env set (Phase C)",
  });

  const previewOk =
    minLength("STOREFRONT_PREVIEW_SECRET", 32) || minLength("AUTH_SECRET", 32);
  checks.push({
    id: "preview_secret",
    label: "Preview signing",
    level: "warning",
    passed: previewOk,
    detail: previewOk
      ? "STOREFRONT_PREVIEW_SECRET or AUTH_SECRET usable"
      : "Signed draft preview may be unavailable",
  });

  return checks;
}

export function storefrontReleaseEnvSummary(checks: StorefrontEnvCheck[]): {
  criticalFailed: number;
  warningFailed: number;
  allCriticalPassed: boolean;
} {
  const criticalFailed = checks.filter((c) => c.level === "critical" && !c.passed).length;
  const warningFailed = checks.filter((c) => c.level === "warning" && !c.passed).length;
  return {
    criticalFailed,
    warningFailed,
    allCriticalPassed: criticalFailed === 0,
  };
}
