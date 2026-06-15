/**
 * Supabase SSO login initiation — pilot workspace entry only.
 */

import {
  evaluateWorkspaceSsoRuntimeGate,
  resolveSsoLoginDomain,
  type WorkspaceSsoSettingsSnapshot,
} from "@/lib/enterprise/workspace-sso-foundation";
import { SSO_CALLBACK_WORKSPACE_QUERY_PARAM } from "@/lib/enterprise/workspace-sso-runtime-adapter";
import { authCallbackUrl } from "@/lib/auth/public-site-url";
import { safeInternalNextPath } from "@/lib/auth/safe-redirect";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

import type { SsoLoginFailureCode } from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18-policy";

export type { SsoLoginFailureCode };

export type ResolveWorkspaceSsoLoginTargetResult =
  | {
      ok: true;
      workspaceId: string;
      domain: string;
      settings: WorkspaceSsoSettingsSnapshot;
    }
  | { ok: false; reason: "not_found" | "not_configured" | "disabled" | "missing_domain" };

function toSnapshot(row: {
  enabled: boolean;
  idpVendor: WorkspaceSsoSettingsSnapshot["idpVendor"];
  allowedEmailDomains: string[];
  pilotPhase: WorkspaceSsoSettingsSnapshot["pilotPhase"];
  breakGlassOwnerEnabled: boolean;
  supabaseSsoProviderRef: string | null;
  loginHintDomain: string | null;
}): WorkspaceSsoSettingsSnapshot {
  return {
    enabled: row.enabled,
    idpVendor: row.idpVendor,
    allowedEmailDomains: row.allowedEmailDomains,
    pilotPhase: row.pilotPhase,
    breakGlassOwnerEnabled: row.breakGlassOwnerEnabled,
    supabaseSsoProviderRef: row.supabaseSsoProviderRef,
    loginHintDomain: row.loginHintDomain,
  };
}

export async function resolveWorkspaceSsoLoginTarget(
  workspaceId: string,
): Promise<ResolveWorkspaceSsoLoginTargetResult> {
  const trimmed = workspaceId.trim();
  if (!trimmed) return { ok: false, reason: "not_found" };

  const workspace = await prisma.workspace.findUnique({
    where: { id: trimmed },
    select: { id: true },
  });
  if (!workspace) return { ok: false, reason: "not_found" };

  const row = await prisma.workspaceSsoSettings.findUnique({
    where: { workspaceId: workspace.id },
  });
  if (!row) return { ok: false, reason: "not_configured" };

  const settings = toSnapshot(row);
  const gate = evaluateWorkspaceSsoRuntimeGate(settings);
  if (!gate.allowed) return { ok: false, reason: "disabled" };

  const domain = resolveSsoLoginDomain(settings);
  if (!domain) return { ok: false, reason: "missing_domain" };

  return { ok: true, workspaceId: workspace.id, domain, settings };
}

export function buildSsoAuthCallbackUrl(input: {
  workspaceId: string;
  nextPath?: string | null;
}): string {
  const next = safeInternalNextPath(input.nextPath, "/dashboard/today");
  const base = authCallbackUrl(next);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${SSO_CALLBACK_WORKSPACE_QUERY_PARAM}=${encodeURIComponent(input.workspaceId)}`;
}

export type InitiateWorkspaceSsoLoginResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string; code: SsoLoginFailureCode };

function mapResolveFailureReason(
  reason: Exclude<ResolveWorkspaceSsoLoginTargetResult, { ok: true }>["reason"],
): InitiateWorkspaceSsoLoginResult {
  switch (reason) {
    case "not_found":
      return { ok: false, error: "Workspace not found.", code: "workspace_not_found" };
    case "not_configured":
      return {
        ok: false,
        error: "SSO is not configured for this workspace.",
        code: "sso_not_configured",
      };
    case "missing_domain":
      return {
        ok: false,
        error: "SSO login domain is not configured.",
        code: "missing_domain",
      };
    default:
      return {
        ok: false,
        error: "SSO login is not enabled for this workspace.",
        code: "sso_disabled",
      };
  }
}

/** Initiate Supabase SAML/OIDC SSO redirect for a pilot-active workspace. */
export async function initiateWorkspaceSsoLogin(input: {
  workspaceId: string;
  nextPath?: string | null;
}): Promise<InitiateWorkspaceSsoLoginResult> {
  const target = await resolveWorkspaceSsoLoginTarget(input.workspaceId);
  if (!target.ok) {
    return mapResolveFailureReason(target.reason);
  }

  const redirectTo = buildSsoAuthCallbackUrl({
    workspaceId: target.workspaceId,
    nextPath: input.nextPath,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithSSO({
    domain: target.domain,
    options: { redirectTo },
  });

  if (error) {
    return { ok: false, error: error.message, code: "supabase_error" };
  }
  if (!data?.url) {
    return {
      ok: false,
      error: "SSO redirect URL was not returned by Supabase.",
      code: "missing_redirect_url",
    };
  }

  return { ok: true, redirectUrl: data.url };
}
