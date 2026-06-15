/**
 * Era 17 public POST abuse review — high-risk unauthenticated or token-link POST routes.
 * Source of truth for Cycle 13 guard coverage; does not claim DDoS immunity or WAF parity.
 */

export type PublicPostAbuseRiskTier = "P1" | "P2";

export type PublicPostAbuseGuardKind =
  | "marketing_turnstile"
  | "ingest_bearer_rate_limit"
  | "storefront_route_rate_limit"
  | "billing_authenticated_rate_limit"
  | "public_api_guard";

export type PublicPostAbuseMatrixEntry = {
  apiPath: string;
  riskTier: PublicPostAbuseRiskTier;
  guardKind: PublicPostAbuseGuardKind;
  policyKey: string;
  era17Hardened: boolean;
  notes: string;
};

/** Routes hardened in Era 17 Cycle 23 (engineering cycle). */
export const PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS = [
  "/api/storefront/experiment/auto-conclude/approve",
  "/api/storefront/experiment/auto-conclude/reject",
  "/api/storefront/experiment/orchestrator/approve",
  "/api/iot/temperature",
  "/api/billing/portal",
  "/api/billing-portal",
] as const;

export const PUBLIC_POST_ABUSE_MATRIX_ENTRIES: PublicPostAbuseMatrixEntry[] = [
  {
    apiPath: "/api/storefront/experiment/auto-conclude/approve",
    riskTier: "P1",
    guardKind: "storefront_route_rate_limit",
    policyKey: "storefront_experiment_api",
    era17Hardened: true,
    notes: "Email-link theme publish; rate limit on GET+POST",
  },
  {
    apiPath: "/api/storefront/experiment/auto-conclude/reject",
    riskTier: "P1",
    guardKind: "storefront_route_rate_limit",
    policyKey: "storefront_experiment_api",
    era17Hardened: true,
    notes: "Email-link reject; rate limit on GET+POST",
  },
  {
    apiPath: "/api/storefront/experiment/orchestrator/approve",
    riskTier: "P1",
    guardKind: "storefront_route_rate_limit",
    policyKey: "storefront_experiment_api",
    era17Hardened: true,
    notes: "Orchestrator approval; POST now rate limited (GET already guarded)",
  },
  {
    apiPath: "/api/iot/temperature",
    riskTier: "P1",
    guardKind: "ingest_bearer_rate_limit",
    policyKey: "iot_ingest",
    era17Hardened: true,
    notes: "Bearer secret + per IP/device bucket",
  },
  {
    apiPath: "/api/billing/portal",
    riskTier: "P1",
    guardKind: "billing_authenticated_rate_limit",
    policyKey: "billing_portal",
    era17Hardened: true,
    notes: "Stripe portal session creation",
  },
  {
    apiPath: "/api/billing-portal",
    riskTier: "P1",
    guardKind: "billing_authenticated_rate_limit",
    policyKey: "billing_portal",
    era17Hardened: true,
    notes: "Legacy alias — same guard as /api/billing/portal",
  },
  {
    apiPath: "/api/leads/roi",
    riskTier: "P2",
    guardKind: "marketing_turnstile",
    policyKey: "roi_lead",
    era17Hardened: false,
    notes: "Era 2 fail-closed marketing guard",
  },
  {
    apiPath: "/api/public/v1/orders",
    riskTier: "P1",
    guardKind: "public_api_guard",
    policyKey: "public_api_orders_post",
    era17Hardened: false,
    notes: "Bearer API key + scope + rate limit via guardPublicApi",
  },
];

export function publicPostAbuseMatrixSummary() {
  const era17Count = PUBLIC_POST_ABUSE_MATRIX_ENTRIES.filter((e) => e.era17Hardened).length;
  const p1Count = PUBLIC_POST_ABUSE_MATRIX_ENTRIES.filter((e) => e.riskTier === "P1").length;
  return {
    totalEntries: PUBLIC_POST_ABUSE_MATRIX_ENTRIES.length,
    era17HardenedCount: era17Count,
    p1Count,
    hardenedPaths: [...PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS],
  };
}
