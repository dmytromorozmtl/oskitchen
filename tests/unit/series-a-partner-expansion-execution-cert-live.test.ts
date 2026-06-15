import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SERIES_A_PARTNER_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_CI_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_OPS_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/series-a-partner-expansion-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("series a partner expansion execution cert (live repo)", () => {
  it("locks era36 policy id", () => {
    expect(SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID).toBe(
      "era36-series-a-partner-expansion-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SERIES_A_PARTNER_EXPANSION_EXECUTION_OPS_SCRIPTS,
      ...SERIES_A_PARTNER_EXPANSION_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-series-a-partner-expansion-execution",
    );
  });

  it("documents step 8 and step 9 playbooks", () => {
    for (const rel of SERIES_A_PARTNER_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const seriesAUi = readFileSync(
      join(ROOT, "lib/commercial/series-a-partner-expansion-ui-era21.ts"),
      "utf8",
    );
    expect(seriesAUi).toContain("seriesAExpansionExecutionCommand");
    const seriesAPanel = readFileSync(
      join(ROOT, "components/dashboard/series-a-partner-expansion-phases-panel.tsx"),
      "utf8",
    );
    expect(seriesAPanel).toContain("seriesAExpansionExecutionCommand");
    const marketLeaderUi = readFileSync(
      join(ROOT, "lib/commercial/market-leader-positioning-ui-era21.ts"),
      "utf8",
    );
    expect(marketLeaderUi).toContain("seriesAExpansionExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/series-a-partner-expansion-execution-summary.json",
    );
    expect(SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/series-a-partner-expansion-execution-report.html",
    );
    for (const rel of SERIES_A_PARTNER_EXPANSION_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
