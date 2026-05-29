import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TIER2_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS,
  TIER2_STAGING_PROOF_EXECUTION_CI_SCRIPTS,
  TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  TIER2_STAGING_PROOF_EXECUTION_OPS_SCRIPTS,
  TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
  TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
  TIER2_STAGING_PROOF_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/tier2-staging-proof-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("tier2 staging proof execution cert (live repo)", () => {
  it("locks era31 policy id", () => {
    expect(TIER2_STAGING_PROOF_EXECUTION_POLICY_ID).toBe("era31-tier2-staging-proof-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...TIER2_STAGING_PROOF_EXECUTION_OPS_SCRIPTS,
      ...TIER2_STAGING_PROOF_EXECUTION_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-tier2-staging-proof-execution",
    );
  });

  it("documents step 3 and step 4 playbooks", () => {
    for (const rel of TIER2_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/tier2-staging-golden-path-ui-era21.ts"), "utf8");
    expect(ui).toContain("tier2ExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/tier2-golden-path-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("tier2ExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/tier2-staging-proof-execution-summary.json",
    );
    expect(TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/tier2-staging-proof-execution-report.html",
    );
    for (const rel of TIER2_STAGING_PROOF_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
