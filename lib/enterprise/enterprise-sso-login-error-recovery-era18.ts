import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import {
  SSO_LOGIN_BREAK_GLASS_HINT,
  type SsoLoginFailureCode,
} from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18-policy";

export type SsoLoginErrorRecovery = {
  title: string;
  detail: string;
  href: string | null;
  ctaLabel: string | null;
  tone: "urgent" | "normal";
};

export function isSsoLoginFailureCode(value: string | undefined | null): value is SsoLoginFailureCode {
  if (!value) return false;
  return (
    value === "workspace_not_found" ||
    value === "sso_not_configured" ||
    value === "sso_disabled" ||
    value === "missing_domain" ||
    value === "supabase_error" ||
    value === "missing_redirect_url"
  );
}

/** Operator-facing recovery for SSO login failures — honest pilot scope only. */
export function resolveSsoLoginErrorRecovery(input: {
  code?: string | null;
  error?: string | null;
  workspaceId?: string | null;
}): SsoLoginErrorRecovery {
  const workspaceId = input.workspaceId?.trim() ?? "";
  const code = isSsoLoginFailureCode(input.code) ? input.code : null;

  switch (code) {
    case "workspace_not_found":
      return {
        title: "Workspace not found",
        detail:
          "Double-check the workspace ID from your admin — typos and wrong pilot tenants block SSO sign-in.",
        href: workspaceId ? buildSsoPilotLoginUrl(workspaceId) : null,
        ctaLabel: workspaceId ? "Retry with same workspace" : null,
        tone: "urgent",
      };
    case "sso_not_configured":
      return {
        title: "SSO not configured yet",
        detail:
          "An admin must finish pilot IdP setup before staff can use Sign in with SSO. Ask them to complete the SSO pilot wizard.",
        href: null,
        ctaLabel: null,
        tone: "urgent",
      };
    case "sso_disabled":
      return {
        title: "SSO pilot not active",
        detail: `Pilot SSO is configured but not activated for this workspace. ${SSO_LOGIN_BREAK_GLASS_HINT}`,
        href: null,
        ctaLabel: null,
        tone: "urgent",
      };
    case "missing_domain":
      return {
        title: "SSO login domain missing",
        detail:
          "Allowed email domains or login hint domain are missing in pilot settings. Ask an admin to save IdP configuration again.",
        href: null,
        ctaLabel: null,
        tone: "urgent",
      };
    case "missing_redirect_url":
      return {
        title: "IdP redirect not returned",
        detail:
          "Supabase did not return an SSO redirect URL. Verify the SAML provider reference and IdP metadata, then retry.",
        href: workspaceId ? buildSsoPilotLoginUrl(workspaceId) : null,
        ctaLabel: workspaceId ? "Retry SSO sign-in" : null,
        tone: "urgent",
      };
    case "supabase_error":
      return {
        title: "IdP connection failed",
        detail:
          input.error?.trim() ||
          "Supabase could not start SSO. Confirm your email domain matches the pilot tenant and retry.",
        href: workspaceId ? buildSsoPilotLoginUrl(workspaceId) : null,
        ctaLabel: workspaceId ? "Retry SSO sign-in" : null,
        tone: "urgent",
      };
    default:
      return {
        title: "SSO sign-in failed",
        detail: input.error?.trim() || "Something went wrong starting SSO. Retry or use email sign-in above.",
        href: workspaceId ? buildSsoPilotLoginUrl(workspaceId) : null,
        ctaLabel: workspaceId ? "Retry SSO sign-in" : null,
        tone: "normal",
      };
  }
}
