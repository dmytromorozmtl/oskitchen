import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditProductHuntLaunchPrepP260,
  formatProductHuntLaunchPrepP260AuditLines,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-audit";
import {
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_PREP_CHECKLIST,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS,
  taglineWithinProductHuntLimit,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-content";
import {
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARTIFACT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_CHECK_NPM_SCRIPT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_NPM_SCRIPT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_WORKFLOW,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_TIMELINE_HEADINGS,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_UNIT_TEST,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_WIRING_PATHS,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-policy";

const ROOT = process.cwd();

describe("Product Hunt launch prep (P2-60)", () => {
  it("locks policy id, 7 assets, and tagline within 60 chars", () => {
    expect(PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID).toBe(
      "product-hunt-launch-prep-p2-60-v1",
    );
    expect(PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS).toHaveLength(7);
    expect(taglineWithinProductHuntLimit(PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY.tagline)).toBe(
      true,
    );
    expect(PRODUCT_HUNT_LAUNCH_PREP_P2_60_PREP_CHECKLIST.length).toBeGreaterThanOrEqual(7);
  });

  it("covers full launch timeline headings in playbook", () => {
    const playbook = readFileSync(
      join(ROOT, "docs/product-hunt-launch-prep.md"),
      "utf8",
    );
    for (const heading of PRODUCT_HUNT_LAUNCH_PREP_P2_60_TIMELINE_HEADINGS) {
      expect(playbook).toContain(heading);
    }
  });

  it("passes full P2-60 Product Hunt launch prep audit", () => {
    const summary = auditProductHuntLaunchPrepP260(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.playbookWired).toBe(true);
    expect(summary.assetsDefined).toBe(true);
    expect(summary.copyArtifactsWired).toBe(true);
    expect(summary.copyValid).toBe(true);
    expect(summary.checklistComplete).toBe(true);
    expect(summary.deferLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-60 wiring paths, CI gate, and artifact", () => {
    for (const path of PRODUCT_HUNT_LAUNCH_PREP_P2_60_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRODUCT_HUNT_LAUNCH_PREP_P2_60_CHECK_NPM_SCRIPT]).toContain(
      PRODUCT_HUNT_LAUNCH_PREP_P2_60_UNIT_TEST,
    );
    expect(pkg.scripts?.[PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_NPM_SCRIPT]).toContain(
      PRODUCT_HUNT_LAUNCH_PREP_P2_60_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_WORKFLOW), "utf8");
    expect(ci).toContain(PRODUCT_HUNT_LAUNCH_PREP_P2_60_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID);
    expect(artifact.status).toBe("PREP_ONLY");

    const doc = readFileSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC), "utf8");
    expect(doc).toContain(PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditProductHuntLaunchPrepP260(ROOT);
    const lines = formatProductHuntLaunchPrepP260AuditLines(summary);
    expect(lines.some((line) => line.includes(PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
