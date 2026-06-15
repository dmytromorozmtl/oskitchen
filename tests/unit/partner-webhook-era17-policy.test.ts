import { describe, expect, it } from "vitest";

import {
  PARTNER_WEBHOOK_ERA17_BACKLOG_ID,
  PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS,
  PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES,
  PARTNER_WEBHOOK_ERA17_POLICY_ID,
  PARTNER_WEBHOOK_ERA17_PROOF_STATUS,
} from "@/lib/developer/partner-webhook-era17-policy";

describe("partner webhook era17 policy", () => {
  it("locks era17 partner webhook docs policy id", () => {
    expect(PARTNER_WEBHOOK_ERA17_POLICY_ID).toBe("era17-partner-webhook-docs-v1");
    expect(PARTNER_WEBHOOK_ERA17_PROOF_STATUS).toBe("partner_webhook_docs_ready");
    expect(PARTNER_WEBHOOK_ERA17_BACKLOG_ID).toBe("KOS-E17-026");
  });

  it("documents stripe woocommerce and shopify inbound routes", () => {
    const providers = PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES.map((route) => route.provider);
    expect(providers).toEqual(["stripe", "woocommerce", "shopify"]);
  });

  it("forbids inflated webhook partner claims", () => {
    expect(PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS).toContain("production webhook SLA");
    expect(PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS).toContain("guaranteed webhook delivery");
  });
});
