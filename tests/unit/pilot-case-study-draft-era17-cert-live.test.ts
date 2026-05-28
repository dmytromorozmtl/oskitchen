import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_DOC_PATHS,
  PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_MARKERS,
  PILOT_CASE_STUDY_DRAFT_ERA17_CI_SCRIPTS,
  PILOT_CASE_STUDY_DRAFT_ERA17_DOC,
  PILOT_CASE_STUDY_DRAFT_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID,
  PILOT_CASE_STUDY_DRAFT_ERA17_REQUIRED_SECTIONS,
  PILOT_CASE_STUDY_DRAFT_ERA17_REVIEW_SECTION,
  PILOT_CASE_STUDY_DRAFT_ERA17_UNIT_TESTS,
} from "@/lib/commercial/pilot-case-study-draft-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot case study draft era17 CI certification (live repo)", () => {
  it("locks era17 pilot case study draft policy id", () => {
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID).toBe("era17-pilot-case-study-draft-v1");
  });

  it("defines era17 pilot case study draft scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pilot-case-study-draft"]).toContain(
      PILOT_CASE_STUDY_DRAFT_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PILOT_CASE_STUDY_DRAFT_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:competitor-feature-gap-matrix-era17:cert"]).toContain(
      "pilot-case-study-draft-era17-cert-live",
    );
  });

  it("wires orchestrator and case study draft doc", () => {
    expect(existsSync(join(ROOT, PILOT_CASE_STUDY_DRAFT_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_CASE_STUDY_DRAFT_ERA17_DOC))).toBe(true);
  });

  it("documents era17 pilot case study draft in canonical docs", () => {
    const doc = readFileSync(join(ROOT, PILOT_CASE_STUDY_DRAFT_ERA17_DOC), "utf8");
    for (const section of PILOT_CASE_STUDY_DRAFT_ERA17_REQUIRED_SECTIONS) {
      expect(doc, section).toContain(section);
    }
    for (const rel of PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_DOC_PATHS) {
      if (rel === PILOT_CASE_STUDY_DRAFT_ERA17_DOC) continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_CASE_STUDY_DRAFT_ERA17_REVIEW_SECTION);
    for (const marker of PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID);
    for (const rel of PILOT_CASE_STUDY_DRAFT_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
  });
});
