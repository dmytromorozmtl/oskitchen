import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_CANONICAL_DOC_PATHS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_CI_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_OPS_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_ORCHESTRATOR_COMMAND,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/commercial-pilot-path-absolute-end-lock-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial pilot path absolute end lock execution cert (live repo)", () => {
  it("locks era44 policy id", () => {
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID).toBe(
      "era44-commercial-pilot-path-absolute-end-lock-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_OPS_SCRIPTS,
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-commercial-pilot-path-absolute-end-lock-execution",
    );
  });

  it("documents step 16 and step 17 playbooks", () => {
    for (const rel of COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const absoluteEndUi = readFileSync(
      join(ROOT, "lib/commercial/commercial-pilot-path-absolute-end-ui-era24.ts"),
      "utf8",
    );
    expect(absoluteEndUi).toContain("commercialPilotPathAbsoluteEndLockExecutionCommand");
    const steadyStateUi = readFileSync(
      join(ROOT, "lib/commercial/post-terminus-steady-state-ui-era24.ts"),
      "utf8",
    );
    expect(steadyStateUi).toContain("commercialPilotPathAbsoluteEndLockExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/maintenance/maintenance-guardrails-footer.tsx"),
      "utf8",
    );
    expect(panel).toContain("commercialPilotPathAbsoluteEndLockExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/commercial-pilot-path-absolute-end-lock-execution-summary.json",
    );
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/commercial-pilot-path-absolute-end-lock-execution-report.html",
    );
    for (const rel of COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
