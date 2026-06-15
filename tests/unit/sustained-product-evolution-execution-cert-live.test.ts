import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CANONICAL_DOC_PATHS,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CI_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_OPS_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/sustained-product-evolution-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained product evolution execution cert (live repo)", () => {
  it("locks era39 policy id", () => {
    expect(SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID).toBe(
      "era39-sustained-product-evolution-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_OPS_SCRIPTS,
      ...SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-sustained-product-evolution-execution",
    );
  });

  it("documents step 11 and step 12 playbooks", () => {
    for (const rel of SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(
      join(ROOT, "lib/commercial/sustained-product-evolution-ui-era23.ts"),
      "utf8",
    );
    expect(ui).toContain("productEvolutionExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/sustained-product-evolution-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("productEvolutionExecutionCommand");
    const improvementLoopUi = readFileSync(
      join(ROOT, "lib/commercial/continuous-improvement-loop-ui-era22.ts"),
      "utf8",
    );
    expect(improvementLoopUi).toContain("productEvolutionExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/sustained-product-evolution-execution-summary.json",
    );
    expect(SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/sustained-product-evolution-execution-report.html",
    );
    for (const rel of SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
