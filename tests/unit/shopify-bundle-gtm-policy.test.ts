import { describe, expect, it } from "vitest";

import {
  auditShopifyBundleGtmLanding,
  SHOPIFY_BUNDLE_GTM_POLICY_ID,
  SHOPIFY_BUNDLE_PRIMARY_CTA,
  SHOPIFY_BUNDLE_SETUP_STEPS,
} from "@/lib/marketing/shopify-bundle-gtm-policy";

describe("shopify bundle GTM policy (MKT-13)", () => {
  it("locks MKT-13 policy id and ICP-first CTA", () => {
    expect(SHOPIFY_BUNDLE_GTM_POLICY_ID).toBe("shopify-bundle-gtm-mkt13-v1");
    expect(SHOPIFY_BUNDLE_PRIMARY_CTA.label).toBe("Book Shopify fit call");
    expect(SHOPIFY_BUNDLE_PRIMARY_CTA.href).toContain("utm_source=shopify-bundle");
  });

  it("defines three-step setup path aligned with pilot wizard", () => {
    expect(SHOPIFY_BUNDLE_SETUP_STEPS).toHaveLength(3);
    expect(SHOPIFY_BUNDLE_SETUP_STEPS[1]?.title).toContain("Integration Health");
  });

  it("passes GTM landing audit on /shopify surface", () => {
    const audit = auditShopifyBundleGtmLanding();
    expect(audit.passed).toBe(true);
    expect(audit.missingMarkers).toEqual([]);
  });
});
