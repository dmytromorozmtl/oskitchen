"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { ensureB2bInvoicePayPortalLink } from "@/services/integrations/shopify-b2b-invoice-pay-portal-service";

export async function getB2bInvoicePayLinkAction(
  orderId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await ensureB2bInvoicePayPortalLink({
      userId: access.actor.userId,
      orderId,
    });

    if (!result.ok) {
      return fail(
        result.reason === "already_paid"
          ? "Invoice is already paid."
          : result.reason === "no_invoice_draft"
            ? "This order has no B2B invoice draft."
            : result.reason === "portal_disabled"
              ? "B2B pay portal is disabled for this Shopify connection."
              : "B2B pay portal is not available for this order.",
      );
    }

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/integrations/shopify");

    return ok({ url: result.url });
  } catch {
    return fail("Unable to create pay link.");
  }
}
