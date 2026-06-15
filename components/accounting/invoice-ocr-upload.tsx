"use client";

import { useState } from "react";

import { uploadInvoiceOcrAction } from "@/actions/accounting/invoice-ocr";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

export function InvoiceOcrUpload() {
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const r = await invokeServerAction(() =>
      uploadInvoiceOcrAction(new FormData(event.currentTarget)),
    );
    if ("error" in r) {
      setResult(r.error ?? "Upload failed");
    } else {
      setResult(
        `OCR confidence ${(r.ocr.confidence * 100).toFixed(0)}% — supplier: ${r.ocr.supplierName ?? "?"}, total: ${r.ocr.totalAmount ?? "?"}, PO match: ${r.match.purchaseOrderId ?? "none"}`,
      );
    }
  }

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
      <input type="file" name="file" accept="image/*,application/pdf" className="text-sm" required />
      <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Upload invoice
      </button>
      {result ? <p className="w-full text-xs text-muted-foreground">{result}</p> : null}
    </form>
  );
}
