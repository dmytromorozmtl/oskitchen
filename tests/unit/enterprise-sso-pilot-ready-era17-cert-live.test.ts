import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_MARKERS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_ORCHESTRATOR_SCRIPT,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT,
  ENTERPRISE_SSO_PILOT_READY_ERA17_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO pilot ready era17 CI certification (live repo)", () => {
  it("locks era17 SSO pilot_ready gate policy id", () => {
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-pilot-ready-v1",
    );
  });

  it("defines era17 SSO pilot_ready gate CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_PILOT_READY_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-idp-staging-era17:cert"]).toContain(
      "enterprise-sso-pilot-ready-era17-cert-live",
    );
    expect(scripts["smoke:enterprise-sso-pilot-ready-gate"]).toContain(
      "smoke-enterprise-sso-pilot-ready-gate-era17",
    );
  });

  it("documents era17 SSO pilot_ready gate in canonical docs", () => {
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_PILOT_READY_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID.toLowerCase());
    }
    const designDoc = readFileSync(join(ROOT, "docs/enterprise-sso-r2-pilot-design.md"), "utf8");
    expect(designDoc).toContain(ENTERPRISE_SSO_PILOT_READY_ERA17_REVIEW_SECTION);
    expect(designDoc).toContain(ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT);
    for (const marker of ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_MARKERS) {
      expect(designDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of ENTERPRISE_SSO_PILOT_READY_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
