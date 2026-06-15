import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LOI_SIGNED_ERA73_DOC,
  LOI_SIGNED_ERA73_DOC_REQUIRED_HEADINGS,
  LOI_SIGNED_ERA73_FORBIDDEN_CLAIMS,
  LOI_SIGNED_ERA73_LOI_SKU,
  LOI_SIGNED_ERA73_POLICY_ID,
  LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS,
} from "@/lib/commercial/loi-signed-era73-policy";

const ROOT = process.cwd();

function auditLoiSignedDoc(root = ROOT) {
  const source = readFileSync(join(root, LOI_SIGNED_ERA73_DOC), "utf8");
  const missingHeadings = LOI_SIGNED_ERA73_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const postStepCount = LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS.filter((step) =>
    source.includes(step),
  ).length;
  return {
    missingHeadings,
    postStepCount,
    passed:
      missingHeadings.length === 0 &&
      postStepCount === LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS.length,
  };
}

function lintLoiSignedCopy(source: string) {
  const lower = source.toLowerCase();
  const forbiddenHits = LOI_SIGNED_ERA73_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return { forbiddenHits, passed: forbiddenHits.length === 0 };
}

describe("loi signed era73", () => {
  it("locks era73 policy, doc path, and LOI SKU", () => {
    expect(LOI_SIGNED_ERA73_POLICY_ID).toBe("era73-first-loi-signed-v1");
    expect(LOI_SIGNED_ERA73_DOC).toBe("docs/loi-signed.md");
    expect(LOI_SIGNED_ERA73_LOI_SKU).toBe("LOI-DP-001");
  });

  it("passes audit on canonical signed LOI doc", () => {
    const audit = auditLoiSignedDoc();
    expect(audit.passed, audit.missingHeadings.join("; ")).toBe(true);
    expect(audit.postStepCount).toBe(LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS.length);
  });

  it("records Riverbend Commissary as first signed design partner", () => {
    const source = readFileSync(join(ROOT, LOI_SIGNED_ERA73_DOC), "utf8");
    expect(source).toContain("Riverbend Commissary LLC");
    expect(source).toContain("2026-06-05");
    expect(source).toContain("LOI-DP-001");
    expect(source).toContain("riverbend-commissary");
  });

  it("flags forbidden LOI signed doc claims", () => {
    const result = lintLoiSignedCopy(
      "Thousands of restaurants with production certified live integrations and SOC 2 certified enterprise SSO.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest signed LOI record copy", () => {
    const source = readFileSync(join(ROOT, LOI_SIGNED_ERA73_DOC), "utf8");
    const result = lintLoiSignedCopy(source);
    expect(result.passed).toBe(true);
  });
});
