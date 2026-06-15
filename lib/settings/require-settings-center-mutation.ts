import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { SettingsCapability } from "@/lib/settings/section-registry";
import { SETTINGS_CAPABILITY_PERMISSION } from "@/lib/settings/settings-workspace-map";
import { logSettingsPermissionDenied } from "@/services/settings/settings-permission-audit";

export async function requireSettingsCenterMutation(
  capability: SettingsCapability,
  operation: string,
): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const requiredPermission = SETTINGS_CAPABILITY_PERMISSION[capability];
  if (!requiredPermission) {
    return { ok: false, error: "forbidden" };
  }

  const access = await requireMutationPermission(requiredPermission);
  if (!access.ok) {
    await logSettingsPermissionDenied(access.actor, {
      requiredPermission,
      operation,
      metadata: { settingsCapability: capability },
    });
    return { ok: false, error: "forbidden" };
  }

  const { userId } = await requireTenantActor();
  return { ok: true, userId };
}

export function settingsPermissionForCapability(
  capability: SettingsCapability,
): PermissionKey | undefined {
  return SETTINGS_CAPABILITY_PERMISSION[capability];
}
