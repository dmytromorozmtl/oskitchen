import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_CI_SCRIPTS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_OPS_SCRIPTS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_UNIT_TESTS,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55-policy";
import { ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-phases-era25";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 commercial pilot convergence train closure integrity era55 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID).toBe(
      "era55-era25-commercial-pilot-convergence-train-closure-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_OPS_SCRIPTS,
      ...ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains train closure cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-commercial-pilot-convergence-train-closure-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC), "utf8");
    expect(doc).toContain("era25-commercial-pilot-convergence-train-closure");
    expect(doc).toContain("#era25-commercial-pilot-convergence-train-closure");
    for (const path of ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
