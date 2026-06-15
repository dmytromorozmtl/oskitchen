/**
 * Workspace SSO R2 pilot foundation helpers — schema + domain safety only.
 * Does not initiate Supabase SAML login or expose SSO in production UI.
 */

import type { SsoIdpVendor, SsoPilotPhase } from "@prisma/client";

export type WorkspaceSsoSettingsSnapshot = {
  enabled: boolean;
  idpVendor: SsoIdpVendor | null;
  allowedEmailDomains: string[];
  pilotPhase: SsoPilotPhase;
  breakGlassOwnerEnabled: boolean;
  supabaseSsoProviderRef: string | null;
  loginHintDomain: string | null;
};

export const SSO_PILOT_PHASE_DISABLED: SsoPilotPhase = "DISABLED";

/** Default row shape for a pilot workspace — SSO remains off until Cycle 3+ wiring. */
export function buildDefaultWorkspaceSsoSettingsInput(workspaceId: string): {
  workspaceId: string;
  enabled: false;
  pilotPhase: typeof SSO_PILOT_PHASE_DISABLED;
  allowedEmailDomains: string[];
  breakGlassOwnerEnabled: true;
} {
  return {
    workspaceId,
    enabled: false,
    pilotPhase: SSO_PILOT_PHASE_DISABLED,
    allowedEmailDomains: [],
    breakGlassOwnerEnabled: true,
  };
}

/** Pilot-only configuration seed — still leaves enabled=false until runtime cycle explicitly activates. */
export function buildPilotConfiguredWorkspaceSsoSettingsInput(input: {
  workspaceId: string;
  idpVendor: SsoIdpVendor;
  allowedEmailDomains: string[];
  supabaseSsoProviderRef: string;
  loginHintDomain?: string | null;
  configuredByUserId?: string | null;
}): {
  workspaceId: string;
  enabled: false;
  idpVendor: SsoIdpVendor;
  allowedEmailDomains: string[];
  supabaseSsoProviderRef: string;
  pilotPhase: "PILOT_CONFIGURED";
  loginHintDomain: string | null;
  configuredByUserId: string | null;
  configuredAt: Date;
  breakGlassOwnerEnabled: true;
} {
  return {
    workspaceId: input.workspaceId,
    enabled: false,
    idpVendor: input.idpVendor,
    allowedEmailDomains: normalizeAllowedEmailDomains(input.allowedEmailDomains),
    supabaseSsoProviderRef: input.supabaseSsoProviderRef.trim(),
    pilotPhase: "PILOT_CONFIGURED",
    loginHintDomain: input.loginHintDomain?.trim().toLowerCase() ?? null,
    configuredByUserId: input.configuredByUserId ?? null,
    configuredAt: new Date(),
    breakGlassOwnerEnabled: true,
  };
}

export function normalizeAllowedEmailDomains(domains: readonly string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of domains) {
    const domain = raw.trim().toLowerCase().replace(/^@+/, "");
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    normalized.push(domain);
  }
  return normalized.sort();
}

export function extractEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isEmailDomainAllowed(
  email: string,
  allowedEmailDomains: readonly string[],
): boolean {
  const domains = normalizeAllowedEmailDomains(allowedEmailDomains);
  if (domains.length === 0) return false;
  const emailDomain = extractEmailDomain(email);
  if (!emailDomain) return false;
  return domains.includes(emailDomain);
}

export type WorkspaceSsoRuntimeGateResult =
  | { allowed: true; reason: "pilot_active" }
  | { allowed: false; reason: "disabled" | "not_configured" | "missing_idp" | "missing_provider_ref" };

/**
 * Fail-closed runtime gate for future SSO login entry (Cycle 3+).
 * Cycle 2: schema only — always denies until pilot phase and refs are set.
 */
export function evaluateWorkspaceSsoRuntimeGate(
  settings: WorkspaceSsoSettingsSnapshot | null | undefined,
): WorkspaceSsoRuntimeGateResult {
  if (!settings) return { allowed: false, reason: "not_configured" };
  if (!settings.enabled || settings.pilotPhase === SSO_PILOT_PHASE_DISABLED) {
    return { allowed: false, reason: "disabled" };
  }
  if (settings.pilotPhase !== "PILOT_ACTIVE") {
    return { allowed: false, reason: "disabled" };
  }
  if (!settings.idpVendor) return { allowed: false, reason: "missing_idp" };
  if (!settings.supabaseSsoProviderRef?.trim()) {
    return { allowed: false, reason: "missing_provider_ref" };
  }
  return { allowed: true, reason: "pilot_active" };
}

export function normalizeIdpSubject(subject: string): string {
  return subject.trim();
}

export function resolveSsoLoginDomain(settings: WorkspaceSsoSettingsSnapshot): string | null {
  const hint = settings.loginHintDomain?.trim().toLowerCase();
  if (hint) return hint;
  const domains = normalizeAllowedEmailDomains(settings.allowedEmailDomains);
  return domains[0] ?? null;
}

/** Pilot activation update — caller must verify entitlement + runtime prerequisites. */
export function buildPilotActiveWorkspaceSsoSettingsUpdate(input: {
  configuredByUserId: string;
}): {
  enabled: true;
  pilotPhase: "PILOT_ACTIVE";
  configuredByUserId: string;
  configuredAt: Date;
} {
  return {
    enabled: true,
    pilotPhase: "PILOT_ACTIVE",
    configuredByUserId: input.configuredByUserId,
    configuredAt: new Date(),
  };
}

/** Disable SSO login while retaining pilot configuration metadata. */
export function buildPilotDeactivateWorkspaceSsoSettingsUpdate(): {
  enabled: false;
  pilotPhase: "PILOT_CONFIGURED";
} {
  return {
    enabled: false,
    pilotPhase: "PILOT_CONFIGURED",
  };
}
