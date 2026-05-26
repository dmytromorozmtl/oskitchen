import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import { isSuperAdminEmail } from "@/lib/platform-owner";
import { resolveWorkspacePermissions } from "@/services/permissions/permission-service";

import { canUseSettings, type SettingsActorScope } from "./settings-permissions";
import type { SettingsCapability } from "./section-registry";
import { SETTINGS_CAPABILITY_PERMISSION } from "./settings-workspace-map";

function toWorkspaceRole(role: string | null): UserRole {
  const r = (role ?? "STAFF").toUpperCase();
  if (r === "OWNER" || r === "ADMIN") return "OWNER";
  return "STAFF";
}

/** Legacy settings matrix OR workspace RBAC (Phase B). */
export function canAccessSettingsSection(actor: SettingsActorScope, capability: SettingsCapability): boolean {
  if (canUseSettings(actor, capability)) return true;
  const required = SETTINGS_CAPABILITY_PERMISSION[capability];
  if (!required) return false;
  const granted = resolveWorkspacePermissions({
    userId: actor.userId,
    email: actor.email,
    workspaceRole: toWorkspaceRole(actor.role),
    platformBypass: isSuperAdminEmail(actor.email),
  });
  return hasPermission(granted, required);
}
