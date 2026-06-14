import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAppMarketplaceListingP389,
  formatAppMarketplaceListingP389AuditLines,
} from "@/lib/marketing/app-marketplace-listing-p3-89-audit";
import {
  APP_MARKETPLACE_LISTING_P3_89_ARTIFACT,
  APP_MARKETPLACE_LISTING_P3_89_CHECK_NPM_SCRIPT,
  APP_MARKETPLACE_LISTING_P3_89_CI_WORKFLOW,
  APP_MARKETPLACE_LISTING_P3_89_DOC,
  APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF,
  APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS,
  APP_MARKETPLACE_LISTING_P3_89_POLICY_ID,
  APP_MARKETPLACE_LISTING_P3_89_ROUTE,
  APP_MARKETPLACE_LISTING_P3_89_UNIT_TEST,
  APP_MARKETPLACE_LISTING_P3_89_WIRING_PATHS,
} from "@/lib/marketing/app-marketplace-listing-p3-89-policy";

const ROOT = process.cwd();

describe("App marketplace listing nav removal (P3-89)", () => {
  it("locks policy with route kept but removed from nav", () => {
    expect(APP_MARKETPLACE_LISTING_P3_89_POLICY_ID).toBe("app-marketplace-listing-p3-89-v1");
    expect(APP_MARKETPLACE_LISTING_P3_89_ROUTE).toBe("/app-marketplace");
    expect(APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF).toBe("/partners");
    expect(APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS.length).toBeGreaterThanOrEqual(8);
  });

  it("passes full P3-89 app marketplace nav audit", () => {
    const summary = auditAppMarketplaceListingP389(ROOT);
    expect(summary.navClean, summary.failures.join("; ")).toBe(true);
    expect(summary.stripUsesFallback).toBe(true);
    expect(summary.pageStillPublished).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-89 wiring paths, CI gate, and artifact", () => {
    for (const path of APP_MARKETPLACE_LISTING_P3_89_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[APP_MARKETPLACE_LISTING_P3_89_CHECK_NPM_SCRIPT]).toContain(
      APP_MARKETPLACE_LISTING_P3_89_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, APP_MARKETPLACE_LISTING_P3_89_CI_WORKFLOW), "utf8");
    expect(ci).toContain(APP_MARKETPLACE_LISTING_P3_89_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, APP_MARKETPLACE_LISTING_P3_89_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(APP_MARKETPLACE_LISTING_P3_89_POLICY_ID);
    expect(artifact.inPrimaryNav).toBe(false);

    const doc = readFileSync(join(ROOT, APP_MARKETPLACE_LISTING_P3_89_DOC), "utf8");
    expect(doc).toContain(APP_MARKETPLACE_LISTING_P3_89_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditAppMarketplaceListingP389(ROOT);
    const lines = formatAppMarketplaceListingP389AuditLines(summary);
    expect(lines.some((line) => line.includes(APP_MARKETPLACE_LISTING_P3_89_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
