import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_CI_SCRIPTS,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_GOVERNANCE_BUNDLES_CERT_CHAIN,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_OPS_SCRIPTS,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_UNIT_TESTS,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61-policy";
import { ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-phases-era61";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 Band A market proof execution sole-path integrity era61 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID).toBe(
      "era61-era25-band-a-market-proof-execution-sole-path-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_OPS_SCRIPTS,
      ...ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains sole-path cert into governance-bundles partition-platform", () => {
    const scripts = readPackageScripts();
    const partitionPlatform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    for (const chainScript of ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_GOVERNANCE_BUNDLES_CERT_CHAIN) {
      expect(partitionPlatform).toContain(chainScript);
    }
  });

  it("chains sole-path cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-band-a-market-proof-execution-sole-path-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC), "utf8");
    expect(doc).toContain("band-a-market-proof-execution-sole-path");
    expect(doc).toContain("#era25-band-a-market-proof-execution-sole-path");
    for (const path of ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
