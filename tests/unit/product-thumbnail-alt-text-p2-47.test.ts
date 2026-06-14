import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditProductThumbnailAltTextP247,
  formatProductThumbnailAltTextP247AuditLines,
} from "@/lib/frontend/product-thumbnail-alt-text-p2-47-audit";
import {
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CHECK_NPM_SCRIPT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_NPM_SCRIPT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_WORKFLOW,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_DOC,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_WIRING_PATHS,
} from "@/lib/frontend/product-thumbnail-alt-text-p2-47-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Product thumbnail alt text (P2-47)", () => {
  it("locks P2-47 policy and component path", () => {
    expect(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID).toBe(
      "product-thumbnail-alt-text-p2-47-v1",
    );
    expect(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT).toBe(
      "components/dashboard/product-table-image-cell.tsx",
    );
  });

  it("passes full P2-47 audit — alt={productName}, no empty alt, caller wired", () => {
    const summary = auditProductThumbnailAltTextP247(ROOT);
    expect(summary.componentHasProductNameProp).toBe(true);
    expect(summary.componentUsesAltProductName).toBe(true);
    expect(summary.componentNoEmptyAlt).toBe(true);
    expect(summary.callerPassesProductName).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("component uses productName for img alt attribute", () => {
    const source = readSource(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT);
    expect(source).toContain("alt={productName}");
    expect(source).not.toContain('alt=""');
  });

  it("caller passes productName from product title", () => {
    const source = readSource(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER);
    expect(source).toContain("productName={p.title}");
  });

  it("P2-47 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_NPM_SCRIPT}"`);

    const ci = readSource(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_WORKFLOW);
    expect(ci).toContain(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CHECK_NPM_SCRIPT);

    const doc = readSource(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_DOC);
    expect(doc).toContain(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID);

    const artifact = JSON.parse(readSource(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT));
    expect(artifact.policyId).toBe(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID);
    expect(artifact.fix).toBe("alt={productName}");
  });

  it("formats audit lines", () => {
    const summary = auditProductThumbnailAltTextP247(ROOT);
    const lines = formatProductThumbnailAltTextP247AuditLines(summary);
    expect(lines.some((line) => line.includes(PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
