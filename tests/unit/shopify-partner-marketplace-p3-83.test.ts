import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditShopifyPartnerMarketplaceP383,
  formatShopifyPartnerMarketplaceP383AuditLines,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-audit";
import {
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS,
  taglineWithinShopifyLimit,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-content";
import {
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARTIFACT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_CHECK_NPM_SCRIPT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_CI_WORKFLOW,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_STATUS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_UNIT_TEST,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_WIRING_PATHS,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-policy";

const ROOT = process.cwd();

describe("Shopify Partner marketplace listing (P3-83)", () => {
  it("locks policy id, app name, and tagline within 80 chars", () => {
    expect(SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID).toBe(
      "shopify-partner-marketplace-p3-83-v1",
    );
    expect(SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME).toBe("OS Kitchen Fulfillment Sync");
    expect(SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_STATUS).toBe("PREP_READY_NOT_LISTED");
    expect(
      taglineWithinShopifyLimit(SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY.tagline),
    ).toBe(true);
    expect(SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS.length).toBeGreaterThanOrEqual(5);
    expect(SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(
      7,
    );
  });

  it("passes full P3-83 Shopify Partner marketplace audit", () => {
    const summary = auditShopifyPartnerMarketplaceP383(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.readinessDocLinked).toBe(true);
    expect(summary.assetsDefined).toBe(true);
    expect(summary.copyArtifactsWired).toBe(true);
    expect(summary.copyValid).toBe(true);
    expect(summary.webhooksDefined).toBe(true);
    expect(summary.scopesDefined).toBe(true);
    expect(summary.checklistComplete).toBe(true);
    expect(summary.upstreamProofsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-83 wiring paths, CI gate, and artifact", () => {
    for (const path of SHOPIFY_PARTNER_MARKETPLACE_P3_83_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SHOPIFY_PARTNER_MARKETPLACE_P3_83_CHECK_NPM_SCRIPT]).toContain(
      SHOPIFY_PARTNER_MARKETPLACE_P3_83_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, SHOPIFY_PARTNER_MARKETPLACE_P3_83_CI_WORKFLOW), "utf8");
    expect(ci).toContain(SHOPIFY_PARTNER_MARKETPLACE_P3_83_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID);
    expect(artifact.status).toBe("PREP_READY_NOT_LISTED");
    expect(artifact.shopifyEndorsementClaimed).toBe(false);

    const doc = readFileSync(join(ROOT, SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC), "utf8");
    expect(doc).toContain(SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditShopifyPartnerMarketplaceP383(ROOT);
    const lines = formatShopifyPartnerMarketplaceP383AuditLines(summary);
    expect(lines.some((line) => line.includes(SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
