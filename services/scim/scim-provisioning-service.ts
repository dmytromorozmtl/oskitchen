import { Prisma } from "@prisma/client";
import type { ScimProvisionedUser, WorkspaceMemberRole } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { logger } from "@/lib/logger";
import { toInputJsonValue } from "@/lib/prisma/json";
import { prisma } from "@/lib/prisma";
import { assertScimRoleAssignable } from "@/lib/scim/scim-validation";
import type { ScimCreateUserInput } from "@/lib/scim/scim-types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const userInclude = {
  userProfile: { select: { fullName: true, email: true } },
} as const;

export type ScimServiceError = {
  status: number;
  detail: string;
  scimType?: string;
};

async function auditScimEvent(input: {
  workspaceId: string;
  userId?: string | null;
  action: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await recordAuditLog({
    workspaceId: input.workspaceId,
    userId: input.userId ?? null,
    action: input.action,
    entityType: "scim_user",
    entityId: input.entityId,
    metadata: toInputJsonValue(input.metadata ?? {}),
  }).catch(() => undefined);
}

async function resolveOrInviteUser(input: {
  email: string;
  displayName?: string;
}): Promise<{ userId: string } | ScimServiceError> {
  const email = input.email.toLowerCase();
  const existing = await prisma.userProfile.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return { userId: existing.id };

  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: input.displayName ?? email.split("@")[0],
      },
    });
    if (error || !data.user) {
      logger.warn("scim_invite_failed", { email, error: error?.message });
      return {
        status: 503,
        detail: "Identity provider invite unavailable — user must exist or SSO must be active",
      };
    }

    await prisma.userProfile.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email,
        fullName: input.displayName ?? email.split("@")[0] ?? "Team member",
        onboardingCompleted: false,
        onboardingStep: 0,
      },
      update: {
        email,
        fullName: input.displayName ?? undefined,
      },
    });

    return { userId: data.user.id };
  } catch (error) {
    logger.warn("scim_invite_exception", {
      email,
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      status: 503,
      detail: "Supabase admin API unavailable for SCIM invite",
    };
  }
}

async function upsertWorkspaceMembership(input: {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  active: boolean;
}): Promise<void> {
  if (!input.active) {
    await prisma.workspaceMember.deleteMany({
      where: { workspaceId: input.workspaceId, userId: input.userId },
    });
    return;
  }

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: input.workspaceId,
        userId: input.userId,
      },
    },
    create: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
    },
    update: { role: input.role },
  });
}

export async function listScimUsers(input: {
  workspaceId: string;
  filterUserName?: string | null;
  startIndex?: number;
  count?: number;
}): Promise<ScimProvisionedUser[]> {
  const where: Prisma.ScimProvisionedUserWhereInput = {
    workspaceId: input.workspaceId,
    ...(input.filterUserName ? { userName: input.filterUserName } : {}),
  };

  try {
    return await prisma.scimProvisionedUser.findMany({
      where,
      include: userInclude,
      orderBy: { createdAt: "asc" },
      skip: Math.max(0, (input.startIndex ?? 1) - 1),
      take: input.count ?? 200,
    });
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

export async function getScimUser(input: {
  workspaceId: string;
  scimUserId: string;
}): Promise<(ScimProvisionedUser & { userProfile: { fullName: string | null; email: string } | null }) | null> {
  try {
    return await prisma.scimProvisionedUser.findFirst({
      where: { id: input.scimUserId, workspaceId: input.workspaceId },
      include: userInclude,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return null;
    }
    throw error;
  }
}

export async function createScimUser(input: {
  workspaceId: string;
  payload: ScimCreateUserInput;
}): Promise<
  | { ok: true; user: ScimProvisionedUser & { userProfile: { fullName: string | null; email: string } | null }; created: boolean }
  | { ok: false; error: ScimServiceError }
> {
  const role = input.payload.role ?? "STAFF";
  if (!assertScimRoleAssignable(role)) {
    return {
      ok: false,
      error: {
        status: 403,
        detail: "Cannot assign OWNER via SCIM",
        scimType: "mutability",
      },
    };
  }

  if (input.payload.externalId) {
    const conflict = await prisma.scimProvisionedUser.findFirst({
      where: {
        workspaceId: input.workspaceId,
        externalId: input.payload.externalId,
        NOT: { userName: input.payload.userName },
      },
      select: { id: true },
    }).catch(() => null);
    if (conflict) {
      return {
        ok: false,
        error: {
          status: 409,
          detail: "externalId already assigned to another user",
          scimType: "uniqueness",
        },
      };
    }
  }

  const existing = await prisma.scimProvisionedUser.findFirst({
    where: {
      workspaceId: input.workspaceId,
      userName: input.payload.userName,
    },
    include: userInclude,
  }).catch(() => null);

  if (existing) {
    const updated = await prisma.scimProvisionedUser.update({
      where: { id: existing.id },
      data: {
        externalId: input.payload.externalId ?? existing.externalId,
        active: input.payload.active ?? true,
        role,
        lastSyncAt: new Date(),
      },
      include: userInclude,
    });
    await upsertWorkspaceMembership({
      workspaceId: input.workspaceId,
      userId: existing.userId,
      role,
      active: updated.active,
    });
    await auditScimEvent({
      workspaceId: input.workspaceId,
      userId: existing.userId,
      action: "scim.user.updated",
      entityId: existing.id,
      metadata: { userName: existing.userName, idempotent: true },
    });
    return { ok: true, user: updated, created: false };
  }

  const resolved = await resolveOrInviteUser({
    email: input.payload.userName,
    displayName: input.payload.name?.formatted,
  });
  if ("status" in resolved) {
    return { ok: false, error: resolved };
  }

  const created = await prisma.scimProvisionedUser.create({
    data: {
      workspaceId: input.workspaceId,
      userId: resolved.userId,
      userName: input.payload.userName,
      externalId: input.payload.externalId ?? null,
      active: input.payload.active ?? true,
      role,
    },
    include: userInclude,
  });

  await upsertWorkspaceMembership({
    workspaceId: input.workspaceId,
    userId: resolved.userId,
    role,
    active: created.active,
  });

  await auditScimEvent({
    workspaceId: input.workspaceId,
    userId: resolved.userId,
    action: "scim.user.created",
    entityId: created.id,
    metadata: { userName: created.userName, role },
  });

  return { ok: true, user: created, created: true };
}

export async function patchScimUser(input: {
  workspaceId: string;
  scimUserId: string;
  active: boolean;
  role: WorkspaceMemberRole;
}): Promise<
  | { ok: true; user: ScimProvisionedUser & { userProfile: { fullName: string | null; email: string } | null } }
  | { ok: false; error: ScimServiceError }
> {
  const existing = await getScimUser({
    workspaceId: input.workspaceId,
    scimUserId: input.scimUserId,
  });
  if (!existing) {
    return {
      ok: false,
      error: { status: 404, detail: "SCIM user not found in workspace" },
    };
  }

  if (!assertScimRoleAssignable(input.role)) {
    return {
      ok: false,
      error: {
        status: 403,
        detail: "Cannot assign OWNER via SCIM",
        scimType: "mutability",
      },
    };
  }

  const updated = await prisma.scimProvisionedUser.update({
    where: { id: existing.id },
    data: {
      active: input.active,
      role: input.role,
      lastSyncAt: new Date(),
    },
    include: userInclude,
  });

  await upsertWorkspaceMembership({
    workspaceId: input.workspaceId,
    userId: existing.userId,
    role: input.role,
    active: input.active,
  });

  await auditScimEvent({
    workspaceId: input.workspaceId,
    userId: existing.userId,
    action: input.active ? "scim.user.reactivated" : "scim.user.deactivated",
    entityId: existing.id,
    metadata: { userName: existing.userName, role: input.role },
  });

  return { ok: true, user: updated };
}

export async function deprovisionScimUser(input: {
  workspaceId: string;
  scimUserId: string;
}): Promise<
  | { ok: true }
  | { ok: false; error: ScimServiceError }
> {
  const existing = await getScimUser({
    workspaceId: input.workspaceId,
    scimUserId: input.scimUserId,
  });
  if (!existing) {
    return {
      ok: false,
      error: { status: 404, detail: "SCIM user not found in workspace" },
    };
  }

  await prisma.scimProvisionedUser.update({
    where: { id: existing.id },
    data: { active: false, lastSyncAt: new Date() },
  });
  await upsertWorkspaceMembership({
    workspaceId: input.workspaceId,
    userId: existing.userId,
    role: existing.role,
    active: false,
  });

  await auditScimEvent({
    workspaceId: input.workspaceId,
    userId: existing.userId,
    action: "scim.user.deprovisioned",
    entityId: existing.id,
    metadata: { userName: existing.userName },
  });

  return { ok: true };
}

export async function listScimGroupMembers(
  workspaceId: string,
): Promise<Record<string, string[]>> {
  const rows = await listScimUsers({ workspaceId });
  const byRole: Record<string, string[]> = {
    ADMIN: [],
    STAFF: [],
    PARTNER: [],
  };
  for (const row of rows.filter((r) => r.active)) {
    if (row.role === "ADMIN" || row.role === "STAFF" || row.role === "PARTNER") {
      byRole[row.role].push(row.userId);
    }
  }
  return byRole;
}
