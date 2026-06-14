import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPosShiftOpenCloseP250,
  formatPosShiftOpenCloseP250AuditLines,
} from "@/lib/qa/pos-shift-open-close-p2-50-audit";
import {
  POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT,
  POS_SHIFT_OPEN_CLOSE_P2_50_CHECK_NPM_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_P2_50_CI_NPM_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_P2_50_CI_WORKFLOW,
  POS_SHIFT_OPEN_CLOSE_P2_50_DOC,
  POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC,
  POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER,
  POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_STEPS,
  POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID,
  POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER,
  POS_SHIFT_OPEN_CLOSE_P2_50_WIRING_PATHS,
} from "@/lib/qa/pos-shift-open-close-p2-50-policy";
import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";
import { closedShiftHistoryShowsBalanced } from "@/lib/qa/pos-shift-open-close-e2e-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("POS shift open→close E2E (P2-50)", () => {
  it("locks P2-50 policy and six-step shift lifecycle", () => {
    expect(POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID).toBe("pos-shift-open-close-p2-50-v1");
    expect(POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_STEPS).toEqual([
      "open_shift",
      "transactions",
      "refund",
      "void",
      "close_shift",
      "reconcile_totals",
    ]);
  });

  it("passes full P2-50 audit — refund, void, close, reconcile wired", () => {
    const summary = auditPosShiftOpenCloseP250(ROOT);
    expect(summary.e2eSpecPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.refundVoidWired).toBe(true);
    expect(summary.reconcileWired).toBe(true);
    expect(summary.closeoutMathPresent).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("checkout flow reconciles balanced shift closeout", () => {
    const closeout = computeShiftCloseout({
      openingCash: 100,
      cashSalesTotals: [19.44],
      closingCash: 119.44,
    });
    expect(closeout.variance).toBe(0);
    expect(closedShiftHistoryShowsBalanced("$119.44 $119.44 Balanced")).toBe(true);

    const flow = readSource(POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER);
    expect(flow).toContain("assertClosedShiftTotalsBalanced");
    expect(flow).toContain("refundPosTransaction");
    expect(flow).toContain("voidPosTransaction");
  });

  it("P2-50 wiring paths exist including doc, artifact, E2E spec, and CI gate", () => {
    for (const path of POS_SHIFT_OPEN_CLOSE_P2_50_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${POS_SHIFT_OPEN_CLOSE_P2_50_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${POS_SHIFT_OPEN_CLOSE_P2_50_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain("test:e2e:pos-checkout-e2e");

    const ci = readSource(POS_SHIFT_OPEN_CLOSE_P2_50_CI_WORKFLOW);
    expect(ci).toContain(POS_SHIFT_OPEN_CLOSE_P2_50_CHECK_NPM_SCRIPT);

    const doc = readSource(POS_SHIFT_OPEN_CLOSE_P2_50_DOC);
    expect(doc).toContain(POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID);

    const spec = readSource(POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC);
    expect(spec).toContain("refund");
    expect(spec).toContain("void");

    const reconcile = readSource(POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER);
    expect(reconcile).toContain("assertClosedShiftTotalsBalanced");

    const artifact = JSON.parse(readSource(POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT));
    expect(artifact.policyId).toBe(POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditPosShiftOpenCloseP250(ROOT);
    const lines = formatPosShiftOpenCloseP250AuditLines(summary);
    expect(lines.some((line) => line.includes(POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
