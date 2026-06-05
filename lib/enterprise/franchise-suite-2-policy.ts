/**
 * ENT-64 — Franchise Management Suite 2.0 (royalty, compliance, rollout).
 *
 * @see services/enterprise/franchise-service.ts
 * @see lib/enterprise/franchise-suite-2-builders.ts
 */

export const FRANCHISE_SUITE_2_POLICY_ID = "franchise-suite-2-ent64-v1" as const;

export const FRANCHISE_SUITE_2_PATH = "/dashboard/enterprise/franchise" as const;

export const FRANCHISE_ROLLOUT_PHASES = [
  "discovery",
  "training",
  "go_live",
  "certified",
] as const;

export const FRANCHISE_COMPLIANCE_CHECK_IDS = [
  "menu_standards",
  "brand_kit",
  "royalty_reporting",
  "ops_active",
] as const;

export const FRANCHISE_ROLLOUT_CERTIFIED_COMPLIANCE_PCT = 95 as const;

export const FRANCHISE_ROLLOUT_GO_LIVE_COMPLIANCE_PCT = 60 as const;
