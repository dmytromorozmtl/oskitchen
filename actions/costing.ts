"use server";


import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { parseCostingSettingsJson } from "@/lib/costing/costing-settings";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { runFullRecipeCosting } from "@/services/costing/costing-service";

const COSTING_PATHS = [
  "/dashboard/costing",
  "/dashboard/costing/items",
  "/dashboard/costing/menus",
  "/dashboard/costing/recipes-missing",
  "/dashboard/costing/components",
  "/dashboard/costing/channel-fees",
  "/dashboard/costing/scenarios",
  "/dashboard/costing/alerts",
  "/dashboard/costing/reports",
  "/dashboard/costing/settings",
];

function revalidateCosting() {
  for (const p of COSTING_PATHS) {
    revalidatePath(p);
  }
  revalidatePath("/dashboard");
}

async function requireCostingPermission(
  permission: PermissionKey,
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "costing.permission_denied",
      entityType: "Costing",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function recalculateCostSnapshotsAction() {
  try {
    const gate = await requireCostingPermission(
      "reports.read.financial",
      "costing.recalculate_snapshots",
    );
    if (!gate.ok) {
      return { error: gate.error };
    }
    const { sessionUser: user } = await requireTenantActor();
    const r = await runFullRecipeCosting(user.id, user.id);
    if (!r.ok) {
      return { error: r.error };
    }
    revalidateCosting();
    return { ok: true as const, created: r.snapshotsWritten };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function saveCostingSettingsAction(formData: FormData): Promise<void> {
  const gate = await requireCostingPermission("workspace.settings", "costing.save_settings");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: dataUserId } });
  const prev = parseCostingSettingsJson(kitchen?.costingSettingsJson ?? null);

  const num = (key: string) => {
    const v = formData.get(key);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const next: Record<string, unknown> = { ...prev };
  const setNum = (key: string, formKey: string) => {
    const v = num(formKey);
    if (v !== undefined) next[key] = v;
  };

  setNum("defaultLaborRatePerMinute", "defaultLaborRatePerMinute");
  setNum("defaultPaymentProcessingPercent", "defaultPaymentProcessingPercent");
  setNum("overheadPercentOfPrimeCost", "overheadPercentOfPrimeCost");
  setNum("targetMarginPercent", "targetMarginPercent");
  setNum("warningMarginPercent", "warningMarginPercent");
  setNum("minimumSuggestedPrice", "minimumSuggestedPrice");

  if (formData.get("foodCostTargetClear") === "on") {
    next.foodCostTargetPercent = null;
  } else {
    const f = num("foodCostTargetPercent");
    if (f !== undefined) next.foodCostTargetPercent = f;
  }

  const ch = String(formData.get("defaultChannelProvider") ?? "").trim();
  if (ch) next.defaultChannelProvider = ch.slice(0, 80);

  const oh = formData.get("enableOverheadInTotalCost");
  if (oh === "true" || oh === "false") {
    next.enableOverheadInTotalCost = oh === "true";
  }

  const rs = formData.get("roundingStyle");
  if (rs === "NONE" || rs === "NEAREST_NICKEL" || rs === "PSYCHOLOGICAL_99") {
    next.roundingStyle = rs;
  }

  const cleaned = JSON.parse(JSON.stringify(next)) as Prisma.InputJsonValue;

  await prisma.kitchenSettings.upsert({
    where: { userId: dataUserId },
    create: {
      userId: dataUserId,
      costingSettingsJson: cleaned,
    },
    update: { costingSettingsJson: cleaned },
  });
  revalidateCosting();
}

export async function createChannelFeeRuleAction(formData: FormData): Promise<void> {
  const gate = await requireCostingPermission(
    "reports.read.financial",
    "costing.create_channel_fee_rule",
  );
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const channel = String(formData.get("channelProvider") ?? "").trim();
  if (!channel) return;
  const feeType = String(formData.get("feeType") ?? "PERCENTAGE");
  if (feeType !== "PERCENTAGE" && feeType !== "FIXED" && feeType !== "MIXED") return;
  const pct = Number(formData.get("percentage") ?? 0);
  const fixed = Number(formData.get("fixedAmount") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.channelFeeRule.create({
    data: {
      userId: dataUserId,
      channelProvider: channel.slice(0, 80),
      feeType: feeType as "PERCENTAGE" | "FIXED" | "MIXED",
      percentage: new Prisma.Decimal(pct),
      fixedAmount: new Prisma.Decimal(fixed),
      notes,
      active: true,
    },
  });
  revalidateCosting();
}

export async function createMarginRuleAction(formData: FormData): Promise<void> {
  const gate = await requireCostingPermission(
    "reports.read.financial",
    "costing.create_margin_rule",
  );
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const target = Number(formData.get("targetMarginPercent"));
  const warn = Number(formData.get("warningMarginPercent"));
  if (!Number.isFinite(target) || !Number.isFinite(warn)) return;
  const businessRaw = String(formData.get("businessMode") ?? "").trim();
  const businessMode =
    businessRaw === "" ? undefined : (businessRaw as import("@prisma/client").BusinessType);

  await prisma.marginRule.create({
    data: {
      userId: dataUserId,
      businessMode: businessMode ?? null,
      productType: null,
      targetMarginPercent: new Prisma.Decimal(target),
      warningMarginPercent: new Prisma.Decimal(warn),
      active: true,
    },
  });
  revalidateCosting();
}

export async function savePriceScenarioAction(formData: FormData): Promise<void> {
  const gate = await requireCostingPermission(
    "reports.read.financial",
    "costing.save_price_scenario",
  );
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const title = String(formData.get("title") ?? "Scenario").trim() || "Scenario";
  const salePrice = Number(formData.get("salePrice") ?? 0);
  const ingredientDelta = Number(formData.get("ingredientCostDeltaPercent") ?? 0);
  const laborDelta = Number(formData.get("laborCostDeltaPercent") ?? 0);
  const packagingDelta = Number(formData.get("packagingCostDeltaPercent") ?? 0);
  const discount = Number(formData.get("discountPercent") ?? 0);
  const target = formData.get("targetMarginPercent");
  const targetMarginPercent = target === "" || target == null ? null : Number(target);

  const scenarioJson = {
    salePrice,
    ingredientCostDeltaPercent: ingredientDelta,
    laborCostDeltaPercent: laborDelta,
    packagingCostDeltaPercent: packagingDelta,
    discountPercent: discount,
    targetMarginPercent: targetMarginPercent != null && Number.isFinite(targetMarginPercent) ? targetMarginPercent : null,
  };

  await prisma.priceScenario.create({
    data: {
      userId: dataUserId,
      title: title.slice(0, 255),
      scenarioJson,
    },
  });
  revalidatePath("/dashboard/costing/scenarios");
}
