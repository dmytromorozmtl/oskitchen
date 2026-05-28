import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS,
  POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_MARKERS,
  POS_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS,
  POS_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  POS_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT,
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  POS_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION,
  POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_MODULE,
  POS_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS,
} from "@/lib/pos/pos-operator-runbook-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("POS operator runbook era17 CI certification (live repo)", () => {
  it("locks era17 POS operator runbook policy id", () => {
    expect(POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID).toBe("era17-pos-operator-runbook-v1");
  });

  it("defines era17 POS operator runbook scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pos-operator-runbook"]).toContain(
      POS_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of POS_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:cert"]).toContain(
      "pos-operator-runbook-era17-cert-live",
    );
  });

  it("wires summary module and operator doc", () => {
    expect(existsSync(join(ROOT, POS_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC))).toBe(true);
    expect(existsSync(join(ROOT, POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, POS_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
  });

  it("documents era17 POS operator runbook in canonical docs", () => {
    for (const rel of POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(POS_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION);
    for (const marker of POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID);
    for (const rel of POS_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
