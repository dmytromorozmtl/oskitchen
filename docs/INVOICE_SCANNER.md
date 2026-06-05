# AI Invoice Scanner

## What it does

`/dashboard/inventory/invoice-scanner` lets restaurant operators photograph a supplier invoice and convert it into a **supply receipt** that updates inventory stock.

Flow:

1. **Scan** — upload or capture an invoice photo (mobile camera supported).
2. **Review** — AI extracts supplier, dates, line items, and totals with per-line confidence scores.
3. **Confirm** — creates a received purchase order, receiving events, supplier invoice, and stock increments.

## AI honesty

- Labeled **AI-assisted invoice scanning** on every surface.
- Per-line confidence: green ≥90%, yellow 70–89%, red &lt;70%.
- Operators must verify all fields before confirming — nothing posts automatically on low confidence alone.

## Setup

Requires `OPENAI_API_KEY` on the server for vision extraction (uses `gpt-4o-mini` via existing OCR pipeline). Without it, uploads succeed but extraction returns empty fields.

Permissions: `production.manage` (same as other inventory operations).

## Integration

| Module | Connection |
|--------|------------|
| Inventory | Increments `Ingredient.currentStock` and `InventoryStock` |
| Purchasing | Creates `PurchaseOrder` (status RECEIVED) + `ReceivingEvent` |
| AP | Creates `SupplierInvoice` with scanned image URL |
| Audit | `inventory.invoice_scan_supply_created` event |

## Mobile UX

- **Take Photo** — half-screen thumb-friendly button opens live camera viewfinder with invoice alignment frame.
- **Gallery** — pick existing photos from camera roll.
- **Processing** — spinner with “AI is reading your invoice…” while vision runs.
- **Review** — scrollable editable line items with confidence badges.
- **Confirm All** — sticky bottom bar (safe-area aware) on mobile.
- **Offline queue** — photos and pending confirmations stored in IndexedDB; auto-sync on reconnect. Banner shows queue count with manual “Sync now”.
- **PWA** — “Scan Invoice” home-screen shortcut in `manifest.webmanifest` with camera icon.

## vs Poster POS

Poster offers invoice photo capture for supply receipts. OS Kitchen matches that workflow with explicit confidence scores, ingredient matching, editable review step, and full PO/AP/inventory integration — not a standalone OCR widget.

## Limitations

- Vision accuracy depends on photo quality and invoice layout.
- Unmatched line items create new ingredients — review names before confirming.
- PDF invoices are not supported on this page (use AP invoices OCR for accounting-only capture).

## Tests

- Unit: `tests/unit/invoice-scanner-service.test.ts`, `tests/unit/invoice-scanner-offline-queue.test.ts`
- E2E: `e2e/invoice-scanner.spec.ts`
