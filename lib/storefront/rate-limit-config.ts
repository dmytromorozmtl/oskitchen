import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";

/** Route keys for storefront public API rate limiting. */
export type StorefrontRateLimitRouteKey =
  | "preview-token"
  | "forms-upload"
  | "cart-recovery"
  | "guest-account"
  | "account/session"
  | "resolve-redirect"
  | "theme-experiment"
  | "experiment";

/** Human-readable limits (window in seconds) — backed by RATE_LIMIT_POLICIES keys. */
export const STOREFRONT_RATE_LIMITS = {
  "preview-token": { max: 10, window: 60 },
  "forms-upload": { max: 20, window: 3600 },
  "cart-recovery": { max: 30, window: 60 },
  "guest-account": { max: 5, window: 60 },
  "account/session": { max: 60, window: 60 },
  "resolve-redirect": { max: 200, window: 60 },
  "theme-experiment": { max: 50, window: 60 },
  experiment: { max: 100, window: 60 },
} as const satisfies Record<StorefrontRateLimitRouteKey, { max: number; window: number }>;

/** Maps route keys to existing rate-limit policy keys in rate-limit-policies.ts */
export const STOREFRONT_ROUTE_POLICY: Record<StorefrontRateLimitRouteKey, RateLimitPolicyKey> = {
  "preview-token": "storefront_preview_token",
  "forms-upload": "storefront_form_upload",
  "cart-recovery": "storefront_cart_recovery",
  "guest-account": "storefront_guest_account",
  "account/session": "storefront_account_session",
  "resolve-redirect": "storefront_resolve_redirect",
  "theme-experiment": "storefront_theme_experiment",
  experiment: "storefront_experiment_api",
};
