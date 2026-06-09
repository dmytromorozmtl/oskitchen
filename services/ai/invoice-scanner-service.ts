import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_SCANNER_NOTES_MARKER,
  type CreateSupplyFromInvoiceResult,
  type InvoiceScanHistoryEntry,
  type ScannedInvoice,
  type ScannedInvoiceLineItem,
} from "@/lib/inventory/invoice-scanner-types";
import {
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import { processInvoiceWithOCR, type InvoiceOCRResult } from "@/services/accounting/ocr-service";
import { nextPurchaseOrderNumber } from "@/services/purchasing/purchasing-service";

export {
  INVOICE_SCANNER_NOTES_MARKER,
  confidenceBadgeVariant,
  type CreateSupplyFromInvoiceResult,
  type InvoiceScanHistoryEntry,
  type ScannedInvoice,
  type ScannedInvoiceLineItem,
} from "@/lib/inventory/invoice-scanner-types";

import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
 * AI Invoice Scanner — photograph invoice → structured supply data with confidence scores.
 * Uses OpenAI Vision (gpt-4o-mini) when OPENAI_API_KEY is configured.
 */
export async function scanInvoice(
  imageBase64: string,
  workspaceId: string,
): Promise<ScannedInvoice> {
  const ownerUserId = await resolveOwnerUserIdForWorkspace(workspaceId);
  const ocr = await processInvoiceWithOCR(imageBase64, ownerUserId, workspaceId);
  return mapOcrResultToScannedInvoice(ocr);
}

async function resolveOwnerUserIdForWorkspace(workspaceId: string): Promise<string> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!workspace?.ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return workspace.ownerUserId;
}

async function resolveSupplierId(
  userId: string,
  workspaceId: string | null,
  supplierName: string,
): Promise<string> {
  const supplierWhere = await supplierListWhereForOwner(userId);
  const trimmed = supplierName.trim();

  if (trimmed) {
    const existing = await prisma.supplier.findFirst({
      where: {
        AND: [supplierWhere, { name: { equals: trimmed, mode: "insensitive" } }],
      },
    });
    if (existing) return existing.id;

    const created = await prisma.supplier.create({
      data: {
        userId,
        workspaceId,
        name: trimmed,
        active: true,
      },
    });
    return created.id;
  }

  const fallback = await prisma.supplier.findFirst({
    where: {
      AND: [supplierWhere, { name: { equals: "Unknown Vendor", mode: "insensitive" } }],
    },
  });
  if (fallback) return fallback.id;

  const created = await prisma.supplier.create({
    data: { userId, workspaceId, name: "Unknown Vendor", active: true },
  });
  return created.id;
}

async function findOrCreateIngredient(
  userId: string,
  workspaceId: string | null,
  line: ScannedInvoiceLineItem,
): Promise<string> {
  if (line.ingredientId) return line.ingredientId;

  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const name = line.name.trim();
  const existing = await prisma.ingredient.findFirst({
    where: {
      AND: [ingredientWhere, { name: { equals: name, mode: "insensitive" } }],
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.ingredient.create({
    data: {
      userId,
      workspaceId,
      name,
      unit: line.unit || "each",
      costPerUnit: line.unitPrice > 0 ? line.unitPrice : 0,
      currentStock: 0,
      active: true,
    },
  });
  return created.id;
}

async function incrementIngredientStock(
  userId: string,
  workspaceId: string | null,
  ingredientId: string,
  quantity: number,
  unit: string,
): Promise<void> {
  const stockWhere = await inventoryStockListWhereForOwner(userId);
  const stockRow = await prisma.inventoryStock.findFirst({
    where: {
      AND: [stockWhere, { ingredientId, locationId: null }],
    },
  });

  if (stockRow) {
    await prisma.inventoryStock.update({
      where: { id: stockRow.id },
      data: { quantityOnHand: { increment: quantity } },
    });
  } else {
    await prisma.inventoryStock.create({
      data: {
        userId,
        workspaceId,
        ingredientId,
        quantityOnHand: quantity,
        unit,
      },
    });
  }

  await prisma.ingredient.update({
    where: { id: ingredientId },
    data: { currentStock: { increment: quantity } },
  });
}

/**
 * Confirm scanned invoice → supplier, PO, receiving events, stock update, AP invoice, audit log.
 */
export async function createSupplyFromInvoice(
  userId: string,
  workspaceId: string | null,
  invoice: ScannedInvoice,
  options?: {
    performedById?: string;
    imageUrl?: string;
  },
): Promise<CreateSupplyFromInvoiceResult> {
  const performedById = options?.performedById ?? userId;
  const supplierId = await resolveSupplierId(userId, workspaceId, invoice.supplier);

  const resolvedLines: Array<ScannedInvoiceLineItem & { ingredientId: string }> = [];
  for (const line of invoice.lineItems) {
    if (line.quantity <= 0) continue;
    const ingredientId = await findOrCreateIngredient(userId, workspaceId, line);
    resolvedLines.push({ ...line, ingredientId });
  }

  if (resolvedLines.length === 0) {
    throw new Error("No valid line items to receive.");
  }

  const subtotal = resolvedLines.reduce((sum, line) => sum + line.total, 0);
  const orderNumber = await nextPurchaseOrderNumber(userId);

  const po = await prisma.purchaseOrder.create({
    data: {
      userId,
      workspaceId,
      supplierId,
      orderNumber,
      status: "RECEIVED",
      sourceType: "MANUAL",
      subtotal,
      tax: invoice.tax,
      shipping: 0,
      total: invoice.total || subtotal + invoice.tax,
      receivedAt: new Date(),
      createdById: performedById,
      notes: `${INVOICE_SCANNER_NOTES_MARKER}. Invoice #${invoice.invoiceNumber || orderNumber}. Confidence: ${Math.round(invoice.confidence * 100)}%.`,
      lines: {
        create: resolvedLines.map((line) => ({
          ingredientId: line.ingredientId,
          description: line.name,
          quantity: line.quantity,
          unit: line.unit || "each",
          unitCost: line.unitPrice,
          totalCost: line.total,
          receivedQuantity: line.quantity,
          status: "RECEIVED",
          notes: INVOICE_SCANNER_NOTES_MARKER,
        })),
      },
    },
    include: { lines: true },
  });

  let stockUpdated = 0;
  for (const line of po.lines) {
    await prisma.receivingEvent.create({
      data: {
        purchaseOrderId: po.id,
        lineId: line.id,
        ingredientId: line.ingredientId,
        receivedQuantity: line.quantity,
        unit: line.unit,
        receivedById: performedById,
        notes: INVOICE_SCANNER_NOTES_MARKER,
      },
    });

    await incrementIngredientStock(
      userId,
      workspaceId,
      line.ingredientId,
      Number(line.quantity),
      line.unit,
    );
    stockUpdated += 1;

    if (Number(line.unitCost) > 0) {
      await prisma.supplierPriceHistory.create({
        data: {
          ingredientId: line.ingredientId,
          oldUnitCost: null,
          newUnitCost: line.unitCost,
          source: "INVOICE_SCANNER",
        },
      });
    }
  }

  const supplierInvoice = await prisma.supplierInvoice.create({
    data: {
      userId,
      workspaceId,
      supplierId,
      invoiceNumber: invoice.invoiceNumber || `SCAN-${orderNumber}`,
      invoiceDate: invoice.date ? new Date(invoice.date) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      totalAmount: invoice.total || subtotal + invoice.tax,
      taxAmount: invoice.tax,
      status: "MATCHED",
      pdfUrl: options?.imageUrl ?? invoice.imageUrl ?? null,
      notes: `${INVOICE_SCANNER_NOTES_MARKER}. Please verify all fields before exporting. Confidence: ${Math.round(invoice.confidence * 100)}%.`,
      lineItems: {
        create: resolvedLines.map((line) => ({
          description: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.total,
          purchaseOrderId: po.id,
          ingredientId: line.ingredientId,
          receivedQty: line.quantity,
        })),
      },
    },
  });

  void auditLog({
    action: "inventory.invoice_scan_supply_created",
    category: "INVENTORY",
    source: "AI_COPILOT",
    actor: { userId: performedById },
    workspaceId,
    entity: {
      type: "PurchaseOrder",
      id: po.id,
      label: orderNumber,
    },
    metadata: {
      supplierInvoiceId: supplierInvoice.id,
      lineCount: resolvedLines.length,
      confidence: invoice.confidence,
      imageUrl: options?.imageUrl ?? invoice.imageUrl ?? null,
    },
  });

  return {
    purchaseOrderId: po.id,
    orderNumber,
    supplierInvoiceId: supplierInvoice.id,
    linesReceived: resolvedLines.length,
    stockUpdated,
  };
}

/** List recent invoice scans for the workspace (supplier invoices created via scanner). */
export async function listInvoiceScanHistory(
  userId: string,
  take = 20,
): Promise<InvoiceScanHistoryEntry[]> {
  const invoices = await prisma.supplierInvoice.findMany({
    where: {
      userId,
      notes: { contains: INVOICE_SCANNER_NOTES_MARKER },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      supplier: { select: { name: true } },
      lineItems: { select: { purchaseOrderId: true }, take: 1 },
    },
  });

  return invoices.map((inv) => {
    const confidenceMatch = inv.notes?.match(/Confidence:\s*(\d+)%/);
    return {
      id: inv.id,
      supplier: inv.supplier.name,
      invoiceNumber: inv.invoiceNumber,
      total: Number(inv.totalAmount),
      confidence: confidenceMatch ? Number(confidenceMatch[1]) / 100 : 0.85,
      scannedAt: inv.createdAt.toISOString(),
      purchaseOrderId: inv.lineItems[0]?.purchaseOrderId ?? null,
      imageUrl: inv.pdfUrl,
    };
  });
}

