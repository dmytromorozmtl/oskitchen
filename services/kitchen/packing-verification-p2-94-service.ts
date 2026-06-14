import { startOfDay } from "date-fns";

import {
  buildPackingVerificationReport,
  type PackingVerificationReport,
} from "@/lib/kitchen/packing-verification-p2-94-operations";
import { PACKING_VERIFICATION_P2_94_POLICY_ID } from "@/lib/kitchen/packing-verification-p2-94-policy";
import type { PackingTaskFocus } from "@/lib/packing/packing-focus-era18";
import { loadPackingTasksForDate } from "@/services/packing/load-packing-page-data";

export type PackingVerificationSnapshot = PackingVerificationReport & {
  policyId: typeof PACKING_VERIFICATION_P2_94_POLICY_ID;
};

function toPackingTaskFocus(
  task: Awaited<ReturnType<typeof loadPackingTasksForDate>>[number],
): PackingTaskFocus & { allergenSummary: string | null; verifiedAt: string | null } {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    customerName: task.customerName,
    requiresLabel: task.requiresLabel,
    requiresNutritionLabel: task.requiresNutritionLabel,
    requiresAllergenCheck: task.requiresAllergenCheck,
    labelPrintedAt: task.labelPrintedAt,
    fulfillmentType: task.fulfillmentType,
    allergenSummary: task.allergenSummary,
    verifiedAt: task.verifiedAt,
  };
}

export async function loadPackingVerificationSnapshot(
  userId: string,
): Promise<PackingVerificationSnapshot> {
  const today = startOfDay(new Date());
  const tasks = await loadPackingTasksForDate(userId, today);
  const focusTasks = tasks.map(toPackingTaskFocus);
  const report = buildPackingVerificationReport(focusTasks);

  return {
    policyId: PACKING_VERIFICATION_P2_94_POLICY_ID,
    ...report,
  };
}
