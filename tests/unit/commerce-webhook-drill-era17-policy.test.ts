import { describe, expect, it } from "vitest";

import {
  COMMERCE_WEBHOOK_DRILL_ERA17_BACKLOG_ID,
  COMMERCE_WEBHOOK_DRILL_ERA17_FORBIDDEN_CLAIMS,
  COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
  COMMERCE_WEBHOOK_DRILL_ERA17_PROOF_STATUS,
  COMMERCE_WEBHOOK_DRILL_ERA17_PROVIDERS,
} from "@/lib/security/commerce-webhook-drill-era17-policy";

describe("commerce webhook drill era17 policy", () => {
  it("locks era17 commerce webhook drill policy id", () => {
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID).toBe("era17-commerce-webhook-drill-v1");
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_PROOF_STATUS).toBe(
      "awaiting_commerce_webhook_drill_execution",
    );
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_BACKLOG_ID).toBe("KOS-E17-021");
  });

  it("covers stripe woocommerce and shopify providers", () => {
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_PROVIDERS).toEqual([
      "stripe",
      "woocommerce",
      "shopify",
    ]);
  });

  it("forbids inflated webhook ops claims", () => {
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_FORBIDDEN_CLAIMS).toContain(
      "Do not claim centralized replay monitoring ops",
    );
  });
});
