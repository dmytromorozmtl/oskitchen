"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  assignB2bArCollectorForCompany,
  bulkMintB2bArPayLinks,
  bulkSendB2bArReminders,
  type B2bArDashboardBulkResult,
} from "@/services/integrations/shopify-b2b-ar-dashboard-service";

export async function bulkSendB2bArRemindersAction(
  orderIds: string[],
): Promise<ActionResult<B2bArDashboardBulkResult>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await bulkSendB2bArReminders({
      userId: access.actor.userId,
      workspaceId: access.actor.workspaceId,
      performedById: access.actor.sessionUser.id,
      orderIds,
    });

    revalidatePath("/dashboard/receivables");
    revalidatePath("/dashboard/order-hub");

    return ok(result);
  } catch {
    return fail("Unable to send bulk reminders.");
  }
}

export async function bulkMintB2bArPayLinksAction(
  orderIds: string[],
): Promise<ActionResult<B2bArDashboardBulkResult & { urls: Array<{ orderId: string; url: string }> }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await bulkMintB2bArPayLinks({
      userId: access.actor.userId,
      orderIds,
    });

    revalidatePath("/dashboard/receivables");
    revalidatePath("/dashboard/order-hub");

    return ok(result);
  } catch {
    return fail("Unable to mint bulk pay links.");
  }
}

export async function assignB2bArCollectorAction(
  companyAccountId: string,
  collectorLabel: string,
): Promise<ActionResult<{ assigned: boolean }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await assignB2bArCollectorForCompany({
      userId: access.actor.userId,
      companyAccountId,
      collectorLabel,
    });
    if (!result.ok) return fail("Unable to assign collector.");

    revalidatePath("/dashboard/receivables");
    return ok({ assigned: true });
  } catch {
    return fail("Unable to assign collector.");
  }
}
