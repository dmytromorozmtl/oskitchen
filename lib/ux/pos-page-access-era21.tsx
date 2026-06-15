import type { ReactNode } from "react";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadWorkspacePermissionPageActor } from "@/lib/ux/permission-denied-page-access-era19";
import type { PermissionDeniedSurfaceId } from "@/lib/ux/permission-denied-copy";

/** Guard-before-query helper for POS dashboard pages (Era 21 sweep). */
export async function loadPosPageActorOrDeny(input: {
  surfaceId: PermissionDeniedSurfaceId;
  required?: PermissionKey;
}): Promise<
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; node: ReactNode }
> {
  const actor = await loadWorkspacePermissionPageActor();
  const required = input.required ?? "pos.access";
  if (!hasPermission(actor.granted, required)) {
    return { ok: false, node: <PermissionDeniedSurfaceCard surfaceId={input.surfaceId} /> };
  }
  return { ok: true, actor };
}

export async function loadPosShiftPageActorOrDeny(): Promise<
  | { ok: true; actor: WorkspacePermissionActor; canOpen: boolean; canClose: boolean }
  | { ok: false; node: ReactNode }
> {
  const actor = await loadWorkspacePermissionPageActor();
  const canOpen = hasPermission(actor.granted, "pos.shift.open");
  const canClose = hasPermission(actor.granted, "pos.shift.close");
  if (!canOpen && !canClose) {
    return { ok: false, node: <PermissionDeniedSurfaceCard surfaceId="pos_hub" /> };
  }
  return { ok: true, actor, canOpen, canClose };
}
