/**
 * Workspace SSO callback service — Prisma + audit integration after Supabase session exchange.
 * Pilot-gated; default workspace SSO remains disabled.
 */

import type { WorkspaceSsoSettings } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  extractSsoIdpSubject,
  inferSsoIdpVendorFromUser,
  mapSsoCallbackDenyReasonToLoginError,
  validateSsoCallbackSession,
  type SsoCallbackDenyReason,
  type SupabaseSsoUserShape,
} from "@/lib/enterprise/workspace-sso-runtime-adapter";
import type { WorkspaceSsoSettingsSnapshot } from "@/lib/enterprise/workspace-sso-foundation";
import { prisma } from "@/lib/prisma";
import { userHasWorkspaceAccess } from "@/lib/scope/assert-user-workspace-access";
import { entitlementSnapshot } from "@/services/billing/entitlement-service";

export type CompleteWorkspaceSsoCallbackInput = {
  workspaceId: string;
  user: SupabaseSsoUserShape;
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

export type CompleteWorkspaceSsoCallbackResult =
  | { ok: true }
  | { ok: false; reason: SsoCallbackDenyReason; loginErrorCode: string };

function toSettingsSnapshot(row: WorkspaceSsoSettings): WorkspaceSsoSettingsSnapshot {
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

async function auditSsoCallbackEvent(input: {
  workspaceId: string;
  userId: string | null;
  action: "sso.login_success" | "sso.login_denied";
  reason?: SsoCallbackDenyReason;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await recordAuditLog({
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: input.action,
    entityType: "workspace_sso",
    entityId: input.workspaceId,
    metadata: {
      reason: input.reason ?? null,
      ...input.metadata,
    },
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  }).catch(() => undefined);
}

/**
 * Validates pilot SSO callback context and links IdP subject to the KitchenOS user.
 * Call only after Supabase `exchangeCodeForSession` succeeds.
 */
export async function completeWorkspaceSsoCallback(
  input: CompleteWorkspaceSsoCallbackInput,
): Promise<CompleteWorkspaceSsoCallbackResult> {
  const workspaceId = input.workspaceId.trim();
  const userId = input.user.id;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, ownerUserId: true },
  });

  if (!workspace) {
    await auditSsoCallbackEvent({
      workspaceId,
      userId,
      action: "sso.login_denied",
      reason: "not_configured",
      ipAddress: input.requestMeta?.ipAddress ?? null,
      userAgent: input.requestMeta?.userAgent ?? null,
    });
    return {
      ok: false,
      reason: "not_configured",
      loginErrorCode: mapSsoCallbackDenyReasonToLoginError("not_configured"),
    };
  }

  const [settingsRow, hasAccess, entitlements] = await Promise.all([
    prisma.workspaceSsoSettings.findUnique({ where: { workspaceId } }),
    userHasWorkspaceAccess(userId, workspaceId),
    entitlementSnapshot(workspace.ownerUserId),
  ]);

  const settings = settingsRow ? toSettingsSnapshot(settingsRow) : null;
  const idpSubject = extractSsoIdpSubject(input.user);
  const inferredIdpVendor = inferSsoIdpVendorFromUser(input.user);

  const validation = validateSsoCallbackSession({
    workspaceId,
    userId,
    email: input.user.email,
    idpSubject,
    inferredIdpVendor,
    settings,
    userHasWorkspaceAccess: hasAccess,
    ssoEntitlementEnabled: entitlements.features.ssoOidc,
  });

  if (!validation.ok) {
    await auditSsoCallbackEvent({
      workspaceId,
      userId,
      action: "sso.login_denied",
      reason: validation.reason,
      metadata: {
        inferredIdpVendor,
        entitlementEnabled: entitlements.features.ssoOidc,
      },
      ipAddress: input.requestMeta?.ipAddress ?? null,
      userAgent: input.requestMeta?.userAgent ?? null,
    });
    return {
      ok: false,
      reason: validation.reason,
      loginErrorCode: mapSsoCallbackDenyReasonToLoginError(validation.reason),
    };
  }

  const emailAtLink = input.user.email?.trim() ?? null;
  const now = new Date();

  await prisma.ssoIdentity.upsert({
    where: {
      workspaceId_userId_idpVendor: {
        workspaceId,
        userId,
        idpVendor: validation.idpVendor,
      },
    },
    create: {
      workspaceId,
      userId,
      idpVendor: validation.idpVendor,
      idpSubject: validation.idpSubject,
      emailAtLink,
      lastLoginAt: now,
    },
    update: {
      idpSubject: validation.idpSubject,
      emailAtLink,
      lastLoginAt: now,
    },
  });

  await auditSsoCallbackEvent({
    workspaceId,
    userId,
    action: "sso.login_success",
    metadata: {
      idpVendor: validation.idpVendor,
      idpSubject: validation.idpSubject,
    },
    ipAddress: input.requestMeta?.ipAddress ?? null,
    userAgent: input.requestMeta?.userAgent ?? null,
  });

  return { ok: true };
}
