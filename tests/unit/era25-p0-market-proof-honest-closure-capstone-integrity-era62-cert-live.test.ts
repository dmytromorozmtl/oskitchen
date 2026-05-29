import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_CI_SCRIPTS,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_GOVERNANCE_BUNDLES_CERT_CHAIN,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_OPS_SCRIPTS,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_UNIT_TESTS,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62-policy";
import { ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-phases-era62";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 P0 market proof honest closure capstone integrity era62 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID).toBe(
      "era62-era25-p0-market-proof-honest-closure-capstone-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_OPS_SCRIPTS,
      ...ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains closure capstone cert into governance-bundles partition-platform", () => {
    const scripts = readPackageScripts();
    const partitionPlatform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    for (const chainScript of ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_GOVERNANCE_BUNDLES_CERT_CHAIN) {
      expect(partitionPlatform).toContain(chainScript);
    }
  });

  it("chains closure capstone cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-p0-market-proof-honest-closure-capstone-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC), "utf8");
    expect(doc).toContain("p0-market-proof-honest-closure-capstone");
    expect(doc).toContain("#era25-p0-market-proof-honest-closure-capstone");
    for (const path of ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
