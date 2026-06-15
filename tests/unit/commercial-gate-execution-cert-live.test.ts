import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_GATE_EXECUTION_CANONICAL_DOC_PATHS,
  COMMERCIAL_GATE_EXECUTION_CI_SCRIPTS,
  COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_GATE_EXECUTION_OPS_SCRIPTS,
  COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND,
  COMMERCIAL_GATE_EXECUTION_POLICY_ID,
  COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT,
  COMMERCIAL_GATE_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/commercial-gate-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial gate execution cert (live repo)", () => {
  it("locks era32 policy id", () => {
    expect(COMMERCIAL_GATE_EXECUTION_POLICY_ID).toBe("era32-commercial-gate-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_GATE_EXECUTION_OPS_SCRIPTS,
      ...COMMERCIAL_GATE_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-commercial-gate-execution",
    );
  });

  it("documents step 4 and step 5 playbooks", () => {
    for (const rel of COMMERCIAL_GATE_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/commercial-go-closure-ui-era21.ts"), "utf8");
    expect(ui).toContain("commercialGateExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/commercial-go-closure-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("commercialGateExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/commercial-gate-execution-summary.json",
    );
    expect(COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/commercial-gate-execution-report.html",
    );
    for (const rel of COMMERCIAL_GATE_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
