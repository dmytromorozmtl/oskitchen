import { describe, expect, it } from "vitest";

import {
  INVOICE_SCANNER_OFFLINE_DB,
  INVOICE_SCANNER_OFFLINE_STORE,
  base64ToBlob,
} from "@/lib/inventory/invoice-scanner-offline-queue";

describe("invoice-scanner-offline-queue", () => {
  it("exports IndexedDB contract constants", () => {
    expect(INVOICE_SCANNER_OFFLINE_DB).toBe("kitchenos-invoice-scanner-offline");
    expect(INVOICE_SCANNER_OFFLINE_STORE).toBe("scan_queue");
  });

  it("round-trips base64 blob encoding", () => {
    const original = "hello-invoice";
    const base64 = Buffer.from(original).toString("base64");
    const blob = base64ToBlob(base64, "text/plain");
    expect(blob.type).toBe("text/plain");
    expect(blob.size).toBe(original.length);
  });
});
