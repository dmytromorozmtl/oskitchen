import type { Prisma } from "@prisma/client";

import {
  KDS_STATION_ROUTING_RULES_STORAGE_KEY,
  mergeKdsStationRoutingRules,
  parseKdsStationRoutingRulesConfig,
  type KdsStationRoutingRule,
  type KdsStationRoutingRulesConfig,
} from "@/lib/kitchen/kds-station-routing-rules-policy";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export async function loadKdsStationRoutingRules(userId: string): Promise<KdsStationRoutingRule[]> {
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

  const config = parseKdsStationRoutingRulesConfig(center[KDS_STATION_ROUTING_RULES_STORAGE_KEY]);
  return mergeKdsStationRoutingRules(config.rules);
}

export async function saveKdsStationRoutingRules(
  userId: string,
  rules: readonly KdsStationRoutingRule[],
): Promise<KdsStationRoutingRulesConfig> {
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

  const config: KdsStationRoutingRulesConfig = {
    version: 1,
    rules: mergeKdsStationRoutingRules(rules),
  };

  existing[KDS_STATION_ROUTING_RULES_STORAGE_KEY] = config;

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

export async function toggleKdsStationRoutingRule(
  userId: string,
  ruleId: string,
  enabled: boolean,
): Promise<KdsStationRoutingRulesConfig> {
  const rules = await loadKdsStationRoutingRules(userId);
  const next = rules.map((rule) => (rule.id === ruleId ? { ...rule, enabled } : rule));
  return saveKdsStationRoutingRules(userId, next);
}
