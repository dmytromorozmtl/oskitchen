import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_CI_SCRIPTS,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_GOVERNANCE_BUNDLES_CERT_CHAIN,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_OPS_SCRIPTS,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_UNIT_TESTS,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66-policy";
import { ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-phases-era66";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 Band A governance chain capstone witness integrity era66 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID).toBe(
      "era66-era25-band-a-governance-chain-capstone-witness-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_OPS_SCRIPTS,
      ...ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains capstone witness cert into governance-bundles partition-platform", () => {
    const scripts = readPackageScripts();
    const partitionPlatform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    for (const chainScript of ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_GOVERNANCE_BUNDLES_CERT_CHAIN) {
      expect(partitionPlatform).toContain(chainScript);
    }
  });

  it("chains capstone witness cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-band-a-governance-chain-capstone-witness-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC), "utf8");
    expect(doc).toContain("band-a-governance-chain-capstone-witness");
    expect(doc).toContain("#era25-band-a-governance-chain-capstone-witness");
    for (const path of ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
