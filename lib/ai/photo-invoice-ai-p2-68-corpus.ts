import type { PhotoInvoiceDocumentCapability } from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import type { ScannedInvoice } from "@/lib/inventory/invoice-scanner-types";

export type PhotoInvoiceAiScenarioP268 = {
  id: string;
  label: string;
  capabilities: PhotoInvoiceDocumentCapability[];
  input: ScannedInvoice;
  expectsDocument: boolean;
  minLineItems: number;
};

function baseReceipt(overrides: Partial<ScannedInvoice> = {}): ScannedInvoice {
  return {
    supplier: "Sysco",
    invoiceNumber: "INV-8842",
    date: "2026-06-10",
    dueDate: "2026-07-10",
    lineItems: [
      {
        name: "Chicken breast 40lb",
        quantity: 2,
        unit: "case",
        unitPrice: 89.5,
        total: 179,
        confidence: 0.92,
      },
      {
        name: "Olive oil 1gal",
        quantity: 4,
        unit: "each",
        unitPrice: 18.25,
        total: 73,
        confidence: 0.88,
      },
    ],
    subtotal: 252,
    tax: 20.16,
    total: 272.16,
    confidence: 0.9,
    rawText: "Sysco delivery receipt",
    imageUrl: "https://example.com/receipt.jpg",
    ...overrides,
  };
}

export function buildPhotoInvoiceAiCorpusP268(): PhotoInvoiceAiScenarioP268[] {
  return [
    {
      id: "pi-01-sysco-delivery",
      label: "Sysco paper delivery receipt",
      capabilities: ["photo_capture", "ai_line_extraction"],
      input: baseReceipt(),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-02-restaurant-depot",
      label: "Restaurant Depot handwritten receipt",
      capabilities: ["supplier_resolution", "line_item_mapping"],
      input: baseReceipt({
        supplier: "Restaurant Depot",
        invoiceNumber: "RD-5521",
        lineItems: [
          {
            name: "Mozzarella 5lb",
            quantity: 3,
            unit: "each",
            unitPrice: 14.5,
            total: 43.5,
            confidence: 0.75,
          },
        ],
        subtotal: 43.5,
        tax: 3.48,
        total: 46.98,
        confidence: 0.78,
      }),
      expectsDocument: true,
      minLineItems: 1,
    },
    {
      id: "pi-03-supplier-document",
      label: "Create PENDING supplier invoice document",
      capabilities: ["supplier_document_creation", "pending_status"],
      input: baseReceipt({ supplier: "US Foods" }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-04-receipt-image",
      label: "Attach receipt photo to supplier document",
      capabilities: ["receipt_image_attachment"],
      input: baseReceipt({ imageUrl: "https://cdn.example.com/receipt-001.jpg" }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-05-low-confidence",
      label: "Low-confidence lines flagged for review",
      capabilities: ["confidence_review"],
      input: baseReceipt({
        lineItems: [
          {
            name: "Unknown item",
            quantity: 1,
            unit: "each",
            unitPrice: 12,
            total: 12,
            confidence: 0.55,
          },
        ],
        subtotal: 12,
        tax: 0.96,
        total: 12.96,
        confidence: 0.6,
      }),
      expectsDocument: true,
      minLineItems: 1,
    },
    {
      id: "pi-06-empty-lines",
      label: "Empty line items — document not ready",
      capabilities: ["line_item_mapping"],
      input: baseReceipt({ lineItems: [], subtotal: 0, tax: 0, total: 0 }),
      expectsDocument: false,
      minLineItems: 0,
    },
    {
      id: "pi-07-local-produce",
      label: "Local produce vendor paper invoice",
      capabilities: ["supplier_resolution", "photo_capture"],
      input: baseReceipt({
        supplier: "Local Produce Co",
        invoiceNumber: "LP-2026-0610",
      }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-08-multi-line",
      label: "Multi-line grocery receipt",
      capabilities: ["ai_line_extraction", "line_item_mapping"],
      input: baseReceipt({
        lineItems: [
          { name: "Flour 50lb", quantity: 1, unit: "bag", unitPrice: 22, total: 22, confidence: 0.91 },
          { name: "Sugar 25lb", quantity: 1, unit: "bag", unitPrice: 18, total: 18, confidence: 0.89 },
          { name: "Salt 50lb", quantity: 1, unit: "bag", unitPrice: 12, total: 12, confidence: 0.87 },
        ],
        subtotal: 52,
        tax: 4.16,
        total: 56.16,
      }),
      expectsDocument: true,
      minLineItems: 3,
    },
    {
      id: "pi-09-no-due-date",
      label: "Cash receipt without due date",
      capabilities: ["pending_status"],
      input: baseReceipt({ dueDate: "", supplier: "Cash & Carry" }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-10-unknown-vendor",
      label: "Unknown vendor resolved to placeholder",
      capabilities: ["supplier_resolution"],
      input: baseReceipt({ supplier: "" }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-11-tax-heavy",
      label: "Tax-heavy supplier document totals",
      capabilities: ["supplier_document_creation"],
      input: baseReceipt({ tax: 45.2, total: 317.36, subtotal: 272.16 }),
      expectsDocument: true,
      minLineItems: 2,
    },
    {
      id: "pi-12-full-flow",
      label: "Full paper receipt → supplier document flow",
      capabilities: [
        "photo_capture",
        "ai_line_extraction",
        "supplier_resolution",
        "supplier_document_creation",
        "receipt_image_attachment",
        "pending_status",
        "line_item_mapping",
      ],
      input: baseReceipt({ supplier: "Gordon Food Service", invoiceNumber: "GFS-9912" }),
      expectsDocument: true,
      minLineItems: 2,
    },
  ];
}
