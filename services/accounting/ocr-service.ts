import OpenAI from "openai";

import { prisma } from "@/lib/prisma";
import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { recordAIUsage, estimateTokens } from "@/lib/ai/budget-guard";
import {
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
  purchaseOrderListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { createInvoice } from "@/services/accounting/ap-service";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ingredientName?: string | null;
  ingredientId?: string | null;
}

export interface InvoiceOCRResult {
  supplierName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  lineItems: InvoiceLineItem[];
  rawText: string;
  confidence: number;
}

/** @deprecated Prefer InvoiceOCRResult — kept for existing server actions. */
export type OcrInvoiceResult = {
  supplier: string | null;
  invoiceNumber: string | null;
  date: string | null;
  total: number | null;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  confidence: number;
};

function emptyOcrResult(): InvoiceOCRResult {
  return {
    supplierName: null,
    invoiceNumber: null,
    invoiceDate: null,
    dueDate: null,
    totalAmount: null,
    taxAmount: null,
    lineItems: [],
    rawText: "",
    confidence: 0,
  };
}

function parseOcrJson(content: string): Record<string, unknown> {
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

async function matchLineItemsToIngredients(
  userId: string,
  parsedItems: Array<Record<string, unknown>>,
): Promise<InvoiceLineItem[]> {
  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const ingredients = await prisma.ingredient.findMany({
    where: { AND: [ingredientWhere, { active: true }] },
    select: { id: true, name: true },
  });

  return parsedItems.map((item) => {
    const description = String(item.description ?? "");
    const quantity = Number(item.quantity ?? 1) || 1;
    const unitPrice = Number(item.unitPrice ?? 0) || 0;
    const totalPrice = Number(item.totalPrice ?? quantity * unitPrice) || quantity * unitPrice;
    const descLower = description.toLowerCase();
    const matchedIngredient = ingredients.find(
      (ing) =>
        ing.name.toLowerCase().includes(descLower) ||
        descLower.includes(ing.name.toLowerCase()),
    );
    return {
      description,
      quantity,
      unitPrice,
      totalPrice,
      ingredientName: matchedIngredient?.name ?? null,
      ingredientId: matchedIngredient?.id ?? null,
    };
  });
}

/**
 * Process an invoice image through OpenAI Vision API.
 * Extracts supplier, invoice number, date, total, and line items.
 */
export async function processInvoiceWithOCR(
  imageBase64: string,
  userId: string,
  workspaceId?: string | null,
): Promise<InvoiceOCRResult> {
  if (!openai) return emptyOcrResult();

  const limit = await assertAiAllowed({
    userId,
    workspaceId,
    kind: "ai_ocr",
    estimatedText: imageBase64.slice(0, 4000),
  });
  if (!limit.ok) {
    return { ...emptyOcrResult(), rawText: limit.error, confidence: 0 };
  }

  const prompt = `You are an invoice OCR system for a restaurant kitchen. Extract the following from this invoice image:
- Supplier/vendor name
- Invoice number
- Invoice date (YYYY-MM-DD)
- Due date (YYYY-MM-DD)
- Total amount (number only, no currency symbol)
- Tax amount (number only, no currency symbol)
- Line items: description, quantity, unit price, total price

Return ONLY a JSON object with these fields. No markdown, no explanation.
{
  "supplierName": "string or null",
  "invoiceNumber": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "totalAmount": number or null,
  "taxAmount": number or null,
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = parseOcrJson(content);
    const lineItems = await matchLineItemsToIngredients(
      userId,
      (parsed.lineItems as Array<Record<string, unknown>>) || [],
    );

    const result = {
      supplierName: parsed.supplierName != null ? String(parsed.supplierName) : null,
      invoiceNumber: parsed.invoiceNumber != null ? String(parsed.invoiceNumber) : null,
      invoiceDate: parsed.invoiceDate != null ? String(parsed.invoiceDate) : null,
      dueDate: parsed.dueDate != null ? String(parsed.dueDate) : null,
      totalAmount: parsed.totalAmount != null ? Number(parsed.totalAmount) : null,
      taxAmount: parsed.taxAmount != null ? Number(parsed.taxAmount) : null,
      lineItems,
      rawText: content,
      confidence: parsed.supplierName ? 0.85 : 0.5,
    };
    if (workspaceId?.trim()) {
      void recordAIUsage(workspaceId, estimateTokens(content), "ai_ocr");
    }
    return result;
  } catch (err) {
    console.error("OCR processing failed:", err);
    return emptyOcrResult();
  }
}

/** Legacy entry — no ingredient matching without userId. */
export async function processInvoiceOCR(imageBase64: string): Promise<OcrInvoiceResult> {
  const result = await processInvoiceWithOCR(imageBase64, "00000000-0000-0000-0000-000000000000");
  return {
    supplier: result.supplierName,
    invoiceNumber: result.invoiceNumber,
    date: result.invoiceDate,
    total: result.totalAmount,
    lineItems: result.lineItems.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    confidence: result.confidence,
  };
}

export async function matchInvoiceToPurchaseOrder(
  userId: string,
  ocr: OcrInvoiceResult | InvoiceOCRResult,
): Promise<{ purchaseOrderId: string | null; supplierId: string | null }> {
  const supplierName = "supplier" in ocr ? ocr.supplier : ocr.supplierName;
  const total = "total" in ocr ? ocr.total : ocr.totalAmount;
  if (!supplierName && total == null) return { purchaseOrderId: null, supplierId: null };

  const [supplierWhere, poScope] = await Promise.all([
    supplierListWhereForOwner(userId),
    purchaseOrderListWhereForOwner(userId),
  ]);

  const supplier = supplierName
    ? await prisma.supplier.findFirst({
        where: {
          AND: [supplierWhere, { name: { contains: supplierName, mode: "insensitive" } }],
        },
      })
    : null;

  const po = await prisma.purchaseOrder.findFirst({
    where: {
      AND: [
        poScope,
        ...(supplier ? [{ supplierId: supplier.id }] : []),
        ...(total != null ? [{ total }] : []),
        { status: { in: ["APPROVED", "SENT", "PARTIALLY_RECEIVED"] } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return { purchaseOrderId: po?.id ?? null, supplierId: supplier?.id ?? null };
}

async function resolveSupplierId(userId: string, supplierName: string | null): Promise<string> {
  const supplierWhere = await supplierListWhereForOwner(userId);

  if (supplierName) {
    const existing = await prisma.supplier.findFirst({
      where: {
        AND: [supplierWhere, { name: { contains: supplierName, mode: "insensitive" } }],
      },
    });
    if (existing) return existing.id;
    const created = await prisma.supplier.create({
      data: { userId, name: supplierName },
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
    data: { userId, name: "Unknown Vendor" },
  });
  return created.id;
}

async function updateInventoryFromOcrLine(
  userId: string,
  item: InvoiceLineItem,
  supplierId: string,
): Promise<void> {
  if (!item.ingredientId) return;

  const [ingredientWhere, stockWhere] = await Promise.all([
    ingredientListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
  ]);

  const ingredient = await prisma.ingredient.findFirst({
    where: { AND: [ingredientWhere, { id: item.ingredientId }] },
    select: { id: true, unit: true, currentStock: true },
  });
  if (!ingredient) return;

  const stockRow = await prisma.inventoryStock.findFirst({
    where: {
      AND: [stockWhere, { ingredientId: item.ingredientId, locationId: null }],
    },
  });
  if (stockRow) {
    await prisma.inventoryStock.update({
      where: { id: stockRow.id },
      data: { quantityOnHand: { increment: item.quantity } },
    });
  } else {
    await prisma.inventoryStock.create({
      data: {
        userId,
        ingredientId: item.ingredientId,
        quantityOnHand: item.quantity,
        unit: ingredient.unit,
      },
    });
  }

  await prisma.ingredient.update({
    where: { id: ingredient.id },
    data: { currentStock: { increment: item.quantity } },
  });

  if (item.unitPrice <= 0) return;

  const supplierItem = await prisma.supplierItem.findFirst({
    where: { supplierId, ingredientId: item.ingredientId },
  });

  await prisma.supplierPriceHistory.create({
    data: {
      supplierItemId: supplierItem?.id ?? null,
      ingredientId: item.ingredientId,
      oldUnitCost: supplierItem ? Number(supplierItem.unitCost) : null,
      newUnitCost: item.unitPrice,
      source: "OCR_INVOICE",
    },
  });
}

/**
 * Create a SupplierInvoice from OCR result and optionally update inventory.
 */
export async function createInvoiceFromOCR(
  userId: string,
  ocrResult: InvoiceOCRResult,
  imageUrl?: string,
) {
  const supplierId = await resolveSupplierId(userId, ocrResult.supplierName);

  const invoice = await createInvoice(userId, {
    supplierId,
    invoiceNumber: ocrResult.invoiceNumber || `OCR-${Date.now()}`,
    invoiceDate: ocrResult.invoiceDate ? new Date(ocrResult.invoiceDate) : new Date(),
    dueDate: ocrResult.dueDate ? new Date(ocrResult.dueDate) : undefined,
    totalAmount: ocrResult.totalAmount ?? 0,
    taxAmount: ocrResult.taxAmount ?? 0,
    notes: `OCR processed. Confidence: ${ocrResult.confidence}`,
    lines: ocrResult.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      ingredientId: item.ingredientId ?? undefined,
    })),
  });

  if (imageUrl) {
    await prisma.supplierInvoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: imageUrl },
    });
  }

  for (const item of ocrResult.lineItems) {
    await updateInventoryFromOcrLine(userId, item, supplierId);
  }

  return invoice;
}
