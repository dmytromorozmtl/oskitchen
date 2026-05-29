import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAINTENANCE_MODE_EXECUTION_CANONICAL_DOC_PATHS,
  MAINTENANCE_MODE_EXECUTION_CI_SCRIPTS,
  MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT,
  MAINTENANCE_MODE_EXECUTION_OPS_SCRIPTS,
  MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND,
  MAINTENANCE_MODE_EXECUTION_POLICY_ID,
  MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT,
  MAINTENANCE_MODE_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/maintenance-mode-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("maintenance mode execution cert (live repo)", () => {
  it("locks era41 policy id", () => {
    expect(MAINTENANCE_MODE_EXECUTION_POLICY_ID).toBe("era41-maintenance-mode-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MAINTENANCE_MODE_EXECUTION_OPS_SCRIPTS,
      ...MAINTENANCE_MODE_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-maintenance-mode-execution",
    );
  });

  it("documents step 13 and step 14 playbooks", () => {
    for (const rel of MAINTENANCE_MODE_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/maintenance-mode-ui-era24.ts"), "utf8");
    expect(ui).toContain("maintenanceModeExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/maintenance-mode-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("maintenanceModeExecutionCommand");
    const engineeringUi = readFileSync(
      join(ROOT, "lib/commercial/engineering-path-terminus-ui-era24.ts"),
      "utf8",
    );
    expect(engineeringUi).toContain("maintenanceModeExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/maintenance-mode-execution-summary.json",
    );
    expect(MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/maintenance-mode-execution-report.html",
    );
    for (const rel of MAINTENANCE_MODE_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
