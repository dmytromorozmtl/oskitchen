import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TRUST_BETA_BADGE_COMPONENT,
  TRUST_BETA_BADGE_MARKERS,
  TRUST_MATURITY_SECTION_COMPONENT,
  TRUST_MATURITY_SECTION_MARKERS,
  TRUST_PAGE_MARKERS,
  TRUST_PAGE_ROUTE,
} from "@/lib/execution/trust-page-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

/**
 * FINAL-19 / MKT-08 — public trust page explains BETA, Preview, and SKIPPED labels.
 */
describe("trust page maturity surfaces — FINAL-19", () => {
  it("trust route explains BETA / Preview / SKIPPED for operators and sales", () => {
    expect(existsSync(join(ROOT, TRUST_PAGE_ROUTE))).toBe(true);
    const source = readSource(TRUST_PAGE_ROUTE);
    for (const marker of TRUST_PAGE_MARKERS) {
      expect(source, `trust page missing: ${marker}`).toContain(marker);
    }
  });

  it("TrustMaturityLabelsSection documents each maturity badge", () => {
    const source = readSource(TRUST_MATURITY_SECTION_COMPONENT);
    for (const marker of TRUST_MATURITY_SECTION_MARKERS) {
      expect(source, `maturity section missing: ${marker}`).toContain(marker);
    }
  });

  it("beta-badge design system exports BETA and Preview badges", () => {
    const source = readSource(TRUST_BETA_BADGE_COMPONENT);
    for (const marker of TRUST_BETA_BADGE_MARKERS) {
      expect(source, `beta-badge missing: ${marker}`).toContain(marker);
    }
  });
});
