import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_DOC_PATHS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_MARKERS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CI_SCRIPTS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EVIDENCE_MARKERS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_ORCHESTRATOR_SCRIPT,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REVIEW_SECTION,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_UNIT_TESTS,
} from "@/lib/commercial/competitor-feature-gap-matrix-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("competitor feature gap matrix era17 CI certification (live repo)", () => {
  it("locks era17 competitor matrix refresh policy id", () => {
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID).toBe(
      "era17-competitor-feature-gap-matrix-refresh-v1",
    );
  });

  it("defines era17 competitor matrix scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:competitor-feature-gap-matrix"]).toContain(
      COMPETITOR_FEATURE_GAP_MATRIX_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:investor-narrative-onepager-era17:cert"]).toContain(
      "competitor-feature-gap-matrix-era17-cert-live",
    );
  });

  it("wires orchestrator and matrix doc", () => {
    expect(existsSync(join(ROOT, COMPETITOR_FEATURE_GAP_MATRIX_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC))).toBe(true);
  });

  it("documents era17 competitor matrix in canonical docs", () => {
    const matrix = readFileSync(join(ROOT, COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC), "utf8");
    for (const section of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS) {
      expect(matrix, section).toContain(section);
    }
    for (const competitor of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS) {
      expect(matrix, competitor).toContain(competitor);
    }
    for (const marker of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EVIDENCE_MARKERS) {
      expect(matrix.toLowerCase(), marker).toContain(marker.toLowerCase());
    }
    for (const rel of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_DOC_PATHS) {
      if (rel === COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC) continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REVIEW_SECTION);
    for (const marker of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID);
    for (const rel of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
  });
});
