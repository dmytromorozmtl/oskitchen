/**
 * Enterprise SSO callback error recovery — Evolution Era 18 Workstream A Cycle 44.
 *
 * Maps /auth/callback SSO deny redirects to operator recovery on /login.
 * Does not claim IdP login PASS or production SSO for all tenants.
 */

import { ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS } from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

export const ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_POLICY_ID =
  "era18-enterprise-sso-callback-error-recovery-v1" as const;

export const ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_PROOF_STATUS =
  "enterprise_sso_callback_error_recovery_wired" as const;

export const ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS =
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS;

export const ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_BACKLOG_ID = "KOS-E18-044" as const;

/** Login query error codes emitted by `/auth/callback` SSO deny redirects. */
export const SSO_CALLBACK_LOGIN_ERROR_CODES = [
  "sso_denied",
  "sso_domain_denied",
  "sso_entitlement_denied",
  "sso_workspace_denied",
  "sso_subject_missing",
  "sso_idp_mismatch",
] as const;

export type SsoCallbackLoginErrorCode = (typeof SSO_CALLBACK_LOGIN_ERROR_CODES)[number];

export const SSO_CALLBACK_LOGIN_ERROR_QUERY_PARAM = "error" as const;
