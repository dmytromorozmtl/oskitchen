import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_CI_SCRIPTS,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_GOVERNANCE_BUNDLES_CERT_CHAIN,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_OPS_SCRIPTS,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_UNIT_TESTS,
} from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64-policy";
import { ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC } from "@/lib/commercial/era25-governance-train-terminal-seal-phases-era64";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 governance train terminal seal integrity era64 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID).toBe(
      "era64-era25-governance-train-terminal-seal-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_OPS_SCRIPTS,
      ...ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains seal cert into governance-bundles partition-platform", () => {
    const scripts = readPackageScripts();
    const partitionPlatform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    for (const chainScript of ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_GOVERNANCE_BUNDLES_CERT_CHAIN) {
      expect(partitionPlatform).toContain(chainScript);
    }
  });

  it("chains seal cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-governance-train-terminal-seal-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC), "utf8");
    expect(doc).toContain("governance-train-terminal-seal");
    expect(doc).toContain("#era25-governance-train-terminal-seal");
    for (const path of ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
