import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditApAutomationP2_104,
  formatApAutomationP2_104AuditLines,
} from "@/lib/accounting/ap-automation-p2-104-audit";
import { AP_AUTOMATION_P2_104_CAPABILITIES } from "@/lib/accounting/ap-automation-p2-104-content";
import {
  buildApAutomationDemoReport,
  buildApWorkflowStageSummaries,
  buildInvoiceIntakeQueue,
  buildPaymentReleaseQueue,
  buildPoMatchQueue,
  AP_AUTOMATION_DEMO_INTAKE,
  AP_AUTOMATION_DEMO_PAYMENTS,
  AP_AUTOMATION_DEMO_PO_MATCHES,
} from "@/lib/accounting/ap-automation-p2-104-operations";
import {
  AP_AUTOMATION_P2_104_CAPABILITY_COUNT,
  AP_AUTOMATION_P2_104_CI_WORKFLOW,
  AP_AUTOMATION_P2_104_DOC,
  AP_AUTOMATION_P2_104_NPM_SCRIPT,
  AP_AUTOMATION_P2_104_POLICY_ID,
  AP_AUTOMATION_P2_104_ROUTE,
  AP_AUTOMATION_P2_104_UNIT_TEST,
} from "@/lib/accounting/ap-automation-p2-104-policy";

const ROOT = process.cwd();

describe("AP automation (P2-104)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(AP_AUTOMATION_P2_104_POLICY_ID).toBe("ap-automation-p2-104-v1");
    expect(AP_AUTOMATION_P2_104_ROUTE).toBe("/dashboard/accounting/ap-automation");
    expect(AP_AUTOMATION_P2_104_CAPABILITY_COUNT).toBe(3);
    expect(AP_AUTOMATION_P2_104_CAPABILITIES).toHaveLength(3);
  });

  it("passes full AP automation audit", () => {
    const summary = auditApAutomationP2_104(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyApLinked).toBe(true);
    expect(summary.legacyActionsLinked).toBe(true);
    expect(summary.legacyScannerLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds AP workflow stage summaries", () => {
    const stages = buildApWorkflowStageSummaries([
      { stage: "intake", amount: 100 },
      { stage: "intake", amount: 200 },
      { stage: "payment", amount: 500 },
    ]);
    const intake = stages.find((s) => s.stage === "intake");
    expect(intake?.count).toBe(2);
    expect(intake?.totalAmount).toBe(300);
  });

  it("builds invoice intake queue sorted by date", () => {
    const rows = buildInvoiceIntakeQueue([...AP_AUTOMATION_DEMO_INTAKE]);
    expect(rows.length).toBe(2);
    expect(rows[0]!.invoiceNumber).toBe("SYSCO-8842");
  });

  it("builds PO match queue with status tiers", () => {
    const rows = buildPoMatchQueue([...AP_AUTOMATION_DEMO_PO_MATCHES]);
    expect(rows.length).toBe(2);
    const unmatched = rows.find((r) => r.matchStatus === "unmatched");
    expect(unmatched?.invoiceNumber).toBe("LOCAL-992");
    const variance = rows.find((r) => r.matchStatus === "variance");
    expect(variance?.varianceAmount).toBeGreaterThan(0);
  });

  it("builds payment release queue sorted by due date", () => {
    const rows = buildPaymentReleaseQueue([...AP_AUTOMATION_DEMO_PAYMENTS]);
    expect(rows.length).toBe(2);
    expect(rows.some((r) => r.status === "queued")).toBe(true);
    expect(rows.some((r) => r.status === "paid")).toBe(true);
  });

  it("builds demo AP automation report", () => {
    const report = buildApAutomationDemoReport();
    expect(report.invoiceIntakeCount).toBe(2);
    expect(report.poMatchCount).toBe(2);
    expect(report.paymentReleaseCount).toBe(2);
    expect(report.pendingAmount).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AP_AUTOMATION_P2_104_NPM_SCRIPT]).toContain("audit-ap-automation-p2-104.ts");
    expect(pkg.scripts["test:ci:ap-automation-p2-104"]).toContain(AP_AUTOMATION_P2_104_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, AP_AUTOMATION_P2_104_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AP_AUTOMATION_P2_104_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AP_AUTOMATION_P2_104_DOC))).toBe(true);
    expect(
      formatApAutomationP2_104AuditLines(auditApAutomationP2_104(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
