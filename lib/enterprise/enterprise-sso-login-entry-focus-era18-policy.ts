/**
 * Enterprise SSO login entry focus — Evolution Era 18 Workstream A Cycle 41.
 *
 * Prefills pilot workspace context on /login from admin deep links.
 * Does not claim IdP login PASS or production SSO for all tenants.
 */

import { ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS } from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

export const ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_POLICY_ID =
  "era18-enterprise-sso-login-entry-focus-v1" as const;

/** Wired — IdP login proof remains ops-gated (`awaiting_idp_login_proof`). */
export const ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_PROOF_STATUS =
  "enterprise_sso_login_entry_pilot_context_wired" as const;

export const ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS =
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS;

export const ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-041" as const;

export const SSO_LOGIN_WORKSPACE_QUERY_PARAM = "workspaceId" as const;

/** Legacy alias accepted on /login for pilot deep links. */
export const SSO_LOGIN_WORKSPACE_QUERY_ALIAS = "workspace" as const;

export const SSO_LOGIN_ROUTE = "/login" as const;
