/**
 * Owner Daily Briefing risk radar — Evolution Era 19 Workstream B Cycle 15.
 *
 * Surfaces commercial, P0, integration, and operational risk signals with honest states only.
 */

export const OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-risk-radar-v1" as const;

export const OWNER_DAILY_BRIEFING_RISK_RADAR_ANCHOR =
  "#owner-briefing-risk-radar" as const;

export const OWNER_DAILY_BRIEFING_RISK_CATEGORIES = [
  "p0_proof",
  "commercial_gono_go",
  "live_smoke",
  "sso_proof",
  "stuck_orders",
  "overdue_production",
  "integration_failure",
  "support_sla",
  "low_stock",
  "blocker",
] as const;

export type OwnerDailyBriefingRiskCategory =
  (typeof OWNER_DAILY_BRIEFING_RISK_CATEGORIES)[number];

export const OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL: Record<
  OwnerDailyBriefingRiskCategory,
  string
> = {
  p0_proof: "P0 proof",
  commercial_gono_go: "Pilot GO/NO-GO",
  live_smoke: "Live smoke",
  sso_proof: "SSO proof",
  stuck_orders: "Stuck orders",
  overdue_production: "Production",
  integration_failure: "Integrations",
  support_sla: "Support",
  low_stock: "Inventory",
  blocker: "Blocker",
};
