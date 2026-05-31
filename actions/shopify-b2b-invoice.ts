"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { markB2bInvoiceDraftPaid } from "@/services/integrations/shopify-b2b-invoice-payment-service";

export async function markB2bInvoicePaidAction(
  orderId: string,
  options?: { paymentReference?: string | null; paidAmountCents?: number },
): Promise<ActionResult<{ invoiceNumber: string; paymentStatus: string }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await markB2bInvoiceDraftPaid({
      userId: access.actor.userId,
      workspaceId: access.actor.workspaceId,
      orderId,
      performedById: access.actor.sessionUser.id,
      paymentReference: options?.paymentReference,
      paidAmountCents: options?.paidAmountCents,
    });

    if (!result.ok) {
      if (result.skipped) {
        return fail(
          result.reason === "already_paid" || result.reason === "order_already_paid"
            ? "Invoice is already marked paid."
            : result.reason === "no_invoice_draft"
              ? "This order has no B2B invoice draft."
              : "B2B payment collection is not available for this order.",
        );
      }
      return fail("Unable to mark invoice paid.");
    }

    revalidatePath("/dashboard/order-hub");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/storefront/markets");

    return ok({
      invoiceNumber: result.draft.invoiceNumber,
      paymentStatus: result.paymentStatus,
    });
  } catch {
    return fail("Unable to mark invoice paid.");
  }
}

export async function markB2bInvoicePaidFormAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return;
  const paymentReference = String(formData.get("paymentReference") ?? "").trim() || null;
  const paidAmountRaw = String(formData.get("paidAmountCents") ?? "").trim();
  const paidAmountCents = paidAmountRaw ? Number(paidAmountRaw) : undefined;
  await markB2bInvoicePaidAction(orderId, {
    paymentReference,
    paidAmountCents: Number.isFinite(paidAmountCents) ? paidAmountCents : undefined,
  });
}
