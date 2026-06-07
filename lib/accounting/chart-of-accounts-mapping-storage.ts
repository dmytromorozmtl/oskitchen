import type { Prisma } from "@prisma/client";

import {
  CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY,
  mergeCoaMappingRows,
  parseCoaMappingConfig,
  type CoaMappingConfig,
  type CoaMappingRow,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { coaAccountByCode } from "@/lib/accounting/restaurant-coa-template";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export async function loadCoaMappingRows(userId: string): Promise<CoaMappingRow[]> {
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

  const config = parseCoaMappingConfig(center[CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY]);
  return mergeCoaMappingRows(config?.mappings ?? []);
}

export async function saveCoaMappingRows(
  userId: string,
  mappings: readonly CoaMappingRow[],
): Promise<CoaMappingConfig> {
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

  const config: CoaMappingConfig = {
    version: 1,
    mappings: mergeCoaMappingRows(mappings),
  };

  existing[CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY] = config;

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

export async function updateCoaMappingRow(
  userId: string,
  input: {
    pnlLineKey: string;
    glAccountCode: string;
    externalAccountId?: string | null;
    externalAccountName?: string | null;
    externalProvider?: "quickbooks" | "xero" | null;
  },
): Promise<CoaMappingConfig> {
  const rows = await loadCoaMappingRows(userId);
  const coa = coaAccountByCode(input.glAccountCode);

  const next = rows.map((row) => {
    if (row.pnlLineKey !== input.pnlLineKey) return row;
    return {
      ...row,
      glAccountCode: coa?.code ?? input.glAccountCode,
      glAccountName: coa?.name ?? row.glAccountName,
      externalProvider: input.externalProvider ?? null,
      externalAccountId: input.externalAccountId?.trim() || null,
      externalAccountName: input.externalAccountName?.trim() || null,
    };
  });

  return saveCoaMappingRows(userId, next);
}
