import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CANONICAL_DOC_PATHS,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CI_SCRIPTS,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_OPS_SCRIPTS,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/production-pilot-ready-closure-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production pilot ready closure execution cert (live repo)", () => {
  it("locks era42 policy id", () => {
    expect(PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID).toBe(
      "era42-production-pilot-ready-closure-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_OPS_SCRIPTS,
      ...PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-production-pilot-ready-closure-execution",
    );
  });

  it("documents step 14 and step 15 playbooks", () => {
    for (const rel of PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const maintenanceUi = readFileSync(
      join(ROOT, "lib/commercial/maintenance-mode-ui-era24.ts"),
      "utf8",
    );
    expect(maintenanceUi).toContain("productionPilotReadyClosureExecutionCommand");
    const engineeringUi = readFileSync(
      join(ROOT, "lib/commercial/engineering-path-terminus-ui-era24.ts"),
      "utf8",
    );
    expect(engineeringUi).toContain("productionPilotReadyClosureExecutionCommand");
    const steadyStateUi = readFileSync(
      join(ROOT, "lib/commercial/post-terminus-steady-state-ui-era24.ts"),
      "utf8",
    );
    expect(steadyStateUi).toContain("productionPilotReadyClosureExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/maintenance-mode-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("productionPilotReadyClosureExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/production-pilot-ready-closure-execution-summary.json",
    );
    expect(PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/production-pilot-ready-closure-execution-report.html",
    );
    for (const rel of PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
