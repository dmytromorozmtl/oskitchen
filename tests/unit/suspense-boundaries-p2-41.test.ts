import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSuspenseBoundariesP241,
  formatSuspenseBoundariesP241AuditLines,
} from "@/lib/frontend/suspense-boundaries-p2-41-audit";
import {
  pageHasSuspenseWave1Boundary,
  SUSPENSE_BOUNDARIES_P2_41_ARTIFACT,
  SUSPENSE_BOUNDARIES_P2_41_BOUNDARY_COMPONENT,
  SUSPENSE_BOUNDARIES_P2_41_CHECK_NPM_SCRIPT,
  SUSPENSE_BOUNDARIES_P2_41_CI_NPM_SCRIPT,
  SUSPENSE_BOUNDARIES_P2_41_CI_WORKFLOW,
  SUSPENSE_BOUNDARIES_P2_41_DOC,
  SUSPENSE_BOUNDARIES_P2_41_POLICY_ID,
  SUSPENSE_BOUNDARIES_P2_41_WIRING_PATHS,
  SUSPENSE_WAVE_1_BASELINE_PAGES,
  SUSPENSE_WAVE_1_PAGES,
  SUSPENSE_WAVE_1_SECTORS,
} from "@/lib/frontend/suspense-boundaries-p2-41-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Suspense boundaries — wave 1 (P2-41)", () => {
  it("locks P2-41 policy with 55 wave-1 pages across 4 sectors", () => {
    expect(SUSPENSE_BOUNDARIES_P2_41_POLICY_ID).toBe("suspense-boundaries-p2-41-v1");
    expect(SUSPENSE_WAVE_1_SECTORS).toEqual(["today", "marketplace", "pos", "kitchen"]);
    expect(SUSPENSE_WAVE_1_PAGES).toHaveLength(55);
    expect(SUSPENSE_WAVE_1_BASELINE_PAGES).toHaveLength(5);
  });

  it.each(SUSPENSE_WAVE_1_PAGES)(
    "$id wraps async content with SuspenseWave1PageBoundary and sector skeleton",
    (route) => {
      const page = readSource(route.pagePath);
      expect(pageHasSuspenseWave1Boundary(page)).toBe(true);
      expect(page).toContain("SuspenseWave1PageBoundary");
      expect(page).toContain(`sector="${route.sector}"`);
      expect(page).toContain("Async");
    },
  );

  it.each(SUSPENSE_WAVE_1_BASELINE_PAGES)(
    "baseline page %s already has Suspense boundary",
    (pagePath) => {
      const page = readSource(pagePath);
      expect(pageHasSuspenseWave1Boundary(page)).toBe(true);
    },
  );

  it("boundary component wires Suspense to sector skeletons", () => {
    const boundary = readSource(SUSPENSE_BOUNDARIES_P2_41_BOUNDARY_COMPONENT);
    expect(boundary).toContain("<Suspense");
    expect(boundary).toContain("TodaySkeleton");
    expect(boundary).toContain("MarketplaceSkeleton");
    expect(boundary).toContain("POSSkeleton");
    expect(boundary).toContain("KDSSkeleton");
  });

  it("passes full P2-41 audit — 55 wave-1 + 5 baseline pages wrapped", () => {
    const summary = auditSuspenseBoundariesP241(ROOT);
    expect(summary.wrappedCount).toBe(55);
    expect(summary.baselineWrappedCount).toBe(5);
    expect(summary.passed).toBe(true);
  });

  it("P2-41 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SUSPENSE_BOUNDARIES_P2_41_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SUSPENSE_BOUNDARIES_P2_41_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SUSPENSE_BOUNDARIES_P2_41_CI_NPM_SCRIPT}"`);

    const ci = readSource(SUSPENSE_BOUNDARIES_P2_41_CI_WORKFLOW);
    expect(ci).toContain(SUSPENSE_BOUNDARIES_P2_41_CHECK_NPM_SCRIPT);

    const doc = readSource(SUSPENSE_BOUNDARIES_P2_41_DOC);
    expect(doc).toContain(SUSPENSE_BOUNDARIES_P2_41_POLICY_ID);

    const artifact = JSON.parse(readSource(SUSPENSE_BOUNDARIES_P2_41_ARTIFACT));
    expect(artifact.policyId).toBe(SUSPENSE_BOUNDARIES_P2_41_POLICY_ID);
    expect(artifact.wave1PageCount).toBe(55);
  });

  it("formats audit lines", () => {
    const summary = auditSuspenseBoundariesP241(ROOT);
    const lines = formatSuspenseBoundariesP241AuditLines(summary);
    expect(lines.some((line) => line.includes(SUSPENSE_BOUNDARIES_P2_41_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
