"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { markB2bInvoiceDraftPaid } from "@/services/integrations/shopify-b2b-invoice-payment-service";
import { sendB2bInvoiceOverdueReminderForOrder } from "@/services/integrations/shopify-b2b-ar-aging-service";

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

export async function sendB2bInvoiceReminderAction(
  orderId: string,
): Promise<ActionResult<{ sentAt: string; reminderCount: number }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const result = await sendB2bInvoiceOverdueReminderForOrder({
      userId: access.actor.userId,
      workspaceId: access.actor.workspaceId,
      orderId,
      performedById: access.actor.sessionUser.id,
    });

    if (!result.ok) {
      if (result.skipped) {
        return fail(
          result.reason === "already_paid"
            ? "Invoice is already paid."
            : result.reason === "not_overdue"
              ? "Invoice is not past due yet."
              : result.reason === "reminders_disabled"
                ? "B2B invoice reminders are disabled for this Shopify connection."
                : result.reason === "no_invoice_draft"
                  ? "This order has no B2B invoice draft."
                  : "Unable to send reminder for this order.",
        );
      }
      if (result.reason === "email_not_configured") {
        return fail("Email is not configured — add RESEND_API_KEY to send invoice reminders.");
      }
      if (result.reason === "missing_customer_email") {
        return fail("Customer email is missing on this order.");
      }
      return fail("Unable to send invoice reminder.");
    }

    revalidatePath("/dashboard/order-hub");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/storefront/markets");
    if (orderId) {
      revalidatePath("/dashboard/customers");
    }

    return ok({ sentAt: result.sentAt, reminderCount: result.reminderCount });
  } catch {
    return fail("Unable to send invoice reminder.");
  }
}

export async function sendB2bInvoiceReminderFormAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return;
  await sendB2bInvoiceReminderAction(orderId);
}
