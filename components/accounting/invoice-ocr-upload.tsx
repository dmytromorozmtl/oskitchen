"use client";

import { useState } from "react";

import { uploadInvoiceOcrAction } from "@/actions/accounting/invoice-ocr";

export function InvoiceOcrUpload() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      action={async (fd) => {
        const r = await uploadInvoiceOcrAction(fd);
        if ("error" in r) {
          setResult(r.error ?? "Upload failed");
        } else {
          setResult(
            `OCR confidence ${(r.ocr.confidence * 100).toFixed(0)}% — supplier: ${r.ocr.supplierName ?? "?"}, total: ${r.ocr.totalAmount ?? "?"}, PO match: ${r.match.purchaseOrderId ?? "none"}`,
          );
        }
      }}
    >
      <input type="file" name="file" accept="image/*,application/pdf" className="text-sm" required />
      <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Upload invoice
      </button>
      {result ? <p className="w-full text-xs text-muted-foreground">{result}</p> : null}
    </form>
  );
}
