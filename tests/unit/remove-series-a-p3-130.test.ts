import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRemoveSeriesA,
  formatRemoveSeriesAAuditLines,
} from "@/lib/pm/remove-series-a-p3-130-audit";
import {
  auditExternalSeriesAReferences,
  loadSeriesAReferenceAuditArtifact,
  scanSurfaceForSeriesAViolations,
  validateSeriesAReferenceAuditArtifact,
} from "@/lib/pm/remove-series-a-p3-130-operations";
import {
  REMOVE_SERIES_A_CI_WORKFLOW,
  REMOVE_SERIES_A_DOC,
  REMOVE_SERIES_A_EXTERNAL_SURFACES,
  REMOVE_SERIES_A_NPM_SCRIPT,
  REMOVE_SERIES_A_POLICY_ID,
  REMOVE_SERIES_A_UNIT_TEST,
} from "@/lib/pm/remove-series-a-p3-130-policy";

const ROOT = process.cwd();

describe("Remove Series A references (P3-130)", () => {
  it("locks policy id and eleven external surfaces", () => {
    expect(REMOVE_SERIES_A_POLICY_ID).toBe("remove-series-a-p3-130-v1");
    expect(REMOVE_SERIES_A_EXTERNAL_SURFACES).toHaveLength(11);
  });

  it("allows negated Series A lines in analyst briefing deck", () => {
    const source = readFileSync(join(ROOT, "docs/analyst-briefing-deck.md"), "utf8");
    const result = scanSurfaceForSeriesAViolations(source, "docs/analyst-briefing-deck.md", "analyst");
    expect(result.clean).toBe(true);
  });

  it("scans all external surfaces clean", () => {
    const audit = auditExternalSeriesAReferences(ROOT);
    expect(audit.allClean).toBe(true);
    expect(audit.results.every((result) => result.clean)).toBe(true);
  });

  it("passes full remove Series A audit", () => {
    const summary = auditRemoveSeriesA(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.externalSurfacesClean).toBe(true);
    expect(summary.artifactValid).toBe(true);
    expect(summary.relatedPathsReferenced).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, REMOVE_SERIES_A_DOC))).toBe(true);
    expect(existsSync(join(ROOT, REMOVE_SERIES_A_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[REMOVE_SERIES_A_NPM_SCRIPT]).toContain("audit-remove-series-a-p3-130.ts");
    expect(pkg.scripts?.["test:ci:remove-series-a-p3-130"]).toContain(REMOVE_SERIES_A_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, REMOVE_SERIES_A_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:remove-series-a-p3-130");
  });

  it("formats audit lines", () => {
    const summary = auditRemoveSeriesA(ROOT);
    const lines = formatRemoveSeriesAAuditLines(summary);
    expect(lines.some((line) => line.includes(REMOVE_SERIES_A_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });

  it("validates committed audit artifact when present", () => {
    const artifactPath = join(ROOT, "artifacts/series-a-reference-audit.json");
    if (!existsSync(artifactPath)) {
      return;
    }
    const artifact = loadSeriesAReferenceAuditArtifact(ROOT);
    expect(validateSeriesAReferenceAuditArtifact(artifact)).toBe(true);
  });
});
