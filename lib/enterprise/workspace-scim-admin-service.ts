/**
 * Workspace SCIM 2.0 admin — enable provisioning and rotate bearer tokens.
 */

import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { generateScimBearerToken, hashScimBearerToken } from "@/lib/scim/scim-token";
import { entitlementSnapshot } from "@/services/billing/entitlement-service";

export type WorkspaceScimAdminView = {
  workspaceId: string;
  scimEntitlementEnabled: boolean;
  configured: boolean;
  active: boolean;
  pilotPhase: string | null;
  tokenConfigured: boolean;
  lastRotatedAtIso: string | null;
  provisionedUserCount: number;
};

async function auditScimSettingsEvent(input: {
  workspaceId: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await recordAuditLog({
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: input.action,
    entityType: "workspace_scim",
    entityId: input.workspaceId,
    metadata: toInputJsonValue(input.metadata ?? {}),
  }).catch(() => undefined);
}

export async function getWorkspaceScimAdminView(input: {
  workspaceId: string;
  ownerUserId: string;
}): Promise<WorkspaceScimAdminView> {
  const entitlements = await entitlementSnapshot(input.ownerUserId);

  let row: {
    enabled: boolean;
    pilotPhase: string;
    tokenHash: string;
    lastRotatedAt: Date | null;
  } | null = null;

  try {
    row = await prisma.workspaceScimSettings.findUnique({
      where: { workspaceId: input.workspaceId },
      select: {
        enabled: true,
        pilotPhase: true,
        tokenHash: true,
        lastRotatedAt: true,
      },
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

  let provisionedUserCount = 0;
  try {
    provisionedUserCount = await prisma.scimProvisionedUser.count({
      where: { workspaceId: input.workspaceId, active: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      provisionedUserCount = 0;
    } else {
      throw error;
    }
  }

  const configured =
    row?.pilotPhase === "PILOT_CONFIGURED" || row?.pilotPhase === "PILOT_ACTIVE";
  const active = Boolean(row?.enabled && row.pilotPhase === "PILOT_ACTIVE");

  return {
    workspaceId: input.workspaceId,
    scimEntitlementEnabled: entitlements.features.ssoOidc,
    configured,
    active,
    pilotPhase: row?.pilotPhase ?? null,
    tokenConfigured: Boolean(row?.tokenHash),
    lastRotatedAtIso: row?.lastRotatedAt?.toISOString() ?? null,
    provisionedUserCount,
  };
}

export async function activateWorkspaceScim(input: {
  workspaceId: string;
  ownerUserId: string;
  actorUserId: string;
}): Promise<{ bearerToken: string }> {
  const entitlements = await entitlementSnapshot(input.ownerUserId);
  if (!entitlements.features.ssoOidc) {
    throw new Error("SCIM requires Enterprise SSO entitlement (ssoOidc).");
  }

  const bearerToken = generateScimBearerToken();
  const tokenHash = hashScimBearerToken(bearerToken);
  const now = new Date();

  await prisma.workspaceScimSettings.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      enabled: true,
      tokenHash,
      pilotPhase: "PILOT_ACTIVE",
      configuredByUserId: input.actorUserId,
      configuredAt: now,
      lastRotatedAt: now,
    },
    update: {
      enabled: true,
      tokenHash,
      pilotPhase: "PILOT_ACTIVE",
      configuredByUserId: input.actorUserId,
      configuredAt: now,
      lastRotatedAt: now,
    },
  });

  await auditScimSettingsEvent({
    workspaceId: input.workspaceId,
    userId: input.actorUserId,
    action: "scim.activated",
    metadata: { pilotPhase: "PILOT_ACTIVE" },
  });

  return { bearerToken };
}

export async function rotateWorkspaceScimToken(input: {
  workspaceId: string;
  actorUserId: string;
}): Promise<{ bearerToken: string }> {
  const bearerToken = generateScimBearerToken();
  const tokenHash = hashScimBearerToken(bearerToken);
  const now = new Date();

  await prisma.workspaceScimSettings.update({
    where: { workspaceId: input.workspaceId },
    data: {
      tokenHash,
      lastRotatedAt: now,
    },
  });

  return { bearerToken };
}

export type ScimProvisionedUserAdminRow = {
  id: string;
  userName: string;
  displayName: string | null;
  active: boolean;
  role: string;
};

export async function listScimProvisionedUsersForAdmin(
  workspaceId: string,
): Promise<ScimProvisionedUserAdminRow[]> {
  try {
    const rows = await prisma.scimProvisionedUser.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        userProfile: { select: { fullName: true, email: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      userName: row.userName,
      displayName: row.userProfile.fullName ?? row.userProfile.email ?? row.userName,
      active: row.active,
      role: row.role,
    }));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return [];
    }
    throw error;
  }
}
