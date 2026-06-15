import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REQUIRED_SECTIONS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-operator-runbook-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO operator runbook era17 CI certification (live repo)", () => {
  it("locks era17 enterprise SSO operator runbook policy id", () => {
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-operator-runbook-v1",
    );
  });

  it("defines era17 enterprise SSO operator runbook scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:enterprise-sso-operator-runbook"]).toContain(
      ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-idp-staging-era17:cert"]).toContain(
      "enterprise-sso-operator-runbook-era17-cert-live",
    );
  });

  it("wires orchestrator and operator doc", () => {
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC))).toBe(true);
  });

  it("documents era17 enterprise SSO operator runbook in canonical docs", () => {
    const doc = readFileSync(join(ROOT, ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC), "utf8");
    for (const section of ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REQUIRED_SECTIONS) {
      expect(doc, section).toContain(section);
    }
    for (const step of ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS) {
      expect(doc).toContain(step.split("→")[0]?.trim() ?? step);
    }
    for (const rel of ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS) {
      if (rel === ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC) continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID);
    for (const rel of ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
  });
});
