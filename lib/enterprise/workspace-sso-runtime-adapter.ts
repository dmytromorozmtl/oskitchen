/**
 * Workspace SSO R2 runtime adapter — callback validation and IdP subject extraction.
 * Fail-closed; does not initiate Supabase SAML login or expose production SSO UI.
 */

import type { SsoIdpVendor } from "@prisma/client";

import {
  evaluateWorkspaceSsoRuntimeGate,
  isEmailDomainAllowed,
  normalizeIdpSubject,
  type WorkspaceSsoSettingsSnapshot,
} from "@/lib/enterprise/workspace-sso-foundation";

/** Query param carrying pilot workspace id through Supabase SSO callback. */
export const SSO_CALLBACK_WORKSPACE_QUERY_PARAM = "sso_workspace_id" as const;

export type SsoCallbackDenyReason =
  | "missing_context"
  | "not_configured"
  | "runtime_gate_denied"
  | "domain_not_allowed"
  | "workspace_access_denied"
  | "entitlement_denied"
  | "missing_email"
  | "missing_idp_subject"
  | "idp_vendor_mismatch";

export type SupabaseSsoUserShape = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  identities?: Array<{
    provider?: string;
    identity_data?: Record<string, unknown>;
  }>;
};

export function parseSsoCallbackWorkspaceId(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get(SSO_CALLBACK_WORKSPACE_QUERY_PARAM);
  if (!raw?.trim()) return null;
  return raw.trim();
}

export function isSsoCallbackRequest(searchParams: URLSearchParams): boolean {
  return parseSsoCallbackWorkspaceId(searchParams) !== null;
}

export function mapSsoCallbackDenyReasonToLoginError(reason: SsoCallbackDenyReason): string {
  switch (reason) {
    case "domain_not_allowed":
      return "sso_domain_denied";
    case "entitlement_denied":
      return "sso_entitlement_denied";
    case "workspace_access_denied":
      return "sso_workspace_denied";
    case "missing_idp_subject":
      return "sso_subject_missing";
    case "idp_vendor_mismatch":
      return "sso_idp_mismatch";
    default:
      return "sso_denied";
  }
}

function readStringField(source: Record<string, unknown> | undefined, key: string): string | null {
  const value = source?.[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Extract IdP subject (SAML NameID / OIDC sub) from Supabase user payload. */
export function extractSsoIdpSubject(user: SupabaseSsoUserShape): string | null {
  const meta = user.app_metadata ?? {};
  const userMeta = user.user_metadata ?? {};
  const candidates = [
    readStringField(meta, "sso_subject"),
    readStringField(meta, "provider_id"),
    readStringField(meta, "sub"),
    readStringField(userMeta, "sub"),
    readStringField(userMeta, "name_id"),
  ];

  for (const candidate of candidates) {
    if (candidate) return normalizeIdpSubject(candidate);
  }

  for (const identity of user.identities ?? []) {
    const data = identity.identity_data ?? {};
    const sub = readStringField(data, "sub");
    if (sub) return normalizeIdpSubject(sub);
    const nameId =
      readStringField(data, "name_id") ??
      readStringField(data, "nameid") ??
      readStringField(data, "email");
    if (nameId) return normalizeIdpSubject(nameId);
  }

  return null;
}

/** Best-effort IdP vendor inference for tenant safety checks. */
export function inferSsoIdpVendorFromUser(user: SupabaseSsoUserShape): SsoIdpVendor | null {
  const hints: string[] = [];
  for (const identity of user.identities ?? []) {
    if (identity.provider) hints.push(identity.provider.toLowerCase());
  }
  const meta = user.app_metadata ?? {};
  for (const key of ["provider", "idp", "idp_vendor", "sso_provider"] as const) {
    const value = meta[key];
    if (typeof value === "string") hints.push(value.toLowerCase());
  }

  const joined = hints.join(" ");
  if (joined.includes("okta")) return "OKTA";
  if (joined.includes("auth0") || joined.includes("auth_0")) return "AUTH0";
  if (
    joined.includes("azure") ||
    joined.includes("entra") ||
    joined.includes("microsoft") ||
    joined.includes("aad")
  ) {
    return "ENTRA_ID";
  }
  return null;
}

export type ValidateSsoCallbackSessionInput = {
  workspaceId: string;
  userId: string;
  email: string | null | undefined;
  idpSubject: string | null;
  inferredIdpVendor: SsoIdpVendor | null;
  settings: WorkspaceSsoSettingsSnapshot | null;
  userHasWorkspaceAccess: boolean;
  ssoEntitlementEnabled: boolean;
};

export type ValidateSsoCallbackSessionResult =
  | { ok: true; idpVendor: SsoIdpVendor; idpSubject: string }
  | { ok: false; reason: SsoCallbackDenyReason };

/**
 * Pure validation for Supabase SSO callback after session exchange.
 * Denies by default when workspace SSO is disabled or tenant/domain rules fail.
 */
export function validateSsoCallbackSession(
  input: ValidateSsoCallbackSessionInput,
): ValidateSsoCallbackSessionResult {
  if (!input.workspaceId.trim()) {
    return { ok: false, reason: "missing_context" };
  }

  const gate = evaluateWorkspaceSsoRuntimeGate(input.settings);
  if (!gate.allowed) {
    if (!input.settings) return { ok: false, reason: "not_configured" };
    return { ok: false, reason: "runtime_gate_denied" };
  }

  if (!input.ssoEntitlementEnabled) {
    return { ok: false, reason: "entitlement_denied" };
  }

  if (!input.userHasWorkspaceAccess) {
    return { ok: false, reason: "workspace_access_denied" };
  }

  const email = input.email?.trim();
  if (!email) {
    return { ok: false, reason: "missing_email" };
  }

  if (!isEmailDomainAllowed(email, input.settings!.allowedEmailDomains)) {
    return { ok: false, reason: "domain_not_allowed" };
  }

  const idpSubject = input.idpSubject ? normalizeIdpSubject(input.idpSubject) : null;
  if (!idpSubject) {
    return { ok: false, reason: "missing_idp_subject" };
  }

  const configuredVendor = input.settings!.idpVendor;
  if (!configuredVendor) {
    return { ok: false, reason: "not_configured" };
  }

  if (
    input.inferredIdpVendor &&
    input.inferredIdpVendor !== configuredVendor
  ) {
    return { ok: false, reason: "idp_vendor_mismatch" };
  }

  return { ok: true, idpVendor: configuredVendor, idpSubject };
}
