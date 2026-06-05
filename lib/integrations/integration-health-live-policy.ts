/**
 * LIVE integration health dashboard — Phase 1 capstone (feature 18).
 */

import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

export const INTEGRATION_HEALTH_LIVE_POLICY_ID =
  "integration-health-live-dashboard-v1" as const;

export const INTEGRATION_HEALTH_LIVE_DASHBOARD_ROUTE =
  "/dashboard/integration-health/live" as const;

export const INTEGRATION_HEALTH_LIVE_DOC = "docs/INTEGRATION_HEALTH_LIVE.md" as const;

export const INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT =
  LIVE_INTEGRATION_REGISTRY_LIVE_COUNT;
