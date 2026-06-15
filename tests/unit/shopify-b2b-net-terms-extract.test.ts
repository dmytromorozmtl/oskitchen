import { describe, expect, it } from "vitest";

import {
  extractB2bPaymentTermsFromShopifyOrder,
  extractB2bPoNumberFromShopifyOrder,
  formatB2bCommercialNotes,
  incrementB2bNetTermsStats,
} from "@/lib/integrations/shopify-b2b-net-terms-extract";
import { normalizeShopifyGraphqlB2bOrderShape } from "@/lib/integrations/shopify-graphql-b2b-order-shape";

describe("shopify-b2b-net-terms-extract", () => {
  it("extracts REST payment terms and PO", () => {
    const order = {
      po_number: "PO-7788",
      payment_terms: {
        payment_terms_name: "Net 30",
        payment_terms_type: "net",
        due_in_days: 30,
      },
    };
    expect(extractB2bPoNumberFromShopifyOrder(order)).toBe("PO-7788");
    expect(extractB2bPaymentTermsFromShopifyOrder(order)?.label).toBe("Net 30");
    expect(formatB2bCommercialNotes({
      paymentTerms: extractB2bPaymentTermsFromShopifyOrder(order),
      poNumber: "PO-7788",
    })).toBe("Payment: Net 30 · PO#PO-7788");
  });

  it("normalizes GraphQL commercial fields onto REST keys", () => {
    const shaped = normalizeShopifyGraphqlB2bOrderShape({
      poNumber: "GQL-99",
      paymentTerms: {
        paymentTermsName: "Net 15",
        paymentTermsType: "NET",
        dueInDays: 15,
      },
    });
    expect(shaped.po_number).toBe("GQL-99");
    expect(extractB2bPaymentTermsFromShopifyOrder(shaped)?.label).toBe("Net 15");
  });

  it("increments net terms stats", () => {
    const next = incrementB2bNetTermsStats(null, { withNetTerms: 1, withPoNumber: 1 });
    expect(next.withNetTerms).toBe(1);
    expect(next.withPoNumber).toBe(1);
  });
});
