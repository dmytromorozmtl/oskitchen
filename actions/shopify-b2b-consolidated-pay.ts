"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { bulkMintB2bConsolidatedPayLink } from "@/services/integrations/shopify-b2b-consolidated-pay-service";

export async function mintB2bConsolidatedPayLinkAction(
  orderIds: string[],
): Promise<
  ActionResult<{ url: string; batchId: string; invoiceCount: number }>
> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await bulkMintB2bConsolidatedPayLink({
      userId: access.actor.userId,
      orderIds,
    });

    if (!result.ok) {
      const message =
        result.reason === "too_few_invoices"
          ? "Select at least 2 open invoices for a consolidated pay link."
          : result.reason === "mixed_currency"
            ? "Selected invoices must share the same currency."
            : result.reason === "not_enough_open_invoices"
              ? "Not enough open invoices in selection."
              : "Unable to mint consolidated pay link.";
      return fail(message);
    }

    revalidatePath("/dashboard/receivables");
    revalidatePath("/dashboard/order-hub");

    return ok({
      url: result.url,
      batchId: result.batchId,
      invoiceCount: result.invoiceCount,
    });
  } catch {
    return fail("Unable to mint consolidated pay link.");
  }
}
