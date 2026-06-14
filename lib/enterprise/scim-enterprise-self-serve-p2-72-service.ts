import type { Prisma } from "@prisma/client";

import {
  defaultScimEnterpriseSelfServeConfig,
  mergeScimSelfServeIntoSettingsCenter,
  parseScimEnterpriseSelfServeConfig,
  scimSelfServeFromSettingsCenter,
  type ScimEnterpriseSelfServeConfig,
  type ScimGroupMapping,
  type ScimAttributeMapping,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";
import { prisma } from "@/lib/prisma";

async function loadOwnerSettingsCenter(ownerUserId: string): Promise<unknown> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return kitchen?.settingsCenterJson ?? null;
}

async function resolveWorkspaceOwnerUserId(workspaceId: string): Promise<string | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  return workspace?.ownerUserId ?? null;
}

export async function getScimEnterpriseSelfServeConfig(
  workspaceId: string,
): Promise<ScimEnterpriseSelfServeConfig> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) return defaultScimEnterpriseSelfServeConfig();
  const settingsCenterJson = await loadOwnerSettingsCenter(ownerUserId);
  return scimSelfServeFromSettingsCenter(settingsCenterJson);
}

export async function saveScimGroupMappings(input: {
  workspaceId: string;
  groupMappings: ScimGroupMapping[];
}): Promise<ScimEnterpriseSelfServeConfig> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) throw new Error("Workspace owner not found.");

  const current = await getScimEnterpriseSelfServeConfig(input.workspaceId);
  const next: ScimEnterpriseSelfServeConfig = {
    ...current,
    groupMappings: parseScimEnterpriseSelfServeConfig({
      groupMappings: input.groupMappings,
      attributeMapping: current.attributeMapping,
    }).groupMappings,
  };

  await persistScimSelfServeConfig(ownerUserId, input.workspaceId, next);
  return next;
}

export async function saveScimAttributeMapping(input: {
  workspaceId: string;
  attributeMapping: ScimAttributeMapping;
}): Promise<ScimEnterpriseSelfServeConfig> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) throw new Error("Workspace owner not found.");

  const current = await getScimEnterpriseSelfServeConfig(input.workspaceId);
  const next: ScimEnterpriseSelfServeConfig = {
    ...current,
    attributeMapping: parseScimEnterpriseSelfServeConfig({
      groupMappings: current.groupMappings,
      attributeMapping: input.attributeMapping,
    }).attributeMapping,
  };

  await persistScimSelfServeConfig(ownerUserId, input.workspaceId, next);
  return next;
}

async function persistScimSelfServeConfig(
  ownerUserId: string,
  workspaceId: string,
  config: ScimEnterpriseSelfServeConfig,
): Promise<void> {
  const settingsCenterJson = await loadOwnerSettingsCenter(ownerUserId);
  const merged = mergeScimSelfServeIntoSettingsCenter(settingsCenterJson, config) as Prisma.InputJsonValue;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: {
      userId: ownerUserId,
      workspaceId,
      settingsCenterJson: merged,
    },
    update: { settingsCenterJson: merged },
  });
}
