import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA17_ERA18_HANDOFF_BLENDED_SCORE,
  ERA17_ERA18_HANDOFF_CANONICAL_DOC_PATHS,
  ERA17_ERA18_HANDOFF_CI_SCRIPTS,
  ERA17_ERA18_HANDOFF_DOC,
  ERA17_ERA18_HANDOFF_POLICY_ID,
  ERA17_ERA18_HANDOFF_REQUIRED_SECTIONS,
  ERA17_ERA18_HANDOFF_REVIEW_SECTION,
  ERA17_ERA18_HANDOFF_SUCCESS_CRITERIA_MET,
  ERA17_ERA18_HANDOFF_UNIT_TESTS,
} from "@/lib/governance/era17-era18-handoff-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era17 era18 handoff CI certification (live repo)", () => {
  it("locks era17 era18 handoff policy id", () => {
    expect(ERA17_ERA18_HANDOFF_POLICY_ID).toBe("era17-era18-handoff-input-v1");
    expect(ERA17_ERA18_HANDOFF_SUCCESS_CRITERIA_MET).toBe(false);
  });

  it("defines era17 era18 handoff scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ERA17_ERA18_HANDOFF_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:scorecard:cert"]).toContain("era17-era18-handoff-cert-live");
  });

  it("requires era18 handoff doc on disk", () => {
    expect(existsSync(join(ROOT, ERA17_ERA18_HANDOFF_DOC))).toBe(true);
    expect(existsSync(join(ROOT, "lib/governance/era17-era18-handoff-policy.ts"))).toBe(true);
  });

  it("documents era17 era18 handoff in canonical docs", () => {
    const handoff = readFileSync(join(ROOT, ERA17_ERA18_HANDOFF_DOC), "utf8");
    for (const section of ERA17_ERA18_HANDOFF_REQUIRED_SECTIONS) {
      expect(handoff, section).toContain(section);
    }
    expect(handoff).toContain(String(ERA17_ERA18_HANDOFF_BLENDED_SCORE));
    expect(handoff).toContain("NOT MET");

    for (const rel of ERA17_ERA18_HANDOFF_CANONICAL_DOC_PATHS) {
      if (rel === ERA17_ERA18_HANDOFF_DOC) continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ERA17_ERA18_HANDOFF_POLICY_ID.toLowerCase());
    }

    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ERA17_ERA18_HANDOFF_REVIEW_SECTION);

    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ERA17_ERA18_HANDOFF_POLICY_ID);
    expect(index).toContain("next-master-prompt-input-2026-05-28-era18.md");

    for (const rel of ERA17_ERA18_HANDOFF_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
  });
});
