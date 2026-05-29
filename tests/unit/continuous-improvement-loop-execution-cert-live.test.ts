import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CANONICAL_DOC_PATHS,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CI_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_OPS_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/continuous-improvement-loop-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("continuous improvement loop execution cert (live repo)", () => {
  it("locks era40 policy id", () => {
    expect(CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID).toBe(
      "era40-continuous-improvement-loop-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_OPS_SCRIPTS,
      ...CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-continuous-improvement-loop-execution",
    );
  });

  it("documents step 12 and step 13 playbooks", () => {
    for (const rel of CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(
      join(ROOT, "lib/commercial/continuous-improvement-loop-ui-era22.ts"),
      "utf8",
    );
    expect(ui).toContain("ciLoopExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/continuous-improvement-loop-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("ciLoopExecutionCommand");
    const maintenanceUi = readFileSync(
      join(ROOT, "lib/commercial/maintenance-mode-ui-era24.ts"),
      "utf8",
    );
    expect(maintenanceUi).toContain("ciLoopExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/continuous-improvement-loop-execution-summary.json",
    );
    expect(CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/continuous-improvement-loop-execution-report.html",
    );
    for (const rel of CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
