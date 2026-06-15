import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_SCALE_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS,
  PILOT_SCALE_EXPANSION_EXECUTION_CI_SCRIPTS,
  PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT,
  PILOT_SCALE_EXPANSION_EXECUTION_OPS_SCRIPTS,
  PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID,
  PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
  PILOT_SCALE_EXPANSION_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/pilot-scale-expansion-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot scale expansion execution cert (live repo)", () => {
  it("locks era34 policy id", () => {
    expect(PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID).toBe(
      "era34-pilot-scale-expansion-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PILOT_SCALE_EXPANSION_EXECUTION_OPS_SCRIPTS,
      ...PILOT_SCALE_EXPANSION_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-pilot-scale-expansion-execution",
    );
  });

  it("documents step 6 and step 7 playbooks", () => {
    for (const rel of PILOT_SCALE_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/scale-readiness-ui-era21.ts"), "utf8");
    expect(ui).toContain("scaleExpansionExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/scale-readiness-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("scaleExpansionExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/pilot-scale-expansion-execution-summary.json",
    );
    expect(PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/pilot-scale-expansion-execution-report.html",
    );
    for (const rel of PILOT_SCALE_EXPANSION_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
