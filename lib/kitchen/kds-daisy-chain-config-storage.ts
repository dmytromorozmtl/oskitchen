import type { Prisma } from "@prisma/client";

import {
  KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY,
  mergeKdsDaisyChainLinks,
  parseKdsDaisyChainConfig,
  type KdsDaisyChainConfig,
  type KdsDaisyChainLink,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export async function loadKdsDaisyChainLinks(userId: string): Promise<KdsDaisyChainLink[]> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? (kitchen.settingsCenterJson as Record<string, unknown>)
      : {};

  const config = parseKdsDaisyChainConfig(center[KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY]);
  return mergeKdsDaisyChainLinks(config.links);
}

export async function saveKdsDaisyChainLinks(
  userId: string,
  links: readonly KdsDaisyChainLink[],
): Promise<KdsDaisyChainConfig> {
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  const existing =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  const config: KdsDaisyChainConfig = {
    version: 1,
    links: mergeKdsDaisyChainLinks(links),
  };

  existing[KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY] = config;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      settingsCenterJson: existing as Prisma.InputJsonValue,
    },
    update: {
      settingsCenterJson: existing as Prisma.InputJsonValue,
      workspaceId,
    },
  });

  return config;
}

export async function toggleKdsDaisyChainLink(
  userId: string,
  linkId: string,
  enabled: boolean,
): Promise<KdsDaisyChainConfig> {
  const links = await loadKdsDaisyChainLinks(userId);
  const next = links.map((link) => (link.id === linkId ? { ...link, enabled } : link));
  return saveKdsDaisyChainLinks(userId, next);
}
