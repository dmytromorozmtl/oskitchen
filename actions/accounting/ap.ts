"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  approveInvoice,
  createInvoice,
  markInvoicePaid,
  matchInvoiceToPO,
} from "@/services/accounting/ap-service";

const invoiceSchema = z.object({
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  totalAmount: z.coerce.number().min(0.01),
  taxAmount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export async function createInvoiceAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid invoice");

  await createInvoice(dataUserId, {
    ...parsed.data,
    invoiceDate: new Date(parsed.data.invoiceDate),
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
  });
  revalidatePath("/dashboard/accounting/invoices");
}

export async function matchInvoiceAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  const purchaseOrderId = z.string().uuid().parse(formData.get("purchaseOrderId"));
  await matchInvoiceToPO(invoiceId, dataUserId, purchaseOrderId);
  revalidatePath("/dashboard/accounting/invoices");
}

export async function approveInvoiceAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  await approveInvoice(invoiceId, dataUserId, sessionUserId);
  revalidatePath("/dashboard/accounting/invoices");
}

export async function markPaidInvoiceAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  await markInvoicePaid(invoiceId, dataUserId);
  revalidatePath("/dashboard/accounting/invoices");
}
