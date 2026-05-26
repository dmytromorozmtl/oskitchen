import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export async function supplierInvoiceListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.SupplierInvoiceWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.SupplierInvoiceWhereInput;
}

export async function supplierInvoiceByIdWhereForOwner(
  ownerUserId: string,
  invoiceId: string,
): Promise<Prisma.SupplierInvoiceWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: invoiceId }] } as Prisma.SupplierInvoiceWhereInput;
}

export async function bankTransactionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.BankTransactionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.BankTransactionWhereInput;
}

export async function pnlSnapshotListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PnlSnapshotWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PnlSnapshotWhereInput;
}

export async function playbookRunListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PlaybookRunWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PlaybookRunWhereInput;
}

export async function playbookRunByIdWhereForOwner(
  ownerUserId: string,
  runId: string,
): Promise<Prisma.PlaybookRunWhereInput> {
  const scope = await playbookRunListWhereForOwner(ownerUserId);
  return { AND: [scope, { id: runId }] } as Prisma.PlaybookRunWhereInput;
}

export async function playbookEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PlaybookEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PlaybookEventWhereInput;
}

export async function posAuditEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.POSAuditEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.POSAuditEventWhereInput;
}

export async function timeEntryListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TimeEntryWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TimeEntryWhereInput;
}

export async function cashCountListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CashCountWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CashCountWhereInput;
}

export async function bankTransactionByIdWhereForOwner(
  ownerUserId: string,
  txId: string,
): Promise<Prisma.BankTransactionWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: txId }] } as Prisma.BankTransactionWhereInput;
}

export async function purchaseOrderByIdWhereForOwner(
  ownerUserId: string,
  purchaseOrderId: string,
): Promise<Prisma.PurchaseOrderWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: purchaseOrderId }] } as Prisma.PurchaseOrderWhereInput;
}
