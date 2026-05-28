import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CANONICAL_MARKERS,
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CI_SCRIPTS,
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_DOC,
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_REVIEW_SECTION,
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_UNIT_TESTS,
} from "@/lib/integrations/integration-health-trust-layer-era20-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("integration health trust layer era20 CI certification (live repo)", () => {
  it("defines era20 trust layer cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:integration-health-smoke-artifacts-era19"]).toContain(
      "integration-health-trust-layer-era20",
    );
  });

  it("documents trust layer in canonical docs and wires UI", () => {
    const doc = readFileSync(join(ROOT, INTEGRATION_HEALTH_TRUST_LAYER_ERA20_DOC), "utf8");
    expect(doc).toContain("P0 trust banner");
    expect(doc).toContain("fake green");
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(INTEGRATION_HEALTH_TRUST_LAYER_ERA20_REVIEW_SECTION);
    for (const marker of INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const page = readFileSync(join(ROOT, "app/dashboard/integration-health/page.tsx"), "utf8");
    expect(page).toContain("IntegrationHealthP0TrustBannerPanel");
    for (const rel of INTEGRATION_HEALTH_TRUST_LAYER_ERA20_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
