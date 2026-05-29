import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKET_LEADER_POSITIONING_EXECUTION_CANONICAL_DOC_PATHS,
  MARKET_LEADER_POSITIONING_EXECUTION_CI_SCRIPTS,
  MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT,
  MARKET_LEADER_POSITIONING_EXECUTION_OPS_SCRIPTS,
  MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND,
  MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
  MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT,
  MARKET_LEADER_POSITIONING_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/market-leader-positioning-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("market leader positioning execution cert (live repo)", () => {
  it("locks era37 policy id", () => {
    expect(MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID).toBe(
      "era37-market-leader-positioning-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MARKET_LEADER_POSITIONING_EXECUTION_OPS_SCRIPTS,
      ...MARKET_LEADER_POSITIONING_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-market-leader-positioning-execution",
    );
  });

  it("documents step 9 and step 10 playbooks", () => {
    for (const rel of MARKET_LEADER_POSITIONING_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(
      join(ROOT, "lib/commercial/market-leader-positioning-ui-era21.ts"),
      "utf8",
    );
    expect(ui).toContain("marketLeaderExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/market-leader-positioning-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("marketLeaderExecutionCommand");
    const sustainedUi = readFileSync(
      join(ROOT, "lib/commercial/sustained-operational-excellence-ui-era21.ts"),
      "utf8",
    );
    expect(sustainedUi).toContain("marketLeaderExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/market-leader-positioning-execution-summary.json",
    );
    expect(MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/market-leader-positioning-execution-report.html",
    );
    for (const rel of MARKET_LEADER_POSITIONING_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
