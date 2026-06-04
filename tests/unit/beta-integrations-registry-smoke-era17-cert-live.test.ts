import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_DOC,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/beta-integrations-registry-smoke-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("beta integrations registry smoke era17 CI certification (live repo)", () => {
  it("locks era17 beta integrations registry smoke policy id", () => {
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-beta-integrations-registry-smoke-v1",
    );
  });

  it("ships orchestrator script and summary artifact path", () => {
    expect(existsSync(join(ROOT, BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-beta-integrations-registry-summary.json",
    );
  });

  it("wires npm smoke and cert scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:beta-integrations-registry"]).toContain(
      "smoke-beta-integrations-registry-era17.ts",
    );
    expect(scripts["test:ci:beta-integrations-registry-era17:cert"]).toContain(
      "beta-integrations-registry-smoke",
    );
  });

  it("documents the smoke runbook", () => {
    expect(existsSync(join(ROOT, BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_DOC), "utf8");
    expect(doc).toContain(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID);
    expect(doc).toContain("eighteen");
  });
});
