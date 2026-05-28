/**
 * Enterprise SSO pilot setup focus — Evolution Era 18 Workstream A Cycle 40.
 *
 * Surfaces pilot SSO admin setup steps and row next actions on the SSO settings page.
 * Does not claim pilot_ready, IdP login PASS, or production SSO for all tenants.
 */

import { ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS } from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

export const ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_POLICY_ID =
  "era18-enterprise-sso-pilot-setup-focus-v1" as const;

/** Wired — IdP login proof remains ops-gated (`awaiting_idp_login_proof`). */
export const ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_PROOF_STATUS =
  "enterprise_sso_pilot_setup_focus_attention_wired" as const;

export const ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS =
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS;

export const ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-040" as const;

export const SSO_PILOT_STATUS_ANCHOR = "#sso-pilot-status" as const;
export const SSO_PILOT_ENTITLEMENT_ANCHOR = "#sso-pilot-entitlement" as const;
export const SSO_PILOT_CONFIGURATION_ANCHOR = "#sso-pilot-configuration" as const;
export const SSO_PILOT_ACTIVATION_ANCHOR = "#sso-pilot-activation" as const;
export const SSO_PILOT_LOGIN_ENTRY_ANCHOR = "#sso-pilot-login-entry" as const;

export const SSO_PILOT_BILLING_PLANS_ROUTE = "/dashboard/billing/plans" as const;
export const SSO_PILOT_LOGIN_ROUTE = "/login" as const;

export const SSO_PILOT_STAGING_SMOKE_PLAN_DOC =
  "docs/enterprise-sso-idp-staging-smoke-plan.md" as const;

export const SSO_PILOT_OPERATOR_RUNBOOK_DOC =
  "docs/enterprise-sso-operator-runbook-era17.md" as const;
