import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  workspace: { findUnique: vi.fn() },
  supplier: { findFirst: vi.fn(), create: vi.fn() },
  ingredient: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  inventoryStock: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  purchaseOrder: { create: vi.fn() },
  receivingEvent: { create: vi.fn() },
  supplierPriceHistory: { create: vi.fn() },
  supplierInvoice: { findMany: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/services/accounting/ocr-service", () => ({
  processInvoiceWithOCR: vi.fn(async () => ({
    supplierName: "Fresh Foods Co",
    invoiceNumber: "INV-100",
    invoiceDate: "2026-06-01",
    dueDate: "2026-06-15",
    totalAmount: 120,
    taxAmount: 10,
    lineItems: [
      {
        description: "Tomatoes",
        quantity: 10,
        unitPrice: 5,
        totalPrice: 50,
        ingredientName: "Tomatoes",
        ingredientId: "ing-1",
      },
      {
        description: "Olive Oil",
        quantity: 2,
        unitPrice: 30,
        totalPrice: 60,
        ingredientName: null,
        ingredientId: null,
      },
    ],
    rawText: "{}",
    confidence: 0.85,
  })),
}));

vi.mock("@/services/purchasing/purchasing-service", () => ({
  nextPurchaseOrderNumber: vi.fn(async () => "PO-TEST-1"),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ingredientListWhereForOwner: vi.fn(async () => ({ userId: "user-1" })),
  inventoryStockListWhereForOwner: vi.fn(async () => ({ userId: "user-1" })),
  supplierListWhereForOwner: vi.fn(async () => ({ userId: "user-1" })),
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn(async () => undefined),
}));

describe("invoice-scanner-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.workspace.findUnique.mockResolvedValue({ ownerUserId: "user-1" });
    prismaMock.supplier.findFirst.mockResolvedValue({ id: "sup-1" });
    prismaMock.ingredient.findFirst.mockResolvedValue(null);
    prismaMock.ingredient.create.mockResolvedValue({ id: "ing-new" });
    prismaMock.inventoryStock.findFirst.mockResolvedValue(null);
    prismaMock.purchaseOrder.create.mockResolvedValue({
      id: "po-1",
      lines: [
        {
          id: "line-1",
          ingredientId: "ing-1",
          quantity: 10,
          unit: "each",
          unitCost: 5,
        },
        {
          id: "line-2",
          ingredientId: "ing-new",
          quantity: 2,
          unit: "each",
          unitCost: 30,
        },
      ],
    });
    prismaMock.supplierInvoice.create.mockResolvedValue({ id: "inv-1" });
  });

  it("scanInvoice maps OCR result with per-line confidence", async () => {
    const { scanInvoice } = await import("@/services/ai/invoice-scanner-service");
    const result = await scanInvoice("base64data", "ws-1");

    expect(result.supplier).toBe("Fresh Foods Co");
    expect(result.lineItems).toHaveLength(2);
    expect(result.lineItems[0]?.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.lineItems[1]?.confidence).toBeLessThan(0.7);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("confidenceBadgeVariant tiers correctly", async () => {
    const { confidenceBadgeVariant } = await import("@/services/ai/invoice-scanner-service");
    expect(confidenceBadgeVariant(0.95)).toBe("default");
    expect(confidenceBadgeVariant(0.8)).toBe("secondary");
    expect(confidenceBadgeVariant(0.5)).toBe("destructive");
  });

  it("createSupplyFromInvoice creates PO, receiving, and invoice", async () => {
    const { createSupplyFromInvoice, INVOICE_SCANNER_NOTES_MARKER } = await import(
      "@/services/ai/invoice-scanner-service"
    );

    const result = await createSupplyFromInvoice(
      "user-1",
      "ws-1",
      {
        supplier: "Fresh Foods Co",
        invoiceNumber: "INV-100",
        date: "2026-06-01",
        dueDate: "2026-06-15",
        subtotal: 110,
        tax: 10,
        total: 120,
        confidence: 0.87,
        rawText: "{}",
        lineItems: [
          {
            name: "Tomatoes",
            quantity: 10,
            unit: "kg",
            unitPrice: 5,
            total: 50,
            confidence: 0.92,
            ingredientId: "ing-1",
          },
        ],
      },
      { performedById: "user-1" },
    );

    expect(result.purchaseOrderId).toBe("po-1");
    expect(result.linesReceived).toBe(1);
    expect(prismaMock.receivingEvent.create).toHaveBeenCalled();
    expect(prismaMock.supplierInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: expect.stringContaining(INVOICE_SCANNER_NOTES_MARKER),
        }),
      }),
    );
  });
});
