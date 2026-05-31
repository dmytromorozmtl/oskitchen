"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  mergeTipPoolIntoSettingsCenter,
  parseTipPoolRules,
  type TipPoolDistributionMethod,
} from "@/lib/labor/tip-pool-settings";
import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { logLaborPermissionDenied } from "@/services/labor/labor-permission-audit";

const methodSchema = z.enum(["equal", "hours_weighted", "role_weighted", "hybrid_pos_pool"]);

async function requireTipPoolMutationAccess(operation: string) {
  const access = await requireMutationPermission("schedule.manage");
  if (!access.ok) {
    await logLaborPermissionDenied(access.actor, {
      requiredPermission: "schedule.manage",
      operation,
    });
    throw new Error(access.error);
  }
  return access.actor;
}

export async function saveTipPoolRulesAction(formData: FormData): Promise<void> {
  await requireTipPoolMutationAccess("labor.save_tip_pool_rules");
  const { dataUserId } = await requireTenantActor();

  const distributionMethod = methodSchema.parse(formData.get("distributionMethod"));
  const poolPercent = z.coerce.number().min(0).max(100).parse(formData.get("poolPercent"));
  const enabled = formData.get("enabled") === "on" || formData.get("enabled") === "true";

  const eligibleRaw = formData.get("eligibleRoleTypes");
  const eligibleRoleTypes =
    typeof eligibleRaw === "string" && eligibleRaw.trim()
      ? eligibleRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : parseTipPoolRules(null).eligibleRoleTypes;

  const rules = parseTipPoolRules({
    enabled,
    distributionMethod: distributionMethod as TipPoolDistributionMethod,
    poolPercent,
    eligibleRoleTypes,
    roleWeights: parseTipPoolRules(null).roleWeights,
  });

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { settingsCenterJson: true },
  });

  const merged = mergeTipPoolIntoSettingsCenter(kitchen?.settingsCenterJson, rules);

  await prisma.kitchenSettings.upsert({
    where: { userId: dataUserId },
    create: { userId: dataUserId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });

  revalidatePath("/dashboard/staff/tip-pooling");
}
