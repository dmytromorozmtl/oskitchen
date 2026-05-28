import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_MARKERS,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CI_SCRIPTS,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_MATH_MODULE,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_OPERATOR_DOC,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_REVIEW_SECTION,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_UNIT_TESTS,
} from "@/lib/pos/pos-receipt-shift-spotcheck-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("POS receipt shift spotcheck era17 CI certification (live repo)", () => {
  it("locks era17 receipt/shift spotcheck policy id", () => {
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID).toBe(
      "era17-pos-receipt-shift-spotcheck-v1",
    );
  });

  it("defines era17 receipt/shift spotcheck scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pos-receipt-shift-spotcheck"]).toContain(
      POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:cert"]).toContain(
      "pos-receipt-shift-spotcheck-era17-cert-live",
    );
    expect(scripts["test:ci:pos-money-path:unit"]).toContain("pos-shift-closeout-math.test.ts");
  });

  it("wires closeout math into shift service", () => {
    const shiftService = readFileSync(
      join(ROOT, "services/pos/pos-shift-service.ts"),
      "utf8",
    );
    expect(shiftService).toContain("computeShiftCloseout");
    expect(existsSync(join(ROOT, POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_MATH_MODULE))).toBe(true);
  });

  it("documents era17 receipt/shift spotcheck in canonical docs", () => {
    expect(existsSync(join(ROOT, POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_OPERATOR_DOC))).toBe(true);
    for (const rel of POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_REVIEW_SECTION);
    for (const marker of POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
