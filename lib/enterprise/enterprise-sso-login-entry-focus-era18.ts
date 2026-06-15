import {
  SSO_LOGIN_ROUTE,
  SSO_LOGIN_WORKSPACE_QUERY_ALIAS,
  SSO_LOGIN_WORKSPACE_QUERY_PARAM,
} from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18-policy";

export type SsoLoginSearchParamsReader = {
  get(name: string): string | null;
};

export type SsoLoginPilotContext = {
  workspaceId: string;
  headline: string;
  detail: string;
};

export function parseSsoLoginWorkspaceId(
  searchParams: SsoLoginSearchParamsReader,
): string | null {
  const raw =
    searchParams.get(SSO_LOGIN_WORKSPACE_QUERY_PARAM) ??
    searchParams.get(SSO_LOGIN_WORKSPACE_QUERY_ALIAS);
  if (!raw) return null;

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildSsoPilotLoginUrl(
  workspaceId: string,
  nextPath?: string | null,
): string {
  const params = new URLSearchParams();
  params.set(SSO_LOGIN_WORKSPACE_QUERY_PARAM, workspaceId.trim());
  const redirect = nextPath?.trim();
  if (redirect) {
    params.set("redirect", redirect);
  }
  return `${SSO_LOGIN_ROUTE}?${params.toString()}`;
}

export function shouldShowSsoLoginPilotContextStrip(workspaceId: string | null): boolean {
  return workspaceId !== null && workspaceId.length > 0;
}

export function buildSsoLoginPilotContext(workspaceId: string | null): SsoLoginPilotContext | null {
  if (!workspaceId) return null;

  return {
    workspaceId,
    headline: "Pilot workspace ready",
    detail:
      "Workspace ID pre-filled from your admin link. Use your company email domain — SSO must be active for this workspace.",
  };
}
