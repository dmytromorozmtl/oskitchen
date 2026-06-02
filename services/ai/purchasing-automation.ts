import type { Prisma } from "@prisma/client";

import {
  filterAutoPurchaseCandidates,
  parsePurchasingAutomationSettings,
  resolvePoAutomationStatus,
} from "@/lib/ai/purchasing-automation-builders";
import type {
  AutoPurchaseResult,
  PurchasingAutomationSettings,
} from "@/lib/ai/purchasing-automation-types";
import { DEFAULT_PURCHASING_AUTOMATION_SETTINGS } from "@/lib/ai/purchasing-automation-types";
import { loadAiPurchasingUiState } from "@/lib/ai/ai-purchasing-ui-storage";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { createPurchaseOrdersFromAiLines } from "@/services/ai/ai-purchasing-orders";
import { loadPurchasingAiDashboard } from "@/services/ai/ai-purchasing-dashboard";

export type {
  AutoPurchaseResult,
  AutoPurchaseOrderResult,
  PurchasingAutomationSettings,
} from "@/lib/ai/purchasing-automation-types";
export {
  AUTO_PURCHASE_MIN_CONFIDENCE,
  AUTO_PURCHASE_MAX_DAYS_REMAINING,
  AUTO_PURCHASE_AUTO_APPROVE_MAX,
} from "@/lib/ai/purchasing-automation-types";
export {
  isEligibleForAutoPurchase,
  resolvePoAutomationStatus,
} from "@/lib/ai/purchasing-automation-builders";

const AUTOMATION_STORAGE_KEY = "aiPurchasingAutomation";

async function loadAutomationSettingsRaw(ownerUserId: string): Promise<PurchasingAutomationSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return { ...DEFAULT_PURCHASING_AUTOMATION_SETTINGS };
  }
  return parsePurchasingAutomationSettings((center as Record<string, unknown>)[AUTOMATION_STORAGE_KEY]);
}

async function saveAutomationSettings(
  ownerUserId: string,
  settings: PurchasingAutomationSettings,
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  existing[AUTOMATION_STORAGE_KEY] = settings;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing as Prisma.InputJsonValue },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}

export async function getPurchasingAutomationSettings(
  workspaceId: string,
): Promise<PurchasingAutomationSettings> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);
  return loadAutomationSettingsRaw(ownerUserId);
}

export async function updatePurchasingAutomationSettings(
  workspaceId: string,
  patch: Partial<PurchasingAutomationSettings>,
): Promise<PurchasingAutomationSettings> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const current = await loadAutomationSettingsRaw(ownerUserId);
  const next = { ...current, ...patch };
  await saveAutomationSettings(ownerUserId, next);
  return next;
}

/**
 * AI Purchasing automation — auto-create POs when confidence > 0.85, days remaining < 3.
 * POs ≤ $500 are auto-approved; above threshold enter approval workflow (READY_FOR_REVIEW).
 */
export async function autoPurchase(
  workspaceId: string,
  options?: { performedById?: string; force?: boolean; dryRun?: boolean },
): Promise<AutoPurchaseResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const performedById = options?.performedById ?? ownerUserId;
  const ranAt = new Date().toISOString();
  const settings = await loadAutomationSettingsRaw(ownerUserId);

  if (!settings.enabled && !options?.force) {
    return {
      workspaceId,
      ranAt,
      enabled: false,
      eligibleCount: 0,
      orderedLineCount: 0,
      skippedIneligibleCount: 0,
      orders: [],
      errors: ["Automation disabled — enable in settings or pass force: true."],
      autoApprovedTotal: 0,
      pendingApprovalTotal: 0,
      aiAssisted: true,
    };
  }

  const [dash, uiState] = await Promise.all([
    loadPurchasingAiDashboard(workspaceId),
    loadAiPurchasingUiState(ownerUserId),
  ]);

  const skippedIds = new Set(Object.keys(uiState.skipped));
  const { eligible, ineligible } = filterAutoPurchaseCandidates(
    dash.recommendations,
    skippedIds,
    settings,
  );

  if (options?.dryRun) {
    const grouped = groupEligibleForPreview(eligible, settings.autoApproveMaxAmount);
    return {
      workspaceId,
      ranAt,
      enabled: settings.enabled || Boolean(options.force),
      eligibleCount: eligible.length,
      orderedLineCount: 0,
      skippedIneligibleCount: ineligible.length,
      orders: grouped.map((g) => ({
        poId: "dry-run",
        orderNumber: "DRY-RUN",
        supplierName: g.supplierName,
        total: g.total,
        status: g.autoApproved ? "APPROVED" : "READY_FOR_REVIEW",
        autoApproved: g.autoApproved,
        lineCount: g.ingredientIds.length,
        ingredientIds: g.ingredientIds,
      })),
      errors: [],
      autoApprovedTotal: grouped.filter((g) => g.autoApproved).reduce((s, g) => s + g.total, 0),
      pendingApprovalTotal: grouped.filter((g) => !g.autoApproved).reduce((s, g) => s + g.total, 0),
      aiAssisted: true,
    };
  }

  if (eligible.length === 0) {
    await saveAutomationSettings(ownerUserId, { ...settings, lastRunAt: ranAt });
    return {
      workspaceId,
      ranAt,
      enabled: true,
      eligibleCount: 0,
      orderedLineCount: 0,
      skippedIneligibleCount: ineligible.length,
      orders: [],
      errors: [],
      autoApprovedTotal: 0,
      pendingApprovalTotal: 0,
      aiAssisted: true,
    };
  }

  const lines = eligible.map((rec) => ({
    ingredientId: rec.ingredientId,
    ingredientName: rec.ingredientName,
    quantity: rec.bestSupplier.orderQuantity,
    unit: rec.unit,
    unitCost: rec.bestSupplier.unitCost,
    supplierId: rec.bestSupplier.supplierId,
    supplierName: rec.bestSupplier.supplierName,
    supplierItemId: rec.bestSupplier.supplierItemId,
  }));

  const created = await createPurchaseOrdersFromAiLines(ownerUserId, performedById, lines, {
    notes: "AI Purchasing automation",
    resolveStatus: (subtotal) => {
      const plan = resolvePoAutomationStatus(subtotal, settings.autoApproveMaxAmount);
      return { status: plan.status, approvalActions: plan.approvalActions };
    },
  });

  const orders = created.orders.map((o) => {
    const autoApproved = o.status === "APPROVED";
    return {
      poId: o.poId,
      orderNumber: o.orderNumber,
      supplierName: o.supplierName,
      total: o.total,
      status: autoApproved ? ("APPROVED" as const) : ("READY_FOR_REVIEW" as const),
      autoApproved,
      lineCount: o.lineCount,
      ingredientIds: o.ingredientIds,
    };
  });

  await saveAutomationSettings(ownerUserId, { ...settings, lastRunAt: ranAt });

  return {
    workspaceId,
    ranAt,
    enabled: true,
    eligibleCount: eligible.length,
    orderedLineCount: eligible.length,
    skippedIneligibleCount: ineligible.length,
    orders,
    errors: created.errors,
    autoApprovedTotal: orders.filter((o) => o.autoApproved).reduce((s, o) => s + o.total, 0),
    pendingApprovalTotal: orders.filter((o) => !o.autoApproved).reduce((s, o) => s + o.total, 0),
    aiAssisted: true,
  };
}

export async function autoPurchaseForUser(
  userId: string,
  options?: { performedById?: string; force?: boolean; dryRun?: boolean },
): Promise<AutoPurchaseResult> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return autoPurchase(workspaceId, options);
}

function groupEligibleForPreview(
  eligible: Awaited<ReturnType<typeof loadPurchasingAiDashboard>>["recommendations"],
  autoApproveMaxAmount: number,
) {
  const bySupplier = new Map<
    string,
    { supplierName: string; total: number; ingredientIds: string[]; autoApproved: boolean; status: "APPROVED" | "READY_FOR_REVIEW" }
  >();

  for (const rec of eligible) {
    const key = `${rec.bestSupplier.supplierId}::${rec.bestSupplier.supplierName}`;
    const bucket = bySupplier.get(key) ?? {
      supplierName: rec.bestSupplier.supplierName,
      total: 0,
      ingredientIds: [],
      autoApproved: false,
      status: "READY_FOR_REVIEW" as const,
    };
    bucket.total = Math.round((bucket.total + rec.bestSupplier.orderTotal) * 100) / 100;
    bucket.ingredientIds.push(rec.ingredientId);
    bySupplier.set(key, bucket);
  }

  return [...bySupplier.values()].map((bucket) => {
    const plan = resolvePoAutomationStatus(bucket.total, autoApproveMaxAmount);
    return {
      ...bucket,
      autoApproved: plan.autoApproved,
      status: plan.autoApproved ? ("APPROVED" as const) : ("READY_FOR_REVIEW" as const),
    };
  });
}
