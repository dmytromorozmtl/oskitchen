export type RateLimitPolicy = { windowMs: number; max: number };

export const RATE_LIMIT_POLICIES = {
  beta_application: { windowMs: 60_000, max: 8 },
  book_demo: { windowMs: 60_000, max: 6 },
  /** Advisory board application — per IP. */
  advisory_board: { windowMs: 60_000, max: 6 },
  contact_sales: { windowMs: 60_000, max: 6 },
  partner_lead: { windowMs: 60_000, max: 6 },
  /** ROI calculator marketing lead — per IP. */
  roi_lead: { windowMs: 60_000, max: 6 },
  support_public: { windowMs: 60_000, max: 10 },
  support_authed: { windowMs: 60_000, max: 40 },
  public_api_orders_post: { windowMs: 60_000, max: 120 },
  public_api_orders_get: { windowMs: 60_000, max: 120 },
  public_api_customers_get: { windowMs: 60_000, max: 60 },
  public_api_v1_get: { windowMs: 60_000, max: 120 },
  public_api_v1_post: { windowMs: 60_000, max: 120 },
  /** SaaS billing Stripe checkout session — per authenticated user + IP. */
  billing_checkout: { windowMs: 60_000, max: 15 },
  /** Stripe billing portal session — per authenticated user + IP. */
  billing_portal: { windowMs: 60_000, max: 10 },
  /** IoT temperature ingest — per IP + device id. */
  iot_ingest: { windowMs: 60_000, max: 120 },
  /** Uber Direct / delivery adapter — per authenticated owner + IP. */
  delivery_api: { windowMs: 60_000, max: 40 },
  /** High ceiling for verified webhook ingress — only enforced when Upstash is configured (see rate-limit service). */
  webhook_ingest: { windowMs: 60_000, max: 5000 },
  /** POS terminal CRM search — per authenticated owner; uses active adapter (memory / Upstash / Redis). */
  pos_crm_customer_search: { windowMs: 60_000, max: 90 },
  /** POS quick-add / upsert customer — stricter than search to limit abuse. */
  pos_crm_customer_upsert: { windowMs: 60_000, max: 30 },
  /** Public storefront checkout — per IP. */
  storefront_checkout_submit: { windowMs: 60_000, max: 12 },
  /** Stripe checkout retry link — per IP + order token (stricter than first submit). */
  storefront_checkout_retry: { windowMs: 60_000, max: 6 },
  /** Public B2B invoice pay portal — per IP + signed token. */
  b2b_pay_portal_checkout: { windowMs: 60_000, max: 8 },
  /** First-party analytics beacon — per IP + store slug suffix applied at call site. */
  storefront_analytics_ingest: { windowMs: 60_000, max: 180 },
  /** Contact / catering legacy forms — per IP. */
  storefront_contact_submit: { windowMs: 60_000, max: 8 },
  /** Public storefront form file upload — per IP. */
  storefront_form_upload: { windowMs: 3_600_000, max: 10 },
  storefront_cart_sync: { windowMs: 60_000, max: 60 },
  /** Magic-link storefront team invite — per IP. */
  storefront_invite_magic: { windowMs: 60_000, max: 12 },
  /** Admin preview cookie mint — per IP. */
  storefront_preview_token: { windowMs: 60_000, max: 10 },
  /** Abandoned cart recovery API — per IP + store. */
  storefront_cart_recovery: { windowMs: 60_000, max: 30 },
  /** Guest magic-link account — per IP + store. */
  storefront_guest_account: { windowMs: 60_000, max: 5 },
  /** Storefront account session probe — per IP. */
  storefront_account_session: { windowMs: 60_000, max: 60 },
  /** Public redirect resolver — per IP. */
  storefront_resolve_redirect: { windowMs: 60_000, max: 200 },
  /** Theme experiment beacon — per IP. */
  storefront_theme_experiment: { windowMs: 60_000, max: 50 },
  /** Experiment approval webhooks — per IP. */
  storefront_experiment_api: { windowMs: 60_000, max: 100 },
  /** OpenAI copilot chat — per workspace per minute. */
  ai_copilot: { windowMs: 60_000, max: 20 },
  /** Invoice OCR (Vision) — per workspace per minute (each call consumes 3 tokens). */
  ai_ocr: { windowMs: 60_000, max: 8 },
  /** AI forecasting / narrative — per workspace per minute. */
  ai_forecast: { windowMs: 60_000, max: 15 },
} satisfies Record<string, RateLimitPolicy>;

export type RateLimitPolicyKey = keyof typeof RATE_LIMIT_POLICIES;

export const PRODUCTION_CRITICAL_RATE_LIMIT_POLICIES: RateLimitPolicyKey[] = [
  "public_api_orders_post",
  "public_api_orders_get",
  "public_api_customers_get",
  "public_api_v1_get",
  "public_api_v1_post",
  "webhook_ingest",
  "storefront_checkout_submit",
  "storefront_checkout_retry",
  "storefront_cart_sync",
  "storefront_invite_magic",
  "storefront_guest_account",
  "storefront_account_session",
  "billing_portal",
  "iot_ingest",
];

export function isProductionCriticalRateLimitPolicy(
  policyKey: RateLimitPolicyKey,
): boolean {
  return PRODUCTION_CRITICAL_RATE_LIMIT_POLICIES.includes(policyKey);
}
