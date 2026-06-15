"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
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

async function requireApPermission(
  permission: PermissionKey,
  operation: string,
): Promise<{ ok: true } | { ok: false }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "accounting.ap.permission_denied",
      entityType: "SupplierInvoice",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false };
  }
  return { ok: true };
}

export async function createInvoiceAction(formData: FormData): Promise<void> {
  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid invoice");

  const gate = await requireApPermission("production.manage", "accounting.ap.create");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  await createInvoice(dataUserId, {
    ...parsed.data,
    invoiceDate: new Date(parsed.data.invoiceDate),
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
  });
  revalidatePath("/dashboard/accounting/invoices");
}

export async function matchInvoiceAction(formData: FormData): Promise<void> {
  const gate = await requireApPermission("production.manage", "accounting.ap.match");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  const purchaseOrderId = z.string().uuid().parse(formData.get("purchaseOrderId"));
  await matchInvoiceToPO(invoiceId, dataUserId, purchaseOrderId);
  revalidatePath("/dashboard/accounting/invoices");
}

export async function approveInvoiceAction(formData: FormData): Promise<void> {
  const gate = await requireApPermission("reports.read.financial", "accounting.ap.approve");
  if (!gate.ok) return;

  const { dataUserId, sessionUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  await approveInvoice(invoiceId, dataUserId, sessionUserId);
  revalidatePath("/dashboard/accounting/invoices");
}

export async function markPaidInvoiceAction(formData: FormData): Promise<void> {
  const gate = await requireApPermission("reports.read.financial", "accounting.ap.mark_paid");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const invoiceId = z.string().uuid().parse(formData.get("invoiceId"));
  await markInvoicePaid(invoiceId, dataUserId);
  revalidatePath("/dashboard/accounting/invoices");
}
