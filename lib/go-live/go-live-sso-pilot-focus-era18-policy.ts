/**
 * Go-live SSO pilot focus — Evolution Era 18 Workstream O Cycle 45.
 *
 * Surfaces enterprise SSO pilot gaps on launch validation when ssoOidc entitlement exists.
 * Does not claim pilot_ready, IdP login PASS, or production SSO for all tenants.
 */

import { GO_LIVE_FOCUS_ERA18_POLICY_ID } from "@/lib/go-live/go-live-focus-era18-policy";

export const GO_LIVE_SSO_PILOT_FOCUS_ERA18_POLICY_ID =
  "era18-go-live-sso-pilot-focus-v1" as const;

export const GO_LIVE_SSO_PILOT_FOCUS_ERA18_EXTENDS_POLICIES = [
  GO_LIVE_FOCUS_ERA18_POLICY_ID,
  "era18-enterprise-sso-pilot-setup-focus-v1",
] as const;

export const GO_LIVE_SSO_PILOT_FOCUS_ERA18_PROOF_STATUS =
  "go_live_sso_pilot_gate_wired" as const;

export const GO_LIVE_SSO_PILOT_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-045" as const;

export const GO_LIVE_SSO_PILOT_SETTINGS_ROUTE =
  "/dashboard/settings/security/sso" as const;

export const GO_LIVE_SSO_PILOT_CONFIGURATION_ANCHOR =
  "#sso-pilot-configuration" as const;

export const GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR = "#sso-pilot-activation" as const;

export const GO_LIVE_SSO_PILOT_BLOCKER_KEY = "sso_pilot_incomplete" as const;
