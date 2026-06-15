import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CANONICAL_DOC_PATHS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CI_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_OPS_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/sustained-operational-excellence-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained operational excellence execution cert (live repo)", () => {
  it("locks era38 policy id", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID).toBe(
      "era38-sustained-operational-excellence-execution-v1",
    );
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_OPS_SCRIPTS,
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-sustained-operational-excellence-execution",
    );
  });

  it("documents step 10 and step 11 playbooks", () => {
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(
      join(ROOT, "lib/commercial/sustained-operational-excellence-ui-era21.ts"),
      "utf8",
    );
    expect(ui).toContain("sustainedOpsExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/sustained-operational-excellence-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("sustainedOpsExecutionCommand");
    const productEvolutionUi = readFileSync(
      join(ROOT, "lib/commercial/sustained-product-evolution-ui-era23.ts"),
      "utf8",
    );
    expect(productEvolutionUi).toContain("sustainedOpsExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/sustained-operational-excellence-execution-summary.json",
    );
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/sustained-operational-excellence-execution-report.html",
    );
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
