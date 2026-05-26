import { describe, expect, it } from "vitest";

import {
  buildCartSnapshotEnvelope,
  fingerprintFromCartSnapshotJson,
  parseStorefrontCartSnapshot,
} from "@/lib/storefront/cart-snapshot";

describe("cart snapshot envelope v2", () => {
  it("round-trips marketId and lines", () => {
    const envelope = buildCartSnapshotEnvelope({
      marketId: "weekday",
      lines: [{ productId: "p1", title: "Soup", quantity: 2, unitPrice: 9 }],
      taxMode: "us_sales",
    });
    const parsed = parseStorefrontCartSnapshot(envelope);
    expect(parsed.marketId).toBe("weekday");
    expect(parsed.lines).toHaveLength(1);
    expect(parsed.envelope?.schemaVersion).toBe(2);
  });

  it("fingerprints legacy array carts", () => {
    const legacy = [{ productId: "a", quantity: 1 }];
    expect(fingerprintFromCartSnapshotJson(legacy)).toBeTruthy();
    expect(fingerprintFromCartSnapshotJson(buildCartSnapshotEnvelope({ marketId: null, lines: [] }))).toBeNull();
  });
});
