import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildMarketplaceCheckoutTrustSignals,
  buildMarketplaceCheckoutTrustSnapshot,
  MARKETPLACE_CHECKOUT_TRUST_POLICY_ID,
  MARKETPLACE_CHECKOUT_TRUST_STRIP_TEST_ID,
} from "@/lib/marketplace/marketplace-checkout-trust-policy";
import { MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD } from "@/lib/marketplace/checkout-utils";

const ROOT = process.cwd();

describe("marketplace checkout trust policy (DES-17)", () => {
  it("locks DES-17 policy id", () => {
    expect(MARKETPLACE_CHECKOUT_TRUST_POLICY_ID).toBe("marketplace-checkout-trust-des17-v1");
  });

  it("includes approval caution signal when subtotal exceeds limit", () => {
    const signals = buildMarketplaceCheckoutTrustSignals({
      vendorCount: 2,
      itemCount: 5,
      subtotal: MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD + 100,
      requiresApproval: true,
    });
    const approval = signals.find((signal) => signal.id === "approval_gate");
    expect(approval?.tone).toBe("caution");
    expect(approval?.title).toContain("approval");
  });

  it("includes positive auto-submit signal below approval limit", () => {
    const signals = buildMarketplaceCheckoutTrustSignals({
      vendorCount: 1,
      itemCount: 2,
      subtotal: 500,
      requiresApproval: false,
    });
    const approval = signals.find((signal) => signal.id === "approval_gate");
    expect(approval?.tone).toBe("positive");
    expect(approval?.title).toContain("Auto-submit");
  });

  it("builds snapshot with vendor names from groups", () => {
    const snapshot = buildMarketplaceCheckoutTrustSnapshot({
      vendorGroups: [
        { vendorId: "v1", vendorName: "PackPro", items: [], subtotal: 100 },
        { vendorId: "v2", vendorName: "FreshCo", items: [], subtotal: 200 },
      ],
      itemCount: 3,
      subtotal: 300,
    });
    expect(snapshot.vendorCount).toBe(2);
    expect(snapshot.vendorNames).toEqual(["PackPro", "FreshCo"]);
    expect(snapshot.signals.length).toBeGreaterThanOrEqual(5);
  });

  it("wires trust strip into checkout client", () => {
    const checkout = readFileSync(
      join(ROOT, "components/marketplace/marketplace-checkout-client.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/marketplace/marketplace-checkout-trust-strip.tsx"),
      "utf8",
    );
    expect(checkout).toContain("MarketplaceCheckoutTrustStrip");
    expect(strip).toContain("MARKETPLACE_CHECKOUT_TRUST_STRIP_TEST_ID");
    expect(strip).toContain("marketplace-checkout-trust-");
  });
});
