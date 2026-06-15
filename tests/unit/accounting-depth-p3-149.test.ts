import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAccountingDepthP3_149,
  formatAccountingDepthP3_149AuditLines,
} from "@/lib/accounting/accounting-depth-p3-149-audit";
import { assertAccountingDepthCapabilityCount } from "@/lib/accounting/accounting-depth-p3-149-content";
import {
  loadAccountingDepthR365Registry,
  validateAccountingDepthR365Registry,
} from "@/lib/accounting/accounting-depth-p3-149-operations";
import {
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT,
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS,
  ACCOUNTING_DEPTH_P3_149_CI_WORKFLOW,
  ACCOUNTING_DEPTH_P3_149_COMPETITOR,
  ACCOUNTING_DEPTH_P3_149_DOC,
  ACCOUNTING_DEPTH_P3_149_HEADLINE,
  ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF,
  ACCOUNTING_DEPTH_P3_149_NPM_SCRIPT,
  ACCOUNTING_DEPTH_P3_149_POLICY_ID,
  ACCOUNTING_DEPTH_P3_149_POSITIONING_LINE,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
  ACCOUNTING_DEPTH_P3_149_UNIT_TEST,
} from "@/lib/accounting/accounting-depth-p3-149-policy";

const ROOT = process.cwd();

describe("Accounting depth R365 (P3-149)", () => {
  it("locks policy id, R365 competitor, and 6 accounting capabilities", () => {
    expect(ACCOUNTING_DEPTH_P3_149_POLICY_ID).toBe("accounting-depth-p3-149-v1");
    expect(ACCOUNTING_DEPTH_P3_149_COMPETITOR).toBe("restaurant365");
    expect(ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT).toBe(6);
    expect(ACCOUNTING_DEPTH_P3_149_ROUTE).toBe("/dashboard/accounting/depth");
    expect(ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF).toBe(
      "gl-depth-accounting-absolute-final-v1",
    );
    expect(ACCOUNTING_DEPTH_P3_149_POSITIONING_LINE).toBe(
      "Kitchen-first ops with honest GL depth — not R365 enterprise accounting suite.",
    );
    expect(ACCOUNTING_DEPTH_P3_149_HEADLINE).toBe("Accounting depth — R365 parity baseline");
    expect(ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS).toEqual([
      "chart_of_accounts",
      "journal_entries",
      "gl_depth_sync",
      "pnl_reconciliation",
      "period_close",
      "ap_automation",
    ]);
    expect(assertAccountingDepthCapabilityCount()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadAccountingDepthR365Registry(ROOT);
    const validation = validateAccountingDepthR365Registry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.capabilities).toHaveLength(6);
  });

  it("passes full accounting depth R365 audit", () => {
    const summary = auditAccountingDepthP3_149(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.coaAuditPassed).toBe(true);
    expect(summary.journalAuditPassed).toBe(true);
    expect(summary.portalAuditPassed).toBe(true);
    expect(summary.reconciliationAuditPassed).toBe(true);
    expect(summary.apAuditPassed).toBe(true);
    expect(summary.legacyGlWiringPassed).toBe(true);
    expect(summary.liveDepthWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.capabilitiesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("wires deploy-prod-gate and npm audit script", () => {
    const workflow = readFileSync(join(ROOT, ACCOUNTING_DEPTH_P3_149_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(ACCOUNTING_DEPTH_P3_149_NPM_SCRIPT);
    expect(existsSync(join(ROOT, ACCOUNTING_DEPTH_P3_149_DOC))).toBe(true);
    expect(existsSync(join(ROOT, ACCOUNTING_DEPTH_P3_149_UNIT_TEST))).toBe(true);
  });

  it("formats audit lines without throwing", () => {
    const summary = auditAccountingDepthP3_149(ROOT);
    const lines = formatAccountingDepthP3_149AuditLines(summary);
    expect(lines.length).toBeGreaterThan(5);
    expect(lines.some((line) => line.includes("restaurant365") || line.includes("R365"))).toBe(
      true,
    );
  });
});
