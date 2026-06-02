import type { PurchaseOrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { findSupplierByName, nextPurchaseOrderNumber } from "@/services/purchasing/purchasing-service";

export type AiPurchaseLineInput = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  supplierItemId: string | null;
};

export type CreateAiPurchaseOrdersResult = {
  poIds: string[];
  errors: string[];
  orders: CreatedAiPurchaseOrder[];
};

export type CreatedAiPurchaseOrder = {
  poId: string;
  orderNumber: string;
  supplierName: string;
  total: number;
  status: PurchaseOrderStatus;
  lineCount: number;
  ingredientIds: string[];
};

export type CreatePoStatusResolver = (subtotal: number) => {
  status: PurchaseOrderStatus;
  approvalActions: { action: string; notes: string }[];
};

async function resolveSupplierId(
  userId: string,
  supplierId: string,
  supplierName: string,
): Promise<string | null> {
  if (!supplierId.startsWith("default-")) {
    const direct = await prisma.supplier.findFirst({
      where: { id: supplierId, userId, active: true },
      select: { id: true },
    });
    if (direct) return direct.id;
  }

  const byName = await findSupplierByName(userId, supplierName);
  return byName?.id ?? null;
}

function groupBySupplier(lines: AiPurchaseLineInput[]): Map<string, AiPurchaseLineInput[]> {
  const map = new Map<string, AiPurchaseLineInput[]>();
  for (const line of lines) {
    const key = `${line.supplierId}::${line.supplierName}`;
    const list = map.get(key) ?? [];
    list.push(line);
    map.set(key, list);
  }
  return map;
}

/** Create draft PO(s) grouped by supplier from AI recommendations. */
export async function createPurchaseOrdersFromAiLines(
  userId: string,
  performedById: string,
  lines: AiPurchaseLineInput[],
  options?: {
    notes?: string;
    resolveStatus?: CreatePoStatusResolver;
  },
): Promise<CreateAiPurchaseOrdersResult> {
  const poIds: string[] = [];
  const errors: string[] = [];
  const orders: CreatedAiPurchaseOrder[] = [];

  if (lines.length === 0) {
    return { poIds, errors: ["No items to order."], orders };
  }

  const groups = groupBySupplier(lines);
  const defaultNotes = options?.notes ?? "Created from AI Purchasing recommendations";

  for (const [, groupLines] of groups) {
    const first = groupLines[0]!;
    const supplierId = await resolveSupplierId(userId, first.supplierId, first.supplierName);
    if (!supplierId) {
      errors.push(`No supplier on file for "${first.supplierName}" — add supplier first.`);
      continue;
    }

    let subtotal = 0;
    const lineData = groupLines.map((line) => {
      const totalCost = Math.round(line.quantity * line.unitCost * 100) / 100;
      subtotal += totalCost;
      return {
        ingredientId: line.ingredientId,
        supplierItemId: line.supplierItemId,
        description: line.ingredientName,
        quantity: line.quantity,
        unit: line.unit,
        unitCost: line.unitCost,
        totalCost,
        notes: "AI Purchasing recommendation",
      };
    });

    const statusPlan = options?.resolveStatus?.(subtotal) ?? {
      status: "DRAFT" as PurchaseOrderStatus,
      approvalActions: [{ action: "CREATED_DRAFT", notes: "AI Purchasing" }],
    };

    const orderNumber = await nextPurchaseOrderNumber(userId);
    const po = await prisma.purchaseOrder.create({
      data: {
        userId,
        supplierId,
        orderNumber,
        status: statusPlan.status,
        sourceType: "SHORTAGE",
        subtotal,
        tax: 0,
        shipping: 0,
        total: subtotal,
        createdById: performedById,
        approvedById: statusPlan.status === "APPROVED" ? performedById : null,
        notes: defaultNotes,
        lines: { create: lineData },
      },
    });

    for (const evt of statusPlan.approvalActions) {
      await prisma.purchaseApprovalEvent.create({
        data: {
          purchaseOrderId: po.id,
          action: evt.action,
          performedById,
          notes: evt.notes,
        },
      });
    }

    poIds.push(po.id);
    orders.push({
      poId: po.id,
      orderNumber,
      supplierName: first.supplierName,
      total: subtotal,
      status: statusPlan.status,
      lineCount: groupLines.length,
      ingredientIds: groupLines.map((l) => l.ingredientId),
    });
  }

  return { poIds, errors, orders };
}
