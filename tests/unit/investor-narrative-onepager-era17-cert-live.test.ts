import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_DOC_PATHS,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_MARKERS,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_CI_SCRIPTS,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_DOC,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_ORCHESTRATOR_SCRIPT,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_REQUIRED_SECTIONS,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_REVIEW_SECTION,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_UNIT_TESTS,
} from "@/lib/commercial/investor-narrative-onepager-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("investor narrative onepager era17 CI certification (live repo)", () => {
  it("locks era17 investor narrative onepager policy id", () => {
    expect(INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID).toBe(
      "era17-investor-narrative-onepager-v2-v1",
    );
  });

  it("defines era17 investor narrative onepager scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:investor-narrative-onepager"]).toContain(
      INVESTOR_NARRATIVE_ONEPAGER_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of INVESTOR_NARRATIVE_ONEPAGER_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pilot-metrics-baseline-era17:cert"]).toContain(
      "investor-narrative-onepager-era17-cert-live",
    );
  });

  it("documents era17 investor narrative onepager in canonical docs", () => {
    expect(existsSync(join(ROOT, INVESTOR_NARRATIVE_ONEPAGER_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    const onepager = readFileSync(join(ROOT, INVESTOR_NARRATIVE_ONEPAGER_ERA17_DOC), "utf8");
    for (const section of INVESTOR_NARRATIVE_ONEPAGER_ERA17_REQUIRED_SECTIONS) {
      expect(onepager, section).toContain(section);
    }
    for (const rel of INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(INVESTOR_NARRATIVE_ONEPAGER_ERA17_REVIEW_SECTION);
    for (const marker of INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID);
    for (const rel of INVESTOR_NARRATIVE_ONEPAGER_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
