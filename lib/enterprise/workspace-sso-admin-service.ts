/**
 * Workspace SSO pilot admin service — configure / activate / deactivate pilot SSO settings.
 * Pilot-gated; requires ssoOidc entitlement before activation.
 */

import { Prisma } from "@prisma/client";
import type { SsoIdpVendor, WorkspaceSsoSettings } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  buildDefaultWorkspaceSsoSettingsInput,
  buildPilotConfiguredWorkspaceSsoSettingsInput,
  buildPilotActiveWorkspaceSsoSettingsUpdate,
  buildPilotDeactivateWorkspaceSsoSettingsUpdate,
  evaluateWorkspaceSsoRuntimeGate,
  normalizeAllowedEmailDomains,
  type WorkspaceSsoSettingsSnapshot,
} from "@/lib/enterprise/workspace-sso-foundation";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { entitlementSnapshot } from "@/services/billing/entitlement-service";

export type WorkspaceSsoAdminView = {
  workspaceId: string;
  settings: WorkspaceSsoSettingsSnapshot | null;
  ssoEntitlementEnabled: boolean;
  runtimeGateAllowed: boolean;
  configured: boolean;
  active: boolean;
};

function toSnapshot(row: WorkspaceSsoSettings): WorkspaceSsoSettingsSnapshot {
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

async function auditSsoSettingsEvent(input: {
  workspaceId: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await recordAuditLog({
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: input.action,
    entityType: "workspace_sso",
    entityId: input.workspaceId,
    metadata: toInputJsonValue(input.metadata ?? {}),
  }).catch(() => undefined);
}

export async function getWorkspaceSsoAdminView(input: {
  workspaceId: string;
  ownerUserId: string;
}): Promise<WorkspaceSsoAdminView> {
  let row: WorkspaceSsoSettings | null = null;
  try {
    row = await prisma.workspaceSsoSettings.findUnique({
      where: { workspaceId: input.workspaceId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      row = null;
    } else {
      throw error;
    }
  }
  const entitlements = await entitlementSnapshot(input.ownerUserId);
  const settings = row ? toSnapshot(row) : null;
  const runtimeGate = evaluateWorkspaceSsoRuntimeGate(settings);
  return {
    workspaceId: input.workspaceId,
    settings,
    ssoEntitlementEnabled: entitlements.features.ssoOidc,
    runtimeGateAllowed: runtimeGate.allowed,
    configured: settings?.pilotPhase === "PILOT_CONFIGURED" || settings?.pilotPhase === "PILOT_ACTIVE",
    active: runtimeGate.allowed,
  };
}

export type ConfigurePilotWorkspaceSsoInput = {
  workspaceId: string;
  ownerUserId: string;
  actorUserId: string;
  idpVendor: SsoIdpVendor;
  allowedEmailDomains: string[];
  supabaseSsoProviderRef: string;
  loginHintDomain?: string | null;
  breakGlassOwnerEnabled?: boolean;
};

export type ConfigurePilotWorkspaceSsoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function configurePilotWorkspaceSso(
  input: ConfigurePilotWorkspaceSsoInput,
): Promise<ConfigurePilotWorkspaceSsoResult> {
  const providerRef = input.supabaseSsoProviderRef.trim();
  if (!providerRef) {
    return { ok: false, error: "Supabase SSO provider reference is required." };
  }

  const domains = normalizeAllowedEmailDomains(input.allowedEmailDomains);
  if (domains.length === 0) {
    return { ok: false, error: "At least one allowed email domain is required." };
  }

  const entitlements = await entitlementSnapshot(input.ownerUserId);
  if (!entitlements.features.ssoOidc) {
    return {
      ok: false,
      error: "SSO entitlement (ssoOidc) is not enabled for this workspace subscription.",
    };
  }

  const seed = buildPilotConfiguredWorkspaceSsoSettingsInput({
    workspaceId: input.workspaceId,
    idpVendor: input.idpVendor,
    allowedEmailDomains: domains,
    supabaseSsoProviderRef: providerRef,
    loginHintDomain: input.loginHintDomain,
    configuredByUserId: input.actorUserId,
  });

  await prisma.workspaceSsoSettings.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      ...buildDefaultWorkspaceSsoSettingsInput(input.workspaceId),
      ...seed,
      breakGlassOwnerEnabled: input.breakGlassOwnerEnabled ?? true,
    },
    update: {
      idpVendor: seed.idpVendor,
      allowedEmailDomains: seed.allowedEmailDomains,
      supabaseSsoProviderRef: seed.supabaseSsoProviderRef,
      loginHintDomain: seed.loginHintDomain,
      pilotPhase: seed.pilotPhase,
      enabled: false,
      configuredByUserId: seed.configuredByUserId,
      configuredAt: seed.configuredAt,
      breakGlassOwnerEnabled: input.breakGlassOwnerEnabled ?? true,
    },
  });

  await auditSsoSettingsEvent({
    workspaceId: input.workspaceId,
    userId: input.actorUserId,
    action: "sso.settings_configured",
    metadata: {
      idpVendor: input.idpVendor,
      allowedEmailDomains: domains,
      pilotPhase: "PILOT_CONFIGURED",
    },
  });

  return { ok: true };
}

export async function activatePilotWorkspaceSso(input: {
  workspaceId: string;
  ownerUserId: string;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const entitlements = await entitlementSnapshot(input.ownerUserId);
  if (!entitlements.features.ssoOidc) {
    return {
      ok: false,
      error: "SSO entitlement (ssoOidc) is not enabled for this workspace subscription.",
    };
  }

  const row = await prisma.workspaceSsoSettings.findUnique({
    where: { workspaceId: input.workspaceId },
  });
  if (!row || row.pilotPhase === "DISABLED") {
    return { ok: false, error: "Configure SSO pilot settings before activation." };
  }
  if (!row.idpVendor || !row.supabaseSsoProviderRef?.trim()) {
    return { ok: false, error: "IdP vendor and Supabase provider reference are required." };
  }
  if (normalizeAllowedEmailDomains(row.allowedEmailDomains).length === 0) {
    return { ok: false, error: "At least one allowed email domain is required." };
  }

  const activation = buildPilotActiveWorkspaceSsoSettingsUpdate({
    configuredByUserId: input.actorUserId,
  });

  await prisma.workspaceSsoSettings.update({
    where: { workspaceId: input.workspaceId },
    data: activation,
  });

  await auditSsoSettingsEvent({
    workspaceId: input.workspaceId,
    userId: input.actorUserId,
    action: "sso.settings_activated",
    metadata: { pilotPhase: "PILOT_ACTIVE" },
  });

  return { ok: true };
}

export async function deactivatePilotWorkspaceSso(input: {
  workspaceId: string;
  actorUserId: string;
}): Promise<{ ok: true }> {
  const row = await prisma.workspaceSsoSettings.findUnique({
    where: { workspaceId: input.workspaceId },
  });
  if (!row) {
    await prisma.workspaceSsoSettings.create({
      data: buildDefaultWorkspaceSsoSettingsInput(input.workspaceId),
    });
  } else {
    await prisma.workspaceSsoSettings.update({
      where: { workspaceId: input.workspaceId },
      data: buildPilotDeactivateWorkspaceSsoSettingsUpdate(),
    });
  }

  await auditSsoSettingsEvent({
    workspaceId: input.workspaceId,
    userId: input.actorUserId,
    action: "sso.settings_deactivated",
    metadata: { pilotPhase: "PILOT_CONFIGURED" },
  });

  return { ok: true };
}
