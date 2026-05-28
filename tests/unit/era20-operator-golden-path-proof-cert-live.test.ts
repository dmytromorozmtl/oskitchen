import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_DOC_PATHS,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_MARKERS,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_CI_SCRIPTS,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_DOC,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_MODULE,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_REQUIRED_SECTIONS,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_REVIEW_SECTION,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_UNIT_TESTS,
} from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era20 operator golden path proof CI certification (live repo)", () => {
  it("locks era20 golden path proof policy id", () => {
    expect(ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID).toBe(
      "era20-operator-golden-path-proof-v1",
    );
  });

  it("defines era20 golden path proof cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ERA20_OPERATOR_GOLDEN_PATH_PROOF_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "era20-operator-golden-path-proof-cert-live",
    );
  });

  it("documents era20 golden path proof in canonical docs", () => {
    expect(existsSync(join(ROOT, ERA20_OPERATOR_GOLDEN_PATH_PROOF_MODULE))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA20_OPERATOR_GOLDEN_PATH_PROOF_DOC), "utf8");
    for (const section of ERA20_OPERATOR_GOLDEN_PATH_PROOF_REQUIRED_SECTIONS) {
      expect(doc, section).toContain(section);
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ERA20_OPERATOR_GOLDEN_PATH_PROOF_REVIEW_SECTION);
    for (const marker of ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of ERA20_OPERATOR_GOLDEN_PATH_PROOF_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(readFileSync(join(ROOT, "components/dashboard/launch-wizard/launch-wizard-view.tsx"), "utf8")).toContain(
      "LaunchWizardGoldenPathPanel",
    );
  });
});
