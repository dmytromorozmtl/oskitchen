import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_FAQ_SECTION,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PACK_DOC,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_QUESTIONNAIRE_SECTION,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_QUESTIONNAIRE_SSO_ANSWER,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_CONTRACT_FAQ,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_UNIT_TESTS,
  enterpriseSsoProcurementPackAvoidsForbiddenClaims,
  enterpriseSsoProcurementPackCoversRequiredMarkers,
} from "@/lib/enterprise/enterprise-sso-procurement-sync-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO procurement sync era17 CI certification (live repo)", () => {
  it("locks era17 enterprise SSO procurement sync policy id", () => {
    expect(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-procurement-sync-v1",
    );
  });

  it("defines era17 enterprise SSO procurement sync cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-procurement:cert"]).toContain(
      "enterprise-sso-procurement-sync-era17-cert-live",
    );
  });

  it("syncs procurement pack FAQ and questionnaire with pilot_foundation SSO", () => {
    const pack = readFileSync(join(ROOT, ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PACK_DOC), "utf8");
    expect(enterpriseSsoProcurementPackCoversRequiredMarkers(pack)).toBe(true);
    expect(enterpriseSsoProcurementPackAvoidsForbiddenClaims(pack)).toBe(true);
    expect(pack).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REVIEW_SECTION);
    expect(pack).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS);
    expect(pack).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_FAQ_SECTION);
    expect(pack).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_QUESTIONNAIRE_SECTION);
    expect(pack.toLowerCase()).toContain("qualified pilot only");
    expect(pack.toLowerCase()).toContain("awaiting_operator_proof");
    expect(pack.toLowerCase()).toContain(
      ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_CONTRACT_FAQ.toLowerCase().slice(0, 40),
    );
    for (const rel of ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_CANONICAL_DOC_PATHS) {
      if (rel === ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PACK_DOC) continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID);
    for (const rel of ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
