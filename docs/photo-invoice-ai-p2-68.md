# Photo invoice AI — Poster POS parity (P2-68)

**Policy:** `photo-invoice-ai-p2-68-v1`  
**Route:** `/dashboard/inventory/photo-invoice`  
**Gap:** P2-68 — paper receipt → supplier document

## Overview

OS Kitchen captures **paper supplier receipts** via camera, extracts line items with AI vision, and creates a **PENDING supplier invoice document** — comparable to Poster POS receipt capture, without claiming certified parity.

## Flow

1. **Paper receipt capture** — camera or gallery (`photo-invoice-receipt-camera-btn`)
2. **AI line extraction** — OpenAI Vision when configured
3. **Supplier document** — `createSupplierDocumentFromReceipt` → PENDING `SupplierInvoice` with receipt image attached

## Document capabilities

| Capability | Surface |
|------------|---------|
| `photo_capture` | Camera viewfinder / gallery |
| `ai_line_extraction` | Vision OCR line items |
| `supplier_resolution` | Match or create supplier |
| `supplier_document_creation` | PENDING SupplierInvoice |
| `receipt_image_attachment` | pdfUrl = receipt photo |
| `pending_status` | Review before AP approval |
| `line_item_mapping` | Ingredient + quantity + price |
| `confidence_review` | Per-line confidence badges |

## Benchmark corpus

**12 scenarios** covering 100% of document capabilities.

Run: `npm run check:photo-invoice-ai-p2-68`

## Honesty

- AI-assisted — verify all fields before approval
- Also supports draft PO flow (P1-29) from same scanner UI
- Does not auto-receive inventory on supplier document path

## Wiring

- `lib/ai/photo-invoice-ai-p2-68-builder.ts`
- `services/ai/invoice-scanner-service.ts` — `createSupplierDocumentFromReceipt`
- `actions/inventory/invoice-scanner.ts` — `confirmPhotoInvoiceSupplierDocumentAction`
- `components/inventory/invoice-scanner-mobile.tsx`
