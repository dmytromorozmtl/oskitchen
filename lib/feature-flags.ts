import type { FeatureKey } from "@/lib/plans/feature-registry";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { prisma } from "@/lib/prisma";

import { isSuperAdminUser } from "@/lib/platform-super-bypass";

/**
 * Global + per-workspace feature resolution.
 * SUPER_ADMIN always sees enabled=true for gating purposes.
 */
export async function isFeatureEnabledForUser(input: {
  userId: string;
  email?: string | null;
  featureKey: FeatureKey;
  workspaceId?: string | null;
}): Promise<boolean> {
  if (await isSuperAdminUser(input.userId, input.email)) return true;

  if (input.workspaceId) {
    const override = await prisma.workspaceFeatureOverride.findUnique({
      where: {
        workspaceId_featureKey: {
          workspaceId: input.workspaceId,
          featureKey: input.featureKey,
        },
      },
      select: { enabled: true },
    });
    if (override) return override.enabled;
  }

  const flag = await prisma.featureFlag.findUnique({
    where: { key: input.featureKey },
    select: { enabled: true },
  });
  if (flag && !flag.enabled) return false;

  const gate = await canUseFeature(input.userId, input.featureKey);
  return gate.allowed;
}

export async function enableFeatureFlag(key: string, description?: string): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled: true, description: description ?? null },
    update: { enabled: true, description: description ?? undefined },
  });
}

export async function disableFeatureFlag(key: string): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled: false, description: null },
    update: { enabled: false },
  });
}

export async function setWorkspaceFeatureOverride(
  workspaceId: string,
  featureKey: string,
  enabled: boolean,
): Promise<void> {
  await prisma.workspaceFeatureOverride.upsert({
    where: {
      workspaceId_featureKey: { workspaceId, featureKey },
    },
    create: { workspaceId, featureKey, enabled },
    update: { enabled },
  });
}
