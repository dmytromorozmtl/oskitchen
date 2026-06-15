"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { refreshPnlSnapshot } from "@/services/accounting/pnl-snapshot-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIODS: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];

export async function refreshPnlSnapshotAction(
  period: PnlPeriod = "month",
): Promise<ActionResult<void>> {
  const valid = PERIODS.includes(period) ? period : "month";
  const { dataUserId } = await requireTenantActor();

  try {
    await refreshPnlSnapshot(dataUserId, valid);
    revalidatePath("/dashboard/reports/financial/pnl");
    return ok(undefined);
  } catch {
    return fail("Failed to refresh P&L snapshot");
  }
}
