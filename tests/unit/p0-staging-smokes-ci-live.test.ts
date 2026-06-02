import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  P0_STAGING_SMOKES_ALWAYS_ON_SCRIPTS,
  P0_STAGING_SMOKES_CANONICAL_DOC_PATHS,
  P0_STAGING_SMOKES_CI_POLICY_ID,
  P0_STAGING_SMOKES_ORCHESTRATOR_SCRIPT,
  P0_STAGING_SMOKES_REQUIRED_SECRETS,
} from "@/lib/ci/p0-staging-smokes-ci-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

const REQUIRED_SCRIPTS = [
  "test:ci:p0-staging-proof-unblock-era17",
  "smoke:p0-staging-proof-unblock",
  "test:ci:p0-staging-smokes:policy",
  "test:ci:p0-staging-smokes:cert",
  "ops:validate-p0-vault-env",
] as const;

const POLICY_MODULE = join(ROOT, "lib/ci/p0-staging-smokes-ci-policy.ts");
const POLICY_SCRIPT = join(ROOT, "scripts/p0-staging-smokes-ci-policy.ts");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function extractJobBlock(workflow: string, jobName: string): string {
  const marker = `${jobName}:`;
  const start = workflow.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = workflow.slice(start + marker.length);
  const nextJob = rest.search(/\n  [a-z][a-z0-9-]+:\n/);
  return nextJob === -1 ? rest : rest.slice(0, nextJob);
}

describe("P0 staging smokes CI certification (live repo)", () => {
  it("defines npm scripts for policy unit gate, optional smokes, and wiring cert", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:p0-staging-smokes:policy"]).toContain(
      "p0-staging-smokes-ci-policy.ts",
    );
    expect(P0_STAGING_SMOKES_ALWAYS_ON_SCRIPTS.every((name) => scripts[name])).toBe(true);
    expect(scripts[P0_STAGING_SMOKES_ORCHESTRATOR_SCRIPT]).toContain(
      "smoke-p0-staging-proof-unblock-era17",
    );
  });

  it("requires all 11 P0 vault secrets for optional staging smokes tier", () => {
    expect(P0_STAGING_SMOKES_REQUIRED_SECRETS).toHaveLength(11);
  });

  it("wires p0-staging-smokes job with always-on policy gate and explicit smoke policy", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const job = extractJobBlock(workflow, "p0-staging-smokes");

    expect(job).toContain("test:ci:p0-staging-proof-unblock-era17");
    expect(job).toContain("smoke:p0-staging-proof-unblock");
    expect(job).toContain("test:ci:p0-staging-smokes:policy");
    expect(job).toContain("id: p0_staging_smokes");
    expect(job).toContain("P0_STAGING_SMOKES_STEP_OUTCOME");
    expect(job).toContain("p0-staging-smokes-summary");
    expect(job).toContain("ops:validate-p0-vault-env");
    for (const secret of P0_STAGING_SMOKES_REQUIRED_SECRETS) {
      expect(job).toContain(secret);
    }
  });

  it("documents P0 staging smokes tier and required policy artifacts exist", () => {
    expect(existsSync(POLICY_MODULE)).toBe(true);
    expect(existsSync(POLICY_SCRIPT)).toBe(true);

    for (const rel of P0_STAGING_SMOKES_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      expect(text).toContain(P0_STAGING_SMOKES_CI_POLICY_ID);
      expect(text).toContain("p0-staging-smokes");
    }
  });
});
