import type { SupplierInvoiceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  supplierInvoiceByIdWhereForOwner,
  supplierInvoiceListWhereForOwner,
} from "@/lib/scope/workspace-accounting-scope";
import { purchaseOrderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function getPendingInvoices(userId: string) {
  const scope = await supplierInvoiceListWhereForOwner(userId);
  return prisma.supplierInvoice.findMany({
    where: { AND: [scope, { status: { in: ["PENDING", "MATCHED"] } }] },
    orderBy: { invoiceDate: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      lineItems: true,
    },
  });
}

export async function listInvoices(userId: string, status?: SupplierInvoiceStatus) {
  const scope = await supplierInvoiceListWhereForOwner(userId);
  return prisma.supplierInvoice.findMany({
    where: status ? { AND: [scope, { status }] } : scope,
    orderBy: { invoiceDate: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      lineItems: true,
    },
    take: 100,
  });
}

export async function createInvoice(
  userId: string,
  data: {
    supplierId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate?: Date;
    totalAmount: number;
    taxAmount?: number;
    notes?: string;
    lines?: {
      description: string;
      quantity: number;
      unitPrice: number;
      purchaseOrderId?: string;
      ingredientId?: string;
    }[];
  },
) {
  const lines = data.lines ?? [
    {
      description: "Invoice total",
      quantity: 1,
      unitPrice: data.totalAmount,
    },
  ];

  return prisma.supplierInvoice.create({
    data: {
      userId,
      supplierId: data.supplierId,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate ?? null,
      totalAmount: data.totalAmount,
      taxAmount: data.taxAmount ?? 0,
      notes: data.notes ?? null,
      lineItems: {
        create: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          totalPrice: l.quantity * l.unitPrice,
          purchaseOrderId: l.purchaseOrderId ?? null,
          ingredientId: l.ingredientId ?? null,
        })),
      },
    },
    include: { supplier: true, lineItems: true },
  });
}

export async function matchInvoiceToPO(invoiceId: string, userId: string, purchaseOrderId: string) {
  const invoiceWhere = await supplierInvoiceByIdWhereForOwner(userId, invoiceId);
  const poScope = await purchaseOrderListWhereForOwner(userId);
  const [invoice, po] = await Promise.all([
    prisma.supplierInvoice.findFirst({
      where: invoiceWhere,
      include: { lineItems: true },
    }),
    prisma.purchaseOrder.findFirst({
      where: { AND: [poScope, { id: purchaseOrderId }] },
      include: { lines: true, supplier: true },
    }),
  ]);
  if (!invoice || !po) throw new Error("Invoice or PO not found");
  if (invoice.supplierId !== po.supplierId) throw new Error("Supplier mismatch");

  for (const line of invoice.lineItems) {
    const poLine = po.lines[0];
    const receivedQty = poLine ? Number(poLine.receivedQuantity ?? poLine.quantity) : null;
    const varianceQty =
      receivedQty != null ? receivedQty - Number(line.quantity) : null;
    await prisma.supplierInvoiceLine.update({
      where: { id: line.id },
      data: {
        purchaseOrderId: po.id,
        receivedQty,
        varianceQty,
        variancePrice:
          varianceQty != null
            ? varianceQty * Number(line.unitPrice)
            : null,
      },
    });
  }

  return prisma.supplierInvoice.update({
    where: { id: invoiceId },
    data: { status: "MATCHED" },
    include: { supplier: true, lineItems: true },
  });
}

export async function approveInvoice(invoiceId: string, userId: string, approvedById: string) {
  const where = await supplierInvoiceByIdWhereForOwner(userId, invoiceId);
  const invoice = await prisma.supplierInvoice.findFirst({ where, select: { id: true } });
  if (!invoice) throw new Error("Invoice not found");
  return prisma.supplierInvoice.update({
    where: { id: invoice.id },
    data: { status: "APPROVED", approvedById },
  });
}

export async function markInvoicePaid(invoiceId: string, userId: string) {
  const where = await supplierInvoiceByIdWhereForOwner(userId, invoiceId);
  const invoice = await prisma.supplierInvoice.findFirst({ where, select: { id: true } });
  if (!invoice) throw new Error("Invoice not found");
  return prisma.supplierInvoice.update({
    where: { id: invoice.id },
    data: { status: "PAID" },
  });
}

export async function getAPSummary(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const scope = await supplierInvoiceListWhereForOwner(userId);
  const invoices = await prisma.supplierInvoice.findMany({
    where: { AND: [scope, { createdAt: { gte: since } }] },
    select: { status: true, totalAmount: true, dueDate: true },
  });

  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "MATCHED");
  const approved = invoices.filter((i) => i.status === "APPROVED");

  return {
    pendingCount: pending.length,
    pendingAmount: pending.reduce((s, i) => s + Number(i.totalAmount), 0),
    approvedCount: approved.length,
    approvedAmount: approved.reduce((s, i) => s + Number(i.totalAmount), 0),
  };
}
