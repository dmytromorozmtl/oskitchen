import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("live integration dod smoke era17 CI certification (live repo)", () => {
  it("locks era17 live integration dod smoke policy id", () => {
    expect(LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-live-integration-dod-smoke-v1",
    );
  });

  it("ships orchestrator script and summary artifact path", () => {
    expect(existsSync(join(ROOT, LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-live-integration-dod-summary.json",
    );
  });

  it("wires npm smoke and cert scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:live-integration-dod"]).toContain(
      "smoke-live-integration-dod-era17.ts",
    );
    expect(scripts["test:ci:live-integration-dod-era17:cert"]).toContain(
      "live-integration-dod-smoke",
    );
  });

  it("documents the live dod smoke runbook", () => {
    expect(existsSync(join(ROOT, LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC), "utf8");
    expect(doc).toContain(LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID);
    expect(doc).toContain("G3/G4");
  });

  it("is wired into P0 orchestrator workflow", () => {
    const workflow = readFileSync(join(ROOT, ".github/workflows/p0-orchestrator.yml"), "utf8");
    expect(workflow).toContain("smoke:live-integration-dod");
  });
});
