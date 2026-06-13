import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditProductHuntLaunchPrepP3_65,
  formatProductHuntLaunchPrepP3_65AuditLines,
} from "@/lib/marketing/product-hunt-launch-prep-p3-65-audit";
import { validateProductHuntLaunchPrepContract } from "@/lib/marketing/product-hunt-launch-prep-p3-65-measurement";
import {
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_AUDIT_SCRIPT,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_CHECK_NPM_SCRIPT,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPT,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPTS,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_REQUIRED_TIMELINE,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_UNIT_TEST,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_POLICY_ID,
} from "@/lib/marketing/product-hunt-launch-prep-p3-65-policy";

const ROOT = process.cwd();

describe("Product Hunt launch prep (P3-65)", () => {
  it("locks P3-65 policy and upstream absolute-final reference", () => {
    expect(PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID).toBe("product-hunt-launch-prep-p3-65-v1");
    expect(PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_POLICY_ID).toBe(
      "product-hunt-launch-prep-absolute-final-v1",
    );
    expect(PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC).toBe("docs/product-hunt-launch-prep.md");
    expect(PRODUCT_HUNT_LAUNCH_PREP_P3_65_REQUIRED_TIMELINE).toHaveLength(6);
  });

  it("validates Product Hunt launch prep contract", () => {
    const validation = validateProductHuntLaunchPrepContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamAuditOk).toBe(true);
    expect(validation.archiveWired).toBe(true);
    expect(validation.listingDraftWired).toBe(true);
    expect(validation.timelineComplete).toBe(true);
  });

  it("passes full Product Hunt launch prep audit", () => {
    const summary = auditProductHuntLaunchPrepP3_65(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.upstreamPolicyAligned).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatProductHuntLaunchPrepP3_65AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P3_65_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P3_65_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPT]).toContain(
      "audit-product-hunt-launch-prep-p3-65.ts",
    );
    expect(pkg.scripts?.[PRODUCT_HUNT_LAUNCH_PREP_P3_65_CHECK_NPM_SCRIPT]).toContain(
      PRODUCT_HUNT_LAUNCH_PREP_P3_65_UNIT_TEST,
    );
    for (const script of PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
