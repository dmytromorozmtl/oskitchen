import { describe, expect, it } from "vitest";

import type { ShopifyB2bCompanyImportRow } from "@/lib/integrations/shopify-markets-settings";
import { detectShopifyB2bCompanyConflicts } from "@/services/integrations/shopify-markets-b2b-guard-bidirectional-service";

const importRow: ShopifyB2bCompanyImportRow = {
  shopifyCompanyId: "gid://shopify/Company/1",
  name: "Office Lunch Co",
  externalId: null,
  mainContactEmail: "billing@office.com",
  locationCount: 1,
  locationCountries: ["US"],
  suggestedCompanyAccountId: "acc-1",
  importedAt: "2026-06-01T00:00:00.000Z",
  companyHash: "abc123",
};

describe("shopify-markets-b2b-guard", () => {
  it("detects unmapped Shopify B2B company", () => {
    const { conflicts, detected } = detectShopifyB2bCompanyConflicts({
      b2bCompanyImports: { [importRow.shopifyCompanyId]: importRow },
      b2bCompanyLinks: {},
      companyAccounts: [{ id: "acc-1", name: "Office Lunch Co", billingEmail: "billing@office.com" }],
      b2bAuthority: "kitchenos",
      existingConflicts: {},
    });

    expect(detected).toBeGreaterThan(0);
    expect(Object.values(conflicts).some((row) => row.conflictType === "UNMAPPED")).toBe(true);
  });

  it("detects name mismatch when linked", () => {
    const { conflicts } = detectShopifyB2bCompanyConflicts({
      b2bCompanyImports: { [importRow.shopifyCompanyId]: importRow },
      b2bCompanyLinks: { [importRow.shopifyCompanyId]: "acc-1" },
      companyAccounts: [{ id: "acc-1", name: "Different Legal Name", billingEmail: "billing@office.com" }],
      b2bAuthority: "manual",
      existingConflicts: {},
    });

    expect(Object.values(conflicts).some((row) => row.conflictType === "NAME_MISMATCH")).toBe(true);
  });

  it("detects duplicate link to same KitchenOS account", () => {
    const second: ShopifyB2bCompanyImportRow = {
      ...importRow,
      shopifyCompanyId: "gid://shopify/Company/2",
      name: "Office Lunch Co West",
    };

    const { conflicts } = detectShopifyB2bCompanyConflicts({
      b2bCompanyImports: {
        [importRow.shopifyCompanyId]: importRow,
        [second.shopifyCompanyId]: second,
      },
      b2bCompanyLinks: {
        [importRow.shopifyCompanyId]: "acc-1",
        [second.shopifyCompanyId]: "acc-1",
      },
      companyAccounts: [{ id: "acc-1", name: "Office Lunch Co", billingEmail: "billing@office.com" }],
      b2bAuthority: "manual",
      existingConflicts: {},
    });

    expect(Object.values(conflicts).some((row) => row.conflictType === "DUPLICATE_LINK")).toBe(true);
  });
});
