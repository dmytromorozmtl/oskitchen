import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  P0_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS,
  P0_STAGING_PROOF_EXECUTION_CI_SCRIPTS,
  P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  P0_STAGING_PROOF_EXECUTION_OPS_SCRIPTS,
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  P0_STAGING_PROOF_EXECUTION_POLICY_ID,
  P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
  P0_STAGING_PROOF_EXECUTION_UNIT_TESTS,
} from "@/lib/ops/p0-staging-proof-execution-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("p0 staging proof execution cert (live repo)", () => {
  it("locks era30 policy id", () => {
    expect(P0_STAGING_PROOF_EXECUTION_POLICY_ID).toBe("era30-p0-staging-proof-execution-v1");
  });

  it("defines npm scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [...P0_STAGING_PROOF_EXECUTION_OPS_SCRIPTS, ...P0_STAGING_PROOF_EXECUTION_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND).toContain(
      "ops:run-p0-staging-proof-execution",
    );
  });

  it("documents step 2 and step 3 playbooks", () => {
    for (const rel of P0_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires product surfaces", () => {
    const ui = readFileSync(join(ROOT, "lib/commercial/p0-ops-vault-ui-era21.ts"), "utf8");
    expect(ui).toContain("p0ExecutionCommand");
    const panel = readFileSync(
      join(ROOT, "components/dashboard/p0-ops-vault-phases-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("p0ExecutionCommand");
  });

  it("declares execution artifacts", () => {
    expect(P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT).toBe(
      "artifacts/p0-staging-proof-execution-summary.json",
    );
    expect(P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT).toBe(
      "artifacts/p0-staging-proof-execution-report.html",
    );
    for (const rel of P0_STAGING_PROOF_EXECUTION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
