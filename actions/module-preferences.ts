"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { kitchenModulePreferenceListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { MODULE_KEYS, type ModuleKey, getRecommendedDisabledModuleKeys } from "@/lib/module-visibility";
import { getReadinessDefaultDisabledModuleKeys } from "@/lib/product/module-readiness";
import { safeError } from "@/lib/security";
import { ok } from "@/lib/action-result";

const LOCKED_MODULE_KEYS = new Set<ModuleKey>([
  "dashboard",
  "today",
  "settings",
  "billing",
  "support",
]);

const moduleKeySchema = z.custom<ModuleKey>(
  (v) => typeof v === "string" && (MODULE_KEYS as readonly string[]).includes(v as string),
);

const saveSchema = z.object({
  modules: z.array(
    z.object({
      key: moduleKeySchema,
      enabled: z.boolean(),
    }),
  ),
});

async function requireModulePreferencesManageAccess(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "module_preferences.permission_denied",
      entityType: "ModulePreference",
      metadata: { operation, requiredPermission: "workspace.settings" },
    });
    return { ok: false as const, error: access.error };
  }
  const actor = await requireTenantActor();
  return { ok: true as const, ...actor };
}

export async function saveKitchenModulePreferences(input: {
  modules: { key: z.infer<typeof moduleKeySchema>; enabled: boolean }[];
}) {
  try {
    const manage = await requireModulePreferencesManageAccess("module_preferences.save");
    if (!manage.ok) return { error: manage.error };
    const { userId } = manage;
    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Invalid module payload" as const };
    }

    const normalized = parsed.data.modules.map((m) => ({
      ...m,
      enabled: LOCKED_MODULE_KEYS.has(m.key) ? true : m.enabled,
    }));

    const workspaceId = await resolveOwnerWorkspaceId(userId);
    await prisma.$transaction(
      normalized.map((m) =>
        prisma.kitchenModulePreference.upsert({
          where: {
            userId_moduleKey: { userId, moduleKey: m.key },
          },
          create: {
            userId,
            workspaceId,
            moduleKey: m.key,
            enabled: m.enabled,
          },
          update: { enabled: m.enabled },
        }),
      ),
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/modules");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function clearKitchenModulePreferences() {
  try {
    const manage = await requireModulePreferencesManageAccess("module_preferences.clear");
    if (!manage.ok) return { error: manage.error };
    const { userId } = manage;
    await prisma.kitchenModulePreference.deleteMany({
      where: await kitchenModulePreferenceListWhereForOwner(userId),
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/modules");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function resetKitchenModulePreferencesToRecommended() {
  try {
    const manage = await requireModulePreferencesManageAccess("module_preferences.reset_recommended");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser, userId } = manage;
    const profile = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      include: { kitchenSettings: { select: { businessType: true } } },
    });
    const rec = getRecommendedDisabledModuleKeys(profile?.kitchenSettings?.businessType);
    const readinessDefaults = getReadinessDefaultDisabledModuleKeys();
    const disabled = new Set<ModuleKey>([...rec, ...readinessDefaults]);

    const workspaceId = await resolveOwnerWorkspaceId(userId);
    await prisma.kitchenModulePreference.deleteMany({
      where: await kitchenModulePreferenceListWhereForOwner(userId),
    });

    if (disabled.size > 0) {
      await prisma.kitchenModulePreference.createMany({
        data: [...disabled].map((moduleKey) => ({
          userId,
          workspaceId,
          moduleKey,
          enabled: false,
        })),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/modules");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}
