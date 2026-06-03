import type { Prisma } from "@prisma/client";

import {
  AUTO_ORDERING_STORAGE_KEY,
  readAutoOrderingSettings,
} from "@/lib/inventory/auto-ordering-storage";
import { buildAutoOrderingDashboard } from "@/lib/inventory/auto-ordering-builders";
import type {
  AutoOrderingDashboard,
  AutoOrderingRunResult,
  AutoOrderingSettings,
} from "@/lib/inventory/auto-ordering-types";
import { DEFAULT_AUTO_ORDERING_SETTINGS } from "@/lib/inventory/auto-ordering-types";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { generatePurchaseRecommendations } from "@/services/ai/ai-purchasing";
import { createPurchaseOrdersFromAiLines } from "@/services/ai/ai-purchasing-orders";

export type { AutoOrderingDashboard, AutoOrderingRunResult } from "@/lib/inventory/auto-ordering-types";

async function loadSettings(ownerUserId: string): Promise<AutoOrderingSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return readAutoOrderingSettings(kitchen?.settingsCenterJson ?? null);
}

async function saveSettings(ownerUserId: string, settings: AutoOrderingSettings): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  center[AUTO_ORDERING_STORAGE_KEY] = settings;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });
}

export async function loadAutoOrderingDashboard(workspaceId: string): Promise<AutoOrderingDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [purchasing, settings] = await Promise.all([
    generatePurchaseRecommendations(workspaceId),
    loadSettings(ownerUserId),
  ]);

  return buildAutoOrderingDashboard({
    workspaceId,
    settings,
    recommendations: purchasing.recommendations,
    analyzedAt: purchasing.analyzedAt,
  });
}

export async function updateAutoOrderingSettings(
  workspaceId: string,
  patch: Partial<AutoOrderingSettings>,
): Promise<AutoOrderingSettings> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const current = await loadSettings(ownerUserId);
  const next = { ...current, ...patch };
  await saveSettings(ownerUserId, next);
  return next;
}

export async function runAutoOrderingBatch(input: {
  workspaceId: string;
  performedByUserId: string;
  dryRun?: boolean;
  maxOrders?: number;
}): Promise<AutoOrderingRunResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${input.workspaceId}`);

  const dashboard = await loadAutoOrderingDashboard(input.workspaceId);
  const settings = dashboard.settings;

  if (!settings.enabled && !input.dryRun) {
    return {
      workspaceId: input.workspaceId,
      ranAt: new Date().toISOString(),
      dryRun: false,
      proposalCount: dashboard.proposals.length,
      ordersCreated: 0,
      poIds: [],
      errors: ["Auto-ordering is disabled. Enable it in settings first."],
    };
  }

  const cap = input.maxOrders ?? 12;
  const toOrder = dashboard.proposals
    .filter((p) => p.urgency === "critical" || p.urgency === "high")
    .slice(0, cap);

  if (input.dryRun) {
    return {
      workspaceId: input.workspaceId,
      ranAt: new Date().toISOString(),
      dryRun: true,
      proposalCount: dashboard.proposals.length,
      ordersCreated: toOrder.length,
      poIds: [],
      errors: [],
    };
  }

  const lines = toOrder.map((p) => ({
    ingredientId: p.ingredientId,
    ingredientName: p.ingredientName,
    quantity: p.adjustedQuantity,
    unit: p.unit,
    unitCost: p.estimatedTotal / Math.max(1, p.adjustedQuantity),
    supplierId: p.supplierId,
    supplierName: p.supplierName,
    supplierItemId: null as string | null,
  }));

  const result = await createPurchaseOrdersFromAiLines(ownerUserId, input.performedByUserId, lines);

  const nextSettings: AutoOrderingSettings = {
    ...settings,
    lastRunAt: new Date().toISOString(),
  };
  await saveSettings(ownerUserId, nextSettings);

  return {
    workspaceId: input.workspaceId,
    ranAt: nextSettings.lastRunAt!,
    dryRun: false,
    proposalCount: dashboard.proposals.length,
    ordersCreated: result.poIds.length,
    poIds: result.poIds,
    errors: result.errors,
  };
}

export async function getDefaultAutoOrderingSettings(): Promise<AutoOrderingSettings> {
  return { ...DEFAULT_AUTO_ORDERING_SETTINGS };
}
