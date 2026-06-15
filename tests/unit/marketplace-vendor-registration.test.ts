import { describe, expect, it } from "vitest";

import {
  extractRegistrationMeta,
  parseVendorDocuments,
  vendorStatusLabel,
} from "@/lib/marketplace/vendor-registration-types";

describe("marketplace vendor registration types", () => {
  it("parses registration documents", () => {
    const docs = parseVendorDocuments([
      {
        kind: "registration",
        country: "Canada",
        contactEmail: "ops@vendor.test",
        submittedAt: "2026-06-01T00:00:00.000Z",
      },
      { kind: "upload", fileName: "w9.pdf", fileUrl: "https://example.com/w9.pdf" },
    ]);
    expect(docs).toHaveLength(2);
    expect(extractRegistrationMeta(docs).country).toBe("Canada");
  });

  it("labels vendor status for UI", () => {
    expect(vendorStatusLabel("UNDER_REVIEW")).toBe("Under Review");
    expect(vendorStatusLabel("APPROVED")).toBe("Approved");
  });
});
