import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SEGMENT_LEVEL_NOT_FOUND_P1_33_ARTIFACT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_CHECK_NPM_SCRIPT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_NPM_SCRIPT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_WORKFLOW,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_DASHBOARD,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_DOC,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_POLICY_ID,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENTS,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENT_TEST_IDS,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_STOREFRONT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_VENDOR,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_WIRING_PATHS,
} from "@/lib/frontend/segment-level-not-found-p1-33-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Segment-level not-found.tsx (P1-33)", () => {
  it("locks P1-33 policy and three vertical segments", () => {
    expect(SEGMENT_LEVEL_NOT_FOUND_P1_33_POLICY_ID).toBe("segment-level-not-found-p1-33-v1");
    expect(SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENTS).toEqual(["dashboard", "vendor", "storefront"]);
  });

  it("dashboard not-found has segment test id and Today CTA", () => {
    const source = readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_DASHBOARD);
    expect(source).toContain(`data-testid="${SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENT_TEST_IDS.dashboard}"`);
    expect(source).toContain('href="/dashboard/today"');
  });

  it("vendor not-found has segment test id and vendor dashboard CTA", () => {
    const source = readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_VENDOR);
    expect(source).toContain(`data-testid="${SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENT_TEST_IDS.vendor}"`);
    expect(source).toContain('href="/vendor/dashboard"');
    expect(source).toContain("Vendor page not found");
  });

  it("storefront not-found has segment test id and home CTA", () => {
    const source = readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_STOREFRONT);
    expect(source).toContain(
      `data-testid="${SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENT_TEST_IDS.storefront}"`,
    );
    expect(source).toContain('href="/"');
    expect(source).toContain("Store not found");
  });

  it("P1-33 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SEGMENT_LEVEL_NOT_FOUND_P1_33_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SEGMENT_LEVEL_NOT_FOUND_P1_33_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_NPM_SCRIPT}"`);

    const ci = readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_WORKFLOW);
    expect(ci).toContain(SEGMENT_LEVEL_NOT_FOUND_P1_33_CHECK_NPM_SCRIPT);

    const doc = readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_DOC);
    expect(doc).toContain(SEGMENT_LEVEL_NOT_FOUND_P1_33_POLICY_ID);

    const artifact = JSON.parse(readSource(SEGMENT_LEVEL_NOT_FOUND_P1_33_ARTIFACT));
    expect(artifact.policyId).toBe(SEGMENT_LEVEL_NOT_FOUND_P1_33_POLICY_ID);
    expect(artifact.segments).toHaveLength(3);
  });
});
