/**
 * Getting started pilot SSO step — Evolution Era 18 Workstream L Cycle 43.
 *
 * Surfaces enterprise SSO pilot setup on Today when ssoOidc entitlement exists.
 * Does not claim pilot_ready, IdP login PASS, or production SSO for all tenants.
 */

import { GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID } from "@/lib/onboarding/getting-started-pilot-channel-era18-policy";
import { GETTING_STARTED_FOCUS_ERA18_POLICY_ID } from "@/lib/onboarding/getting-started-focus-era18-policy";

export const GETTING_STARTED_PILOT_SSO_ERA18_POLICY_ID =
  "era18-getting-started-pilot-sso-v1" as const;

export const GETTING_STARTED_PILOT_SSO_ERA18_EXTENDS_POLICIES = [
  GETTING_STARTED_FOCUS_ERA18_POLICY_ID,
  GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID,
] as const;

export const GETTING_STARTED_PILOT_SSO_ERA18_PROOF_STATUS =
  "getting_started_pilot_sso_wired" as const;

export const GETTING_STARTED_PILOT_SSO_ERA18_BACKLOG_ID = "KOS-E18-043" as const;

export const GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE =
  "/dashboard/settings/security/sso" as const;

export const GETTING_STARTED_SSO_PILOT_CONFIGURATION_ANCHOR =
  "#sso-pilot-configuration" as const;

export const GETTING_STARTED_SSO_PILOT_ACTIVATION_ANCHOR = "#sso-pilot-activation" as const;
