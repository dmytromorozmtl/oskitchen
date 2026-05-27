import type { ImportType } from "@prisma/client";

import type { ImportCapability } from "@/lib/import-center/import-types";
import {
  canUploadImportType,
  canUseImportCenterCapability,
  workspacePermissionForImportCapability,
  workspacePermissionForImportType,
} from "@/lib/import-center/workspace-import-permission";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import { logImportCenterPermissionDenied } from "@/services/import-center/import-center-permission-audit";

export type ImportCenterActorGate =
  | { ok: true; actor: WorkspacePermissionActor; userId: string; profileId: string }
  | { ok: false; error: string };

async function deny(
  actor: WorkspacePermissionActor | undefined,
  input: Parameters<typeof logImportCenterPermissionDenied>[1],
): Promise<ImportCenterActorGate> {
  await logImportCenterPermissionDenied(actor, input);
  return { ok: false, error: "You do not have permission to perform this action." };
}

export async function requireImportCenterCapability(
  capability: ImportCapability,
  operation?: string,
): Promise<ImportCenterActorGate> {
  const direct = workspacePermissionForImportCapability(capability);
  if (direct) {
    const access = await requireMutationPermission(direct);
    if (!access.ok) {
      return deny(access.actor, {
        requiredPermission: direct,
        capability,
        operation: operation ?? capability,
      });
    }
    return {
      ok: true,
      actor: access.actor,
      userId: access.actor.userId,
      profileId: access.actor.sessionUser.id,
    };
  }

  let actor: WorkspacePermissionActor;
  try {
    actor = await requireWorkspacePermissionActor();
  } catch {
    return { ok: false, error: "You do not have permission to perform this action." };
  }
  if (!canUseImportCenterCapability(actor.granted, capability)) {
    const requiredPermission =
      capability === "import.upload" ? "products.edit" : "workspace.view";
    return deny(actor, {
      requiredPermission,
      capability,
      operation: operation ?? capability,
    });
  }
  return {
    ok: true,
    actor,
    userId: actor.userId,
    profileId: actor.sessionUser.id,
  };
}

export async function requireImportCenterUpload(
  type: ImportType,
  operation = "import_center.upload",
): Promise<ImportCenterActorGate> {
  const requiredPermission = workspacePermissionForImportType(type);
  const access = await requireMutationPermission(requiredPermission);
  if (access.ok && canUploadImportType(access.actor.granted, type)) {
    return {
      ok: true,
      actor: access.actor,
      userId: access.actor.userId,
      profileId: access.actor.sessionUser.id,
    };
  }

  const productionAccess = await requireMutationPermission("production.manage");
  if (
    productionAccess.ok &&
    canUploadImportType(productionAccess.actor.granted, type)
  ) {
    return {
      ok: true,
      actor: productionAccess.actor,
      userId: productionAccess.actor.userId,
      profileId: productionAccess.actor.sessionUser.id,
    };
  }

  const actor = access.actor ?? productionAccess.actor;
  return deny(actor, {
    requiredPermission,
    importType: type,
    operation,
  });
}
