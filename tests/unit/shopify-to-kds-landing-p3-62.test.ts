import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditShopifyToKdsLandingP3_62,
  formatShopifyToKdsLandingP3_62AuditLines,
} from "@/lib/marketing/shopify-to-kds-landing-p3-62-audit";
import { validateShopifyToKdsLandingContract } from "@/lib/marketing/shopify-to-kds-landing-p3-62-measurement";
import {
  SHOPIFY_TO_KDS_LANDING_P3_62_AUDIT_SCRIPT,
  SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH,
  SHOPIFY_TO_KDS_LANDING_P3_62_CHECK_NPM_SCRIPT,
  SHOPIFY_TO_KDS_LANDING_P3_62_DOC,
  SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPT,
  SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPTS,
  SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID,
  SHOPIFY_TO_KDS_LANDING_P3_62_PRIMARY_KEYWORD,
  SHOPIFY_TO_KDS_LANDING_P3_62_UNIT_TEST,
  shopifyToKdsLandingPathsAligned,
} from "@/lib/marketing/shopify-to-kds-landing-p3-62-policy";

const ROOT = process.cwd();

describe("Shopify-to-KDS landing (P3-62)", () => {
  it("locks canonical /shopify-to-kds path", () => {
    expect(SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID).toBe("shopify-to-kds-landing-p3-62-v1");
    expect(SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH).toBe("/shopify-to-kds");
    expect(SHOPIFY_TO_KDS_LANDING_P3_62_PRIMARY_KEYWORD).toBe("shopify to kds");
    expect(shopifyToKdsLandingPathsAligned()).toBe(true);
  });

  it("validates shopify-to-kds landing contract", () => {
    const validation = validateShopifyToKdsLandingContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.sitemapWired).toBe(true);
  });

  it("passes full shopify-to-kds landing audit", () => {
    const summary = auditShopifyToKdsLandingP3_62(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatShopifyToKdsLandingP3_62AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, SHOPIFY_TO_KDS_LANDING_P3_62_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SHOPIFY_TO_KDS_LANDING_P3_62_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SHOPIFY_TO_KDS_LANDING_P3_62_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPT]).toContain(
      "audit-shopify-to-kds-landing-p3-62.ts",
    );
    expect(pkg.scripts?.[SHOPIFY_TO_KDS_LANDING_P3_62_CHECK_NPM_SCRIPT]).toContain(
      SHOPIFY_TO_KDS_LANDING_P3_62_UNIT_TEST,
    );
    for (const script of SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
