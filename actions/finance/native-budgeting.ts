"use server";

import { revalidatePath } from "next/cache";

import type { NativeBudgetCategoryKey } from "@/lib/finance/native-budgeting-types";
import { saveNativeBudgetSettings } from "@/lib/finance/native-budgeting-settings";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";

export type SaveNativeBudgetTargetsInput = {
  revenueTargetUsd: number | null;
  categoryOverrides: Partial<Record<NativeBudgetCategoryKey, number>>;
};

export async function saveNativeBudgetTargetsAction(
  input: SaveNativeBudgetTargetsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) {
    return { ok: false, error: "Permission denied" };
  }

  for (const [, pct] of Object.entries(input.categoryOverrides)) {
    if (pct != null && (pct < 0 || pct > 1)) {
      return { ok: false, error: "Category targets must be between 0% and 100% of revenue" };
    }
  }

  if (input.revenueTargetUsd != null && input.revenueTargetUsd <= 0) {
    return { ok: false, error: "Revenue target must be positive" };
  }

  await saveNativeBudgetSettings(access.actor.userId, {
    revenueTargetUsd: input.revenueTargetUsd,
    categoryOverrides: input.categoryOverrides,
  });

  revalidatePath("/dashboard/finance/budget");
  revalidatePath("/dashboard/reports/financial/pnl");

  return { ok: true };
}
