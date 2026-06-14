import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRemoveHardwareRoadmapP125,
  formatRemoveHardwareRoadmapP125AuditLines,
} from "@/lib/marketing/remove-hardware-roadmap-p1-25-audit";
import {
  REMOVE_HARDWARE_ROADMAP_P1_25_ARTIFACT,
  REMOVE_HARDWARE_ROADMAP_P1_25_AUDIT_MODULE,
  REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES,
  REMOVE_HARDWARE_ROADMAP_P1_25_CHECK_NPM_SCRIPT,
  REMOVE_HARDWARE_ROADMAP_P1_25_CI_NPM_SCRIPT,
  REMOVE_HARDWARE_ROADMAP_P1_25_CI_WORKFLOW,
  REMOVE_HARDWARE_ROADMAP_P1_25_DEFERRAL_LINE,
  REMOVE_HARDWARE_ROADMAP_P1_25_DOC,
  REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID,
  REMOVE_HARDWARE_ROADMAP_P1_25_UNIT_TEST,
  REMOVE_HARDWARE_ROADMAP_P1_25_WIRING_PATHS,
} from "@/lib/marketing/remove-hardware-roadmap-p1-25-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Remove hardware roadmap from marketing (P1-25)", () => {
  it("locks P1-25 policy and banned hardware coming soon phrases", () => {
    expect(REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID).toBe("remove-hardware-roadmap-p1-25-v1");
    expect(REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES).toContain("hardware coming soon");
    expect(REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES).toContain("packing labels roadmap");
  });

  it("detects banned hardware roadmap phrases in sample copy", () => {
    const sample = auditRemoveHardwareRoadmapP125(ROOT);
    expect(sample.passed).toBe(true);

    const lower = "Q3 native terminal coming soon for all pilots".toLowerCase();
    expect(
      REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES.some((phrase) =>
        lower.includes(phrase.toLowerCase()),
      ),
    ).toBe(true);
  });

  it("passes full P1-25 marketing scan with zero banned phrase hits", () => {
    const summary = auditRemoveHardwareRoadmapP125(ROOT);
    expect(summary.sourcesScanned).toBeGreaterThan(50);
    expect(summary.passed).toBe(true);
    expect(summary.hits).toHaveLength(0);
  });

  it("forbidden claims cheat sheet documents hardware deferral not coming soon", () => {
    const cheatSheet = readSource("lib/marketing/forbidden-claims-cheat-sheet-content.ts");
    expect(cheatSheet).toContain("hardware-roadmap-deferred");
    expect(cheatSheet.toLowerCase()).not.toContain("hardware coming soon");
    expect(cheatSheet).toContain("deferred");
  });

  it("no-hardware positioning doc uses deferral language not hardware roadmap tease", () => {
    const doc = readSource("docs/no-hardware-lock-in-positioning.md");
    expect(doc.toLowerCase()).not.toContain("hardware coming soon");
    expect(doc).not.toContain("packing labels roadmap");
    expect(doc).toContain("deferred");
  });

  it("P1-25 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of REMOVE_HARDWARE_ROADMAP_P1_25_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${REMOVE_HARDWARE_ROADMAP_P1_25_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${REMOVE_HARDWARE_ROADMAP_P1_25_CI_NPM_SCRIPT}"`);

    const ci = readSource(REMOVE_HARDWARE_ROADMAP_P1_25_CI_WORKFLOW);
    expect(ci).toContain(REMOVE_HARDWARE_ROADMAP_P1_25_CHECK_NPM_SCRIPT);

    const doc = readSource(REMOVE_HARDWARE_ROADMAP_P1_25_DOC);
    expect(doc).toContain(REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID);
    expect(doc).toContain(REMOVE_HARDWARE_ROADMAP_P1_25_DEFERRAL_LINE);

    expect(existsSync(join(ROOT, REMOVE_HARDWARE_ROADMAP_P1_25_AUDIT_MODULE))).toBe(true);

    const artifact = JSON.parse(readSource(REMOVE_HARDWARE_ROADMAP_P1_25_ARTIFACT));
    expect(artifact.policyId).toBe(REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditRemoveHardwareRoadmapP125(ROOT);
    const lines = formatRemoveHardwareRoadmapP125AuditLines(summary);
    expect(lines.some((line) => line.includes(REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
