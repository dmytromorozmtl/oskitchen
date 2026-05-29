import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_CANONICAL_DOC_PATHS,
  PILOT_WEEK1_EXECUTION_CI_SCRIPTS,
  PILOT_WEEK1_EXECUTION_HTML_ARTIFACT,
  PILOT_WEEK1_EXECUTION_OPS_SCRIPTS,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
  PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT,
  PILOT_WEEK1_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/pilot-week1-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot week1 execution orchestrator cert (live repo)", () => {
  it("locks era33 policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID).toBe("era33-pilot-week1-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [...PILOT_WEEK1_EXECUTION_OPS_SCRIPTS, ...PILOT_WEEK1_EXECUTION_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND).toContain("ops:run-pilot-week1-execution");
  });

  it("documents step 5 and step 6 playbooks", () => {
    for (const rel of PILOT_WEEK1_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/pilot-week1-execution-ui-era21.ts"), "utf8");
    expect(ui).toContain("week1ExecutionCommand");
    const panel = readFileSync(join(ROOT, "components/dashboard/pilot-week1-phases-panel.tsx"), "utf8");
    expect(panel).toContain("week1ExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/pilot-week1-execution-summary.json",
    );
    expect(PILOT_WEEK1_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/pilot-week1-execution-report.html",
    );
    for (const rel of PILOT_WEEK1_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
