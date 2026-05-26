import { resolvePublicSiteUrl } from "@/lib/auth/public-site-url";
import { hasKitchenOsStripeProductIdFallback } from "@/lib/billing/stripe-product-ids";
import { isValidStripePriceId } from "@/lib/billing/stripe-price-id";
import { resolvePlanPriceIdAsync } from "@/lib/billing/stripe-price-resolver";

export { isValidStripePriceId } from "@/lib/billing/stripe-price-id";

/**
 * Read-only diagnostics for Stripe configuration.
 * NEVER returns secret values. Returns presence + shape only.
 */

export type StripeDiagnosticsRow = {
  key: string;
  group: "Stripe" | "Webhooks" | "Prices" | "App";
  present: boolean;
  required: boolean;
  hint?: string;
  /** Shape hint (e.g. "test mode" / "live mode" / "price_..."). */
  shape?: string;
};

export type StripeDiagnostics = {
  rows: StripeDiagnosticsRow[];
  hasSecret: boolean;
  hasWebhookSecret: boolean;
  hasAllCheckoutPrices: boolean;
  hasAppUrl: boolean;
  liveMode: boolean | null;
  /** Secret + valid Starter/Pro/Team price IDs (checkout minimum). */
  configured: boolean;
};

function shapeOf(value: string | undefined, prefix?: string): string | undefined {
  if (!value) return undefined;
  if (prefix && value.startsWith(prefix)) return prefix.replace("_", "_") + "…";
  if (value.startsWith("sk_test")) return "test mode";
  if (value.startsWith("sk_live")) return "live mode";
  if (value.startsWith("pk_test")) return "publishable test";
  if (value.startsWith("pk_live")) return "publishable live";
  if (value.startsWith("whsec_")) return "whsec_…";
  if (value.startsWith("price_")) return "price_…";
  return value.length > 0 ? `${value.length} chars` : undefined;
}

export function getStripeDiagnostics(): StripeDiagnostics {
  const p = process.env;
  const secret = p.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = p.STRIPE_WEBHOOK_SECRET ?? "";
  const starter = p.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "";
  const pro = p.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "";
  const team = p.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ?? "";
  const enterprise = p.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ?? "";
  const publishable = p.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const appUrl = resolvePublicSiteUrl();

  const rows: StripeDiagnosticsRow[] = [
    {
      key: "STRIPE_SECRET_KEY",
      group: "Stripe",
      present: Boolean(secret),
      required: true,
      hint: "Server-only secret key. Never sent to the browser.",
      shape: shapeOf(secret, "sk_"),
    },
    {
      key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      group: "Stripe",
      present: Boolean(publishable),
      required: false,
      hint: "Optional today (no Elements yet); useful when adding embedded payment forms.",
      shape: shapeOf(publishable, "pk_"),
    },
    {
      key: "STRIPE_WEBHOOK_SECRET",
      group: "Webhooks",
      present: Boolean(webhookSecret),
      required: true,
      hint: "Required to verify webhook signatures.",
      shape: shapeOf(webhookSecret, "whsec_"),
    },
    {
      key: "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID",
      group: "Prices",
      present: isValidStripePriceId(starter),
      required: true,
      hint: "Must be a Stripe Price id (price_…), not a Product id.",
      shape: shapeOf(starter, "price_"),
    },
    {
      key: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
      group: "Prices",
      present: isValidStripePriceId(pro),
      required: true,
      hint: "Must be a Stripe Price id (price_…), not a Product id.",
      shape: shapeOf(pro, "price_"),
    },
    {
      key: "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID",
      group: "Prices",
      present: isValidStripePriceId(team),
      required: true,
      hint: "Must be a Stripe Price id (price_…), not a Product id.",
      shape: shapeOf(team, "price_"),
    },
    {
      key: "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID",
      group: "Prices",
      present: Boolean(enterprise),
      required: false,
      hint: "Only needed if Enterprise is offered via self-serve Stripe.",
      shape: shapeOf(enterprise, "price_"),
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      group: "App",
      present: Boolean(appUrl),
      required: true,
      hint: "Used for Stripe success/cancel and portal return URLs.",
      shape: appUrl ? new URL(appUrl).host : undefined,
    },
  ];

  const liveMode = secret ? secret.startsWith("sk_live") : null;
  const hasSecret = Boolean(secret.trim());
  const hasWebhookSecret = Boolean(webhookSecret.trim());
  const hasAppUrl = Boolean(appUrl.trim());
  const hasAllCheckoutPrices =
    isValidStripePriceId(starter) && isValidStripePriceId(pro) && isValidStripePriceId(team);
  const configured = hasSecret && hasAllCheckoutPrices && hasAppUrl;

  return {
    rows,
    hasSecret,
    hasWebhookSecret,
    hasAllCheckoutPrices,
    hasAppUrl,
    liveMode,
    configured,
  };
}

/**
 * True when hosted Checkout can be started (secret + price IDs + return URL).
 * Does NOT require webhook secret — webhooks only sync subscription state after payment.
 */
export function isStripeCheckoutReady(): boolean {
  const d = getStripeDiagnostics();
  if (!d.hasSecret || !d.hasAppUrl) return false;
  if (d.hasAllCheckoutPrices) return true;
  return hasKitchenOsStripeProductIdFallback();
}

/** Human-readable reason when checkout is blocked (for billing UI). */
export function getStripeCheckoutBlockReason(): string | null {
  const p = process.env;
  const d = getStripeDiagnostics();
  if (!d.hasSecret) {
    return "STRIPE_SECRET_KEY is missing on the server.";
  }
  const missingPrices: string[] = [];
  if (!isValidStripePriceId(p.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID)) {
    missingPrices.push("NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID");
  }
  if (!isValidStripePriceId(p.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)) {
    missingPrices.push("NEXT_PUBLIC_STRIPE_PRO_PRICE_ID");
  }
  if (!isValidStripePriceId(p.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID)) {
    missingPrices.push("NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID");
  }
  if (missingPrices.length) {
    if (hasKitchenOsStripeProductIdFallback()) {
      return null;
    }
    return `Stripe price IDs missing or invalid (must start with price_): ${missingPrices.join(", ")}.`;
  }
  if (!d.hasAppUrl) {
    return "NEXT_PUBLIC_APP_URL is required for Stripe success/cancel URLs.";
  }
  return null;
}

export type StripeConfigState =
  | "configured"
  | "partially-configured"
  | "missing"
  | "dev-disabled";

/** Diagnostics with server-side Stripe API resolution for empty price env vars. */
export async function getStripeDiagnosticsResolved(): Promise<StripeDiagnostics> {
  const base = getStripeDiagnostics();
  if (base.hasAllCheckoutPrices || !base.hasSecret) return base;

  const planEnv: Array<{ plan: "STARTER" | "PRO" | "TEAM"; key: string }> = [
    { plan: "STARTER", key: "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID" },
    { plan: "PRO", key: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID" },
    { plan: "TEAM", key: "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID" },
  ];

  const resolved = await Promise.all(
    planEnv.map(async ({ plan, key }) => {
      const priceId = await resolvePlanPriceIdAsync(plan);
      return { key, priceId };
    }),
  );

  const rows = base.rows.map((row) => {
    const hit = resolved.find((r) => r.key === row.key);
    if (!hit?.priceId) return row;
    return {
      ...row,
      present: true,
      shape: `${hit.priceId.slice(0, 14)}…`,
      hint: "Resolved from Stripe product (set NEXT_PUBLIC_* in Vercel for build-time)",
    };
  });

  const hasAllCheckoutPrices = resolved.every((r) => Boolean(r.priceId));
  const configured = base.hasSecret && hasAllCheckoutPrices && base.hasAppUrl;

  return {
    ...base,
    rows,
    hasAllCheckoutPrices,
    configured,
  };
}

export function getStripeConfigState(): StripeConfigState {
  if (process.env.DEV_BYPASS_BILLING === "true" && process.env.NODE_ENV === "development") {
    return "dev-disabled";
  }
  const d = getStripeDiagnostics();
  if (d.configured && d.hasWebhookSecret) return "configured";
  if (d.configured) return "partially-configured";
  if (d.hasSecret || d.hasAllCheckoutPrices || d.hasAppUrl) return "partially-configured";
  return "missing";
}

export async function getStripeConfigStateResolved(): Promise<StripeConfigState> {
  if (process.env.DEV_BYPASS_BILLING === "true" && process.env.NODE_ENV === "development") {
    return "dev-disabled";
  }
  const d = await getStripeDiagnosticsResolved();
  if (d.configured && d.hasWebhookSecret) return "configured";
  if (d.configured) return "partially-configured";
  if (d.hasSecret || d.hasAllCheckoutPrices || d.hasAppUrl) return "partially-configured";
  return "missing";
}
