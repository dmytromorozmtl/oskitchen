import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CANONICAL_DOC_PATHS,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CI_SCRIPTS,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_OPS_SCRIPTS,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_ORCHESTRATOR_COMMAND,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/steady-state-operator-loop-lock-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("steady-state operator loop lock execution cert (live repo)", () => {
  it("locks era43 policy id", () => {
    expect(STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID).toBe(
      "era43-steady-state-operator-loop-lock-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_OPS_SCRIPTS,
      ...STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-steady-state-operator-loop-lock-execution",
    );
  });

  it("documents step 15 and step 16 playbooks", () => {
    for (const rel of STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const steadyStateUi = readFileSync(
      join(ROOT, "lib/commercial/post-terminus-steady-state-ui-era24.ts"),
      "utf8",
    );
    expect(steadyStateUi).toContain("steadyStateOperatorLoopLockExecutionCommand");
    const engineeringUi = readFileSync(
      join(ROOT, "lib/commercial/engineering-path-terminus-ui-era24.ts"),
      "utf8",
    );
    expect(engineeringUi).toContain("steadyStateOperatorLoopLockExecutionCommand");
    const maintenanceUi = readFileSync(
      join(ROOT, "lib/commercial/maintenance-mode-ui-era24.ts"),
      "utf8",
    );
    expect(maintenanceUi).toContain("steadyStateOperatorLoopLockExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/maintenance-mode-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("steadyStateOperatorLoopLockExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/steady-state-operator-loop-lock-execution-summary.json",
    );
    expect(STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/steady-state-operator-loop-lock-execution-report.html",
    );
    for (const rel of STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
