import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_CI_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_OPS_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_UNIT_TESTS,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56-policy";
import { SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC } from "@/lib/commercial/sustained-product-evolution-re-entrant-phases-era56";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained product evolution re-entrant integrity era56 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID).toBe(
      "era56-sustained-product-evolution-re-entrant-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_OPS_SCRIPTS,
      ...SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains re-entrant cert into commercial-pilot-runbook cert", () => {
    const scripts = readPackageScripts();
    const runbookCert = scripts["test:ci:commercial-pilot-runbook:cert"] ?? "";
    for (const chainScript of SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN) {
      expect(runbookCert).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-sustained-product-evolution-re-entrant-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC), "utf8");
    expect(doc).toContain("sustained-product-evolution-re-entrant");
    expect(doc).toContain("#sustained-product-evolution-re-entrant");
    for (const path of SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
