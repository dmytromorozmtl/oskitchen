import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRODUCTION_GA_EXECUTION_CANONICAL_DOC_PATHS,
  PRODUCTION_GA_EXECUTION_CI_SCRIPTS,
  PRODUCTION_GA_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_GA_EXECUTION_OPS_SCRIPTS,
  PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_GA_EXECUTION_POLICY_ID,
  PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT,
  PRODUCTION_GA_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/production-ga-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production ga execution cert (live repo)", () => {
  it("locks era35 policy id", () => {
    expect(PRODUCTION_GA_EXECUTION_POLICY_ID).toBe("era35-production-ga-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PRODUCTION_GA_EXECUTION_OPS_SCRIPTS,
      ...PRODUCTION_GA_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-production-ga-execution",
    );
  });

  it("documents step 7 and step 8 playbooks", () => {
    for (const rel of PRODUCTION_GA_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(
      join(ROOT, "lib/commercial/series-a-partner-expansion-ui-era21.ts"),
      "utf8",
    );
    expect(ui).toContain("productionGaExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/series-a-partner-expansion-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("productionGaExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/production-ga-execution-summary.json",
    );
    expect(PRODUCTION_GA_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/production-ga-execution-report.html",
    );
    for (const rel of PRODUCTION_GA_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
