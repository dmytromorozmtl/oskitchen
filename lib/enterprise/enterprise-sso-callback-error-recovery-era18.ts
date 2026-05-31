import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import type { SsoLoginErrorRecovery } from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18";
import { SSO_LOGIN_BREAK_GLASS_HINT } from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18-policy";
import {
  SSO_CALLBACK_LOGIN_ERROR_CODES,
  type SsoCallbackLoginErrorCode,
} from "@/lib/enterprise/enterprise-sso-callback-error-recovery-era18-policy";

export type { SsoLoginErrorRecovery };

export function isSsoCallbackLoginErrorCode(
  value: string | undefined | null,
): value is SsoCallbackLoginErrorCode {
  if (!value) return false;
  return (SSO_CALLBACK_LOGIN_ERROR_CODES as readonly string[]).includes(value);
}

/** Operator-facing recovery after SSO callback deny redirects to /login. */
export function resolveSsoCallbackLoginErrorRecovery(input: {
  errorCode: string;
  workspaceId?: string | null;
}): SsoLoginErrorRecovery | null {
  if (!isSsoCallbackLoginErrorCode(input.errorCode)) return null;

  const workspaceId = input.workspaceId?.trim() ?? "";
  const retryHref = workspaceId ? buildSsoPilotLoginUrl(workspaceId) : null;
  const retryLabel = workspaceId ? "Retry SSO sign-in" : null;

  switch (input.errorCode) {
    case "sso_domain_denied":
      return {
        title: "Email domain not allowed",
        detail:
          "Your IdP email doesn't match the pilot workspace allowed domains. Use your company email or ask an admin to update SSO settings.",
        href: retryHref,
        ctaLabel: retryLabel,
        tone: "urgent",
      };
    case "sso_entitlement_denied":
      return {
        title: "SSO entitlement missing",
        detail:
          "This workspace plan doesn't include the ssoOidc entitlement. Ask the workspace owner before retrying SSO.",
        href: null,
        ctaLabel: null,
        tone: "urgent",
      };
    case "sso_workspace_denied":
      return {
        title: "Workspace access denied",
        detail:
          "Your OS Kitchen account isn't linked to this pilot workspace. Ask an admin to invite you as staff, then retry SSO.",
        href: retryHref,
        ctaLabel: retryLabel,
        tone: "urgent",
      };
    case "sso_subject_missing":
      return {
        title: "IdP identity incomplete",
        detail:
          "Supabase didn't receive a stable IdP subject from SAML. Confirm NameID format and IdP metadata with your admin.",
        href: retryHref,
        ctaLabel: retryLabel,
        tone: "urgent",
      };
    case "sso_idp_mismatch":
      return {
        title: "IdP vendor mismatch",
        detail:
          "You signed in with a different IdP than configured for this pilot tenant (Okta vs Microsoft Entra ID).",
        href: retryHref,
        ctaLabel: retryLabel,
        tone: "urgent",
      };
    case "sso_denied":
      return {
        title: "SSO sign-in denied after IdP callback",
        detail: `Pilot SSO rejected this login. Confirm SSO is active, your email domain is allowed, and you have workspace access. ${SSO_LOGIN_BREAK_GLASS_HINT}`,
        href: retryHref,
        ctaLabel: retryLabel,
        tone: "urgent",
      };
    default:
      return null;
  }
}

export function parseSsoCallbackLoginErrorFromSearchParams(searchParams: {
  get(name: string): string | null;
}): string | null {
  const error = searchParams.get("error")?.trim();
  return error && isSsoCallbackLoginErrorCode(error) ? error : null;
}
