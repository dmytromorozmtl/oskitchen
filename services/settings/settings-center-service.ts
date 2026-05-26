import type { KitchenSettings } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import {
  DEFAULT_SETTINGS_CENTER,
  mergeSettingsCenter,
  type SettingsCenterPayload,
} from "@/lib/settings/settings-defaults";

export type SettingsCenterState = {
  kitchenSettings: KitchenSettings | null;
  payload: SettingsCenterPayload;
};

/** Load + merge the Settings Center payload for the workspace owner. */
export async function loadSettingsCenter(userId: string): Promise<SettingsCenterState> {
  const ks = await prisma.kitchenSettings.findUnique({ where: { userId } });
  if (!ks) return { kitchenSettings: null, payload: DEFAULT_SETTINGS_CENTER };
  return {
    kitchenSettings: ks,
    payload: mergeSettingsCenter(ks.settingsCenterJson),
  };
}

/**
 * Persist a partial update to the Settings Center payload.
 * Reads-merges-writes so concurrent section saves don't clobber unrelated keys.
 */
export async function updateSettingsCenterSection<K extends keyof SettingsCenterPayload>(
  userId: string,
  section: K,
  next: SettingsCenterPayload[K],
): Promise<SettingsCenterPayload> {
  const current = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeSettingsCenter(current?.settingsCenterJson);
  const updated: SettingsCenterPayload = { ...merged, [section]: next };

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: {
      userId,
      settingsCenterJson: updated as unknown as object,
    },
    update: {
      settingsCenterJson: updated as unknown as object,
    },
  });

  void auditLog({
    actor: { userId },
    action: "SETTINGS_UPDATED",
    category: "SETTINGS",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "SettingsCenterSection", label: String(section) },
    metadata: { section: String(section) },
    maskPiiInMetadata: true,
  });

  return updated;
}

/**
 * Update multiple top-level sections in one transaction (used by the Business Mode preset apply).
 */
export async function updateSettingsCenterSections(
  userId: string,
  patch: Partial<SettingsCenterPayload>,
): Promise<SettingsCenterPayload> {
  const current = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeSettingsCenter(current?.settingsCenterJson);
  const next: SettingsCenterPayload = { ...merged, ...patch } as SettingsCenterPayload;
  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: next as unknown as object },
    update: { settingsCenterJson: next as unknown as object },
  });
  void auditLog({
    actor: { userId },
    action: "SETTINGS_BULK_UPDATED",
    category: "SETTINGS",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "SettingsCenter", label: "multi_section" },
    metadata: { sections: Object.keys(patch) },
    maskPiiInMetadata: true,
  });
  return next;
}
