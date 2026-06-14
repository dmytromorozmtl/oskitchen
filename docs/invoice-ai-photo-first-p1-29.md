# P1-29 — Invoice AI photo-first capture

**Policy:** `invoice-ai-photo-first-p1-29-v1`  
**Registry:** [`artifacts/invoice-ai-photo-first-p1-29.json`](../artifacts/invoice-ai-photo-first-p1-29.json)

## Contract

Photo-first invoice flow on `/dashboard/accounting/invoices` and `/dashboard/inventory/invoice-scanner`:

1. **Photo capture** — camera viewfinder or gallery (`invoice-scan-camera-btn`)
2. **AI line items** — OpenAI Vision extracts supplier, totals, editable line items
3. **Draft PO** — `createDraftPurchaseOrderFromInvoice` → DRAFT purchase order + PENDING supplier invoice (no auto-receive)

## Verify

```bash
npm run check:invoice-ai-photo-first-p1-29
```
