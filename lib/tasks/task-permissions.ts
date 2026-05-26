/**
 * KitchenOS does not yet expose a granular Workspace RBAC; for now permissions
 * are derived from "is the current user the workspace owner?" + the optional
 * superadmin override. This file is the single place that gating logic should
 * live so we can graduate to WorkspaceMember.role without rewriting the UI.
 */
import { isSuperAdminEmail } from "@/lib/platform-owner";

export type TaskPermission =
  | "task.read"
  | "task.create"
  | "task.update"
  | "task.assign"
  | "task.complete"
  | "task.cancel"
  | "task.template.manage"
  | "task.bulk.update";

/** Minimal scope contract for permission checks. */
export type TaskActorScope = {
  /** Workspace owner is "the user that owns the data row" today. */
  isOwner: boolean;
  /** Driver / packer / kitchen role from StaffMember (best-effort string). */
  role?: string | null;
  /** Auth email used for the superadmin override. */
  email?: string | null;
};

export function actorIsSuperAdmin(scope: TaskActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canDoTask(scope: TaskActorScope, permission: TaskPermission): boolean {
  if (actorIsSuperAdmin(scope)) return true;
  if (scope.isOwner) return true;

  // Coarse role buckets until WorkspaceMember.role lands.
  const role = (scope.role ?? "").toLowerCase();
  switch (permission) {
    case "task.read":
    case "task.update":
    case "task.complete":
      return Boolean(role); // any non-empty role can update assigned tasks
    case "task.assign":
    case "task.cancel":
    case "task.bulk.update":
    case "task.template.manage":
      return ["manager", "dispatcher", "admin"].includes(role);
    case "task.create":
      return Boolean(role);
  }
}
