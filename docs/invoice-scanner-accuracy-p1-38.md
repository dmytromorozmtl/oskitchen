# AI invoice scanner accuracy (P1-38)

**Policy:** `invoice-scanner-accuracy-p1-38-v1`

Gap closure for QA task P1-38: 100 invoices with ground truth → field-level accuracy.

## Corpus

100 synthetic invoice fixtures (`buildInvoiceOcrAccuracyCorpusP2_96`) with ground-truth OCR fields and golden predicted output (no live OpenAI in CI).

## Field-level scoring

Per invoice, compare predicted vs ground truth:

**Header fields:** supplierName, invoiceNumber, invoiceDate, dueDate, totalAmount, taxAmount

**Line fields:** description, quantity, unitPrice, totalPrice

## Threshold

- 100 invoices minimum
- ≥85% field-level accuracy (header + line fields aggregate)

## CI

```bash
npm run check:invoice-scanner-accuracy-p1-38
```

## Artifact

`artifacts/invoice-scanner-accuracy-p1-38.json`
