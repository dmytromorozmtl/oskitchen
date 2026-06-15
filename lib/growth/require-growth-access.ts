import { requireSessionUser, requireUserProfile } from "@/lib/auth";
import { createGrowthActorScope } from "@/lib/growth/growth-actor-scope";
import { canAccessGrowthModule } from "@/lib/growth/growth-permissions";
import { workspacePermissionForGrowthCapability } from "@/lib/growth/growth-permission-keys";
import { canUseGrowth } from "@/lib/growth/growth-permissions";
import type { GrowthCapability } from "@/lib/growth/growth-types";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logGrowthPermissionDenied } from "@/services/growth/growth-permission-audit";

async function legacyGrowthAllows(
  actor: WorkspacePermissionActor,
  profileRole: string | null,
): Promise<boolean> {
  return canAccessGrowthModule(actor.sessionUserId, actor.email, profileRole as import("@prisma/client").UserRole);
}

async function growthAccessGranted(
  actor: WorkspacePermissionActor,
  profileRole: string | null,
  capability: GrowthCapability,
): Promise<boolean> {
  const scope = createGrowthActorScope(actor, profileRole);
  if (canUseGrowth(scope, capability)) return true;
  return legacyGrowthAllows(actor, profileRole);
}

/** Authorize growth mutations (canonical `growth.manage` + platform GTM legacy bridge). */
export async function authorizeGrowth(
  capability: GrowthCapability = "growth.manage",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const required = workspacePermissionForGrowthCapability(capability);
  const access = await requireMutationPermission(required);
  let profile: { role: string | null } | null = null;
  try {
    profile = await requireUserProfile();
  } catch {
    profile = null;
  }

  if (access.ok) {
    if (profile && (await growthAccessGranted(access.actor, profile.role, capability))) {
      return { ok: true };
    }
    await logGrowthPermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      growthCapability: capability,
    });
    return { ok: false, error: "You do not have permission to perform this action." };
  }

  if (access.actor && profile && (await legacyGrowthAllows(access.actor, profile.role))) {
    return { ok: true };
  }

  await logGrowthPermissionDenied(access.actor, {
    requiredPermission: required,
    operation: capability,
    growthCapability: capability,
  });
  return { ok: false, error: access.error ?? "Forbidden" };
}

/** Load workspace actor when growth hub pages need read access checks beyond layout. */
export async function requireGrowthActor(capability: GrowthCapability = "growth.view") {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const allowed = await growthAccessGranted(actor, profile.role ?? null, capability);
  if (!allowed) {
    const required = workspacePermissionForGrowthCapability(capability);
    await logGrowthPermissionDenied(actor, {
      requiredPermission: required,
      operation: capability,
      growthCapability: capability,
    });
    throw new Error("FORBIDDEN");
  }
  return { actor, profile };
}

/** @deprecated Use {@link authorizeGrowth}; kept for existing call sites. */
export async function assertGrowthAccess() {
  const res = await authorizeGrowth("growth.manage");
  if (!res.ok) throw new Error("FORBIDDEN");
  return requireSessionUser();
}
