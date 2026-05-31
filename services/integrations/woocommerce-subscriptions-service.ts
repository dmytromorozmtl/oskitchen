import type { WooCredentials } from "@/services/integrations/woocommerce";

export type WooSubscriptionSummary = {
  externalSubscriptionId: string;
  status: string;
  customerEmail: string | null;
  billingInterval: string | null;
  billingPeriod: string | null;
  total: string | null;
  currency: string | null;
  nextPaymentDate: string | null;
  productNames: string[];
};

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function wooSubscriptionsRestUrl(baseUrl: string, path: string): string {
  return `${stripTrailingSlash(baseUrl)}/wp-json/wc/v3/subscriptions${path}`;
}

function basicAuthHeader(key: string, secret: string): string {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

export function normalizeWooSubscription(raw: Record<string, unknown>): WooSubscriptionSummary {
  const billing = (raw.billing_period as string | undefined) ?? null;
  const interval = raw.billing_interval != null ? String(raw.billing_interval) : null;
  const lineItems = Array.isArray(raw.line_items) ? raw.line_items : [];
  const productNames = lineItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = (item as Record<string, unknown>).name;
      return typeof name === "string" ? name : null;
    })
    .filter((name): name is string => Boolean(name));

  const billingRecord =
    raw.billing && typeof raw.billing === "object"
      ? (raw.billing as Record<string, unknown>)
      : null;

  return {
    externalSubscriptionId: String(raw.id ?? ""),
    status: String(raw.status ?? "unknown"),
    customerEmail:
      billingRecord?.email != null
        ? String(billingRecord.email)
        : raw.customer_email != null
          ? String(raw.customer_email)
          : null,
    billingInterval: interval,
    billingPeriod: billing,
    total: raw.total != null ? String(raw.total) : null,
    currency: raw.currency != null ? String(raw.currency) : null,
    nextPaymentDate:
      raw.next_payment_date != null ? String(raw.next_payment_date) : null,
    productNames,
  };
}

/** Phase 1 — read-only import from WooCommerce Subscriptions REST (no writes). */
export async function fetchWooSubscriptionsReadOnly(
  creds: WooCredentials,
  page = 1,
  perPage = 50,
): Promise<WooSubscriptionSummary[]> {
  const url = new URL(wooSubscriptionsRestUrl(creds.baseUrl, ""));
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString(), {
    headers: { Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret) },
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error(
      "WooCommerce Subscriptions endpoint not found — install the official Subscriptions extension.",
    );
  }
  if (!res.ok) {
    throw new Error(`Woo subscriptions ${res.status}`);
  }

  const rows = (await res.json()) as unknown[];
  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map(normalizeWooSubscription);
}

export async function fetchWooSubscriptionByIdReadOnly(
  creds: WooCredentials,
  subscriptionId: string,
): Promise<WooSubscriptionSummary | null> {
  const res = await fetch(wooSubscriptionsRestUrl(creds.baseUrl, `/${subscriptionId}`), {
    headers: { Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret) },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Woo subscription ${subscriptionId} ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  return normalizeWooSubscription(raw);
}
