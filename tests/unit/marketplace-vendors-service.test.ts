import { describe, expect, it } from "vitest";

import {
  parseMarketplaceVendorPreferences,
  toggleFavoriteVendorId,
} from "@/lib/marketplace/vendor-preferences";

describe("marketplace vendor preferences", () => {
  it("parses favorites and contracts from settings JSON", () => {
    const prefs = parseMarketplaceVendorPreferences({
      favoriteVendorIds: ["v1", "v2"],
      vendorContracts: {
        v1: {
          fileName: "contract.pdf",
          uploadedAt: "2026-06-01T00:00:00.000Z",
        },
      },
    });
    expect(prefs.favoriteVendorIds).toEqual(["v1", "v2"]);
    expect(prefs.vendorContracts.v1?.fileName).toBe("contract.pdf");
  });

  it("toggles favorite vendor ids", () => {
    const base = parseMarketplaceVendorPreferences({ favoriteVendorIds: ["v1"] });
    const added = toggleFavoriteVendorId(base, "v2");
    expect(added.favoriteVendorIds).toEqual(["v1", "v2"]);
    const removed = toggleFavoriteVendorId(added, "v1");
    expect(removed.favoriteVendorIds).toEqual(["v2"]);
  });
});
