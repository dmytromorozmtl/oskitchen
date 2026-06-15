import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_SCANNER_NOTES_MARKER,
  type CreateDraftPurchaseOrderFromInvoiceResult,
  type CreateSupplierDocumentFromReceiptResult,
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
  type CreateDraftPurchaseOrderFromInvoiceResult,
  type CreateSupplierDocumentFromReceiptResult,
  type CreateSupplyFromInvoiceResult,
  type InvoiceScanHistoryEntry,
  type ScannedInvoice,
  type ScannedInvoiceLineItem,
} from "@/lib/inventory/invoice-scanner-types";

/**
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

async function resolveScannedInvoiceLines(
  userId: string,
  workspaceId: string | null,
  lineItems: ScannedInvoiceLineItem[],
): Promise<Array<ScannedInvoiceLineItem & { ingredientId: string }>> {
  const validLines = lineItems.filter((line) => line.quantity > 0);
  if (validLines.length === 0) return [];

  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const names = [...new Set(validLines.map((line) => line.name.trim()).filter(Boolean))];
  const existing =
    names.length > 0
      ? await prisma.ingredient.findMany({
          where: {
            AND: [
              ingredientWhere,
              {
                OR: names.map((name) => ({
                  name: { equals: name, mode: "insensitive" as const },
                })),
              },
            ],
          },
          select: { id: true, name: true },
        })
      : [];
  const existingByLower = new Map(existing.map((row) => [row.name.toLowerCase(), row.id]));

  return Promise.all(
    validLines.map(async (line) => {
      if (line.ingredientId) return { ...line, ingredientId: line.ingredientId };
      const name = line.name.trim();
      const existingId = existingByLower.get(name.toLowerCase());
      if (existingId) return { ...line, ingredientId: existingId };

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
      existingByLower.set(name.toLowerCase(), created.id);
      return { ...line, ingredientId: created.id };
    }),
  );
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
    await prisma.$transaction([
      prisma.inventoryStock.update({
        where: { id: stockRow.id },
        data: { quantityOnHand: { increment: quantity } },
      }),
      prisma.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: { increment: quantity } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.inventoryStock.create({
        data: {
          userId,
          workspaceId,
          ingredientId,
          quantityOnHand: quantity,
          unit,
        },
      }),
      prisma.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: { increment: quantity } },
      }),
    ]);
  }
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
  const [supplierId, orderNumber, resolvedLines] = await Promise.all([
    resolveSupplierId(userId, workspaceId, invoice.supplier),
    nextPurchaseOrderNumber(userId),
    resolveScannedInvoiceLines(userId, workspaceId, invoice.lineItems),
  ]);

  if (resolvedLines.length === 0) {
    throw new Error("No valid line items to receive.");
  }

  const subtotal = resolvedLines.reduce((sum, line) => sum + line.total, 0);

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

  await Promise.all(
    po.lines.map(async (line) => {
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
    }),
  );
  const stockUpdated = po.lines.length;

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

/** Photo-first flow — create DRAFT PO + PENDING invoice from scanned line items (no stock receive). */
export async function createDraftPurchaseOrderFromInvoice(
  userId: string,
  workspaceId: string | null,
  invoice: ScannedInvoice,
  options?: {
    performedById?: string;
    imageUrl?: string;
  },
): Promise<CreateDraftPurchaseOrderFromInvoiceResult> {
  const performedById = options?.performedById ?? userId;
  const [supplierId, orderNumber, resolvedLines] = await Promise.all([
    resolveSupplierId(userId, workspaceId, invoice.supplier),
    nextPurchaseOrderNumber(userId),
    resolveScannedInvoiceLines(userId, workspaceId, invoice.lineItems),
  ]);

  if (resolvedLines.length === 0) {
    throw new Error("No valid line items for draft PO.");
  }

  const subtotal = resolvedLines.reduce((sum, line) => sum + line.total, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      userId,
      workspaceId,
      supplierId,
      orderNumber,
      status: "DRAFT",
      sourceType: "MANUAL",
      subtotal,
      tax: invoice.tax,
      shipping: 0,
      total: invoice.total || subtotal + invoice.tax,
      createdById: performedById,
      notes: `${INVOICE_SCANNER_NOTES_MARKER}. Photo-first draft PO from invoice #${invoice.invoiceNumber || orderNumber}. Confidence: ${Math.round(invoice.confidence * 100)}%.`,
      lines: {
        create: resolvedLines.map((line) => ({
          ingredientId: line.ingredientId,
          description: line.name,
          quantity: line.quantity,
          unit: line.unit || "each",
          unitCost: line.unitPrice,
          totalCost: line.total,
          status: "OPEN",
          notes: INVOICE_SCANNER_NOTES_MARKER,
        })),
      },
    },
  });

  const supplierInvoice = await prisma.supplierInvoice.create({
    data: {
      userId,
      workspaceId,
      supplierId,
      invoiceNumber: invoice.invoiceNumber || `DRAFT-${orderNumber}`,
      invoiceDate: invoice.date ? new Date(invoice.date) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      totalAmount: invoice.total || subtotal + invoice.tax,
      taxAmount: invoice.tax,
      status: "PENDING",
      pdfUrl: options?.imageUrl ?? invoice.imageUrl ?? null,
      notes: `${INVOICE_SCANNER_NOTES_MARKER}. Draft PO ${orderNumber} — review before submit.`,
      lineItems: {
        create: resolvedLines.map((line) => ({
          description: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.total,
          purchaseOrderId: po.id,
          ingredientId: line.ingredientId,
        })),
      },
    },
  });

  void auditLog({
    action: "inventory.invoice_scan_draft_po_created",
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
      status: "DRAFT",
    },
  });

  return {
    purchaseOrderId: po.id,
    orderNumber,
    supplierInvoiceId: supplierInvoice.id,
    lineCount: resolvedLines.length,
    status: "DRAFT",
  };
}

/** Paper receipt → PENDING supplier invoice document (Poster POS parity — no PO required). */
export async function createSupplierDocumentFromReceipt(
  userId: string,
  workspaceId: string | null,
  invoice: ScannedInvoice,
  options?: {
    performedById?: string;
    imageUrl?: string;
  },
): Promise<CreateSupplierDocumentFromReceiptResult> {
  const performedById = options?.performedById ?? userId;
  const [supplierId, resolvedLines] = await Promise.all([
    resolveSupplierId(userId, workspaceId, invoice.supplier),
    resolveScannedInvoiceLines(userId, workspaceId, invoice.lineItems),
  ]);

  if (resolvedLines.length === 0) {
    throw new Error("No valid line items for supplier document.");
  }

  const subtotal = resolvedLines.reduce((sum, line) => sum + line.total, 0);

  const supplierInvoice = await prisma.supplierInvoice.create({
    data: {
      userId,
      workspaceId,
      supplierId,
      invoiceNumber: invoice.invoiceNumber || `RECEIPT-${Date.now()}`,
      invoiceDate: invoice.date ? new Date(invoice.date) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      totalAmount: invoice.total || subtotal + invoice.tax,
      taxAmount: invoice.tax,
      status: "PENDING",
      pdfUrl: options?.imageUrl ?? invoice.imageUrl ?? null,
      notes: `${INVOICE_SCANNER_NOTES_MARKER}. Paper receipt → supplier document (Poster POS parity). Confidence: ${Math.round(invoice.confidence * 100)}%.`,
      lineItems: {
        create: resolvedLines.map((line) => ({
          description: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.total,
          ingredientId: line.ingredientId,
        })),
      },
    },
  });

  void auditLog({
    action: "inventory.photo_invoice_supplier_document_created",
    category: "INVENTORY",
    source: "AI_COPILOT",
    actor: { userId: performedById },
    workspaceId,
    entity: {
      type: "SupplierInvoice",
      id: supplierInvoice.id,
      label: supplierInvoice.invoiceNumber,
    },
    metadata: {
      lineCount: resolvedLines.length,
      confidence: invoice.confidence,
      status: "PENDING",
      imageUrl: options?.imageUrl ?? invoice.imageUrl ?? null,
    },
  });

  return {
    supplierInvoiceId: supplierInvoice.id,
    lineCount: resolvedLines.length,
    status: "PENDING",
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

