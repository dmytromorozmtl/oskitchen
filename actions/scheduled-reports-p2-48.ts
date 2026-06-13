"use server";

import { revalidatePath } from "next/cache";

import { saveScheduledReportsSettings } from "@/lib/analytics/scheduled-reports-p2-48-storage";
import { SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE } from "@/lib/analytics/scheduled-reports-p2-48-policy";
import { requireSessionUser } from "@/lib/auth";

export async function toggleScheduledReportsP2_48Action(enabled: boolean): Promise<{ ok: true }> {
  const user = await requireSessionUser();
  await saveScheduledReportsSettings(user.id, { enabled });
  revalidatePath(SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE);
  return { ok: true };
}
