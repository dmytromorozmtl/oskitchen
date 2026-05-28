/**
 * Pilot integration health on Today command center — Evolution Era 18 Workstream C Cycle 11.
 *
 * Managers land on `/dashboard/today` post-auth; strip must appear on their primary surface.
 * Does not claim live marketplace ops or Shopify/Woo production SLA.
 */

export const PILOT_INTEGRATION_HEALTH_TODAY_ERA18_POLICY_ID =
  "era18-pilot-integration-health-today-v1" as const;

export const PILOT_INTEGRATION_HEALTH_TODAY_ERA18_PROOF_STATUS =
  "pilot_integration_health_today_wired" as const;

export const PILOT_INTEGRATION_HEALTH_TODAY_ERA18_ROUTE =
  "app/dashboard/today/page.tsx" as const;

export const PILOT_INTEGRATION_HEALTH_TODAY_ERA18_BACKLOG_ID = "KOS-E18-011" as const;
