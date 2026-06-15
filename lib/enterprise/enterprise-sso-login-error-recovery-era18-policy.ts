/**
 * Enterprise SSO login error recovery — Evolution Era 18 Workstream A Cycle 42.
 *
 * Maps SSO login failure codes to operator recovery hints on /login.
 * Does not claim IdP login PASS or production SSO for all tenants.
 */

import { ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS } from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

export const ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_POLICY_ID =
  "era18-enterprise-sso-login-error-recovery-v1" as const;

export const ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_PROOF_STATUS =
  "enterprise_sso_login_error_recovery_wired" as const;

export const ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS =
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS;

export const ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_BACKLOG_ID = "KOS-E18-042" as const;

export const SSO_LOGIN_FAILURE_CODES = [
  "workspace_not_found",
  "sso_not_configured",
  "sso_disabled",
  "missing_domain",
  "supabase_error",
  "missing_redirect_url",
] as const;

export type SsoLoginFailureCode = (typeof SSO_LOGIN_FAILURE_CODES)[number];

export const SSO_LOGIN_ADMIN_SETTINGS_ROUTE = "/dashboard/settings/security/sso" as const;

export const SSO_LOGIN_BREAK_GLASS_HINT =
  "Workspace owners with break-glass enabled can sign in with email and password above." as const;
