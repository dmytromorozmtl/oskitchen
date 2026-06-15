import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_DOC,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/beta-integration-env-readiness-smoke-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("beta integration env readiness smoke era17 CI certification (live repo)", () => {
  it("locks era17 env readiness smoke policy id", () => {
    expect(BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-beta-integration-env-readiness-smoke-v1",
    );
  });

  it("ships orchestrator script and summary artifact path", () => {
    expect(existsSync(join(ROOT, BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-beta-integration-env-readiness-summary.json",
    );
  });

  it("wires npm smoke and cert scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:beta-integration-env-readiness"]).toContain(
      "smoke-beta-integration-env-readiness-era17.ts",
    );
    expect(scripts["test:ci:beta-integration-env-readiness-era17:cert"]).toContain(
      "beta-integration-env-readiness-smoke",
    );
  });

  it("documents the env readiness smoke runbook", () => {
    expect(existsSync(join(ROOT, BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_DOC), "utf8");
    expect(doc).toContain(BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID);
    expect(doc).toContain("BETA_ENV_STRICT");
  });
});
