import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditActualVsTheoreticalVarianceP2_102,
  formatActualVsTheoreticalVarianceP2_102AuditLines,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-audit";
import { ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES } from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-content";
import {
  buildActualDepletionRows,
  buildActualVsTheoreticalVarianceDemoReport,
  buildAvtVarianceTile,
  buildTheoreticalBaselineRows,
  ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_DEPLETION,
  ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_THEORETICAL,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-operations";
import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CI_WORKFLOW,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_NPM_SCRIPT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_UNIT_TEST,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";

const ROOT = process.cwd();

describe("Actual vs theoretical variance (P2-102)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID).toBe(
      "actual-vs-theoretical-variance-p2-102-v1",
    );
    expect(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE).toBe(
      "/dashboard/inventory/actual-vs-theoretical-variance",
    );
    expect(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT).toBe(3);
    expect(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES).toHaveLength(3);
  });

  it("passes full actual vs theoretical variance audit", () => {
    const summary = auditActualVsTheoreticalVarianceP2_102(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyAvtLinked).toBe(true);
    expect(summary.legacyAlertLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds AVT variance tile with status tiers", () => {
    const healthy = buildAvtVarianceTile({
      driftPercent: 3,
      alertCount: 0,
      theftAlertCount: 0,
      confidence: "HIGH",
    });
    expect(healthy.status).toBe("healthy");

    const critical = buildAvtVarianceTile({
      driftPercent: 22,
      alertCount: 5,
      theftAlertCount: 2,
      confidence: "MEDIUM",
    });
    expect(critical.status).toBe("critical");
    expect(critical.headline).toContain("drift");
  });

  it("builds theoretical baseline rows sorted by usage", () => {
    const rows = buildTheoreticalBaselineRows([...ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_THEORETICAL]);
    expect(rows.length).toBe(3);
    expect(rows[0]!.theoreticalUsage).toBeGreaterThanOrEqual(rows[1]!.theoreticalUsage);
    expect(rows[0]!.productName).toBe("Signature burger");
  });

  it("builds actual depletion rows with severity", () => {
    const rows = buildActualDepletionRows([...ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_DEPLETION]);
    expect(rows.length).toBe(3);
    expect(rows[0]!.severity).toBe("critical");
    expect(rows[0]!.recommendation).toContain("theoretical depletion");
  });

  it("builds demo actual vs theoretical variance report", () => {
    const report = buildActualVsTheoreticalVarianceDemoReport();
    expect(report.theoreticalBaselineCount).toBe(3);
    expect(report.actualDepletionCount).toBe(3);
    expect(report.varianceTile.alertCount).toBe(3);
    expect(report.totalVarianceCost).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_NPM_SCRIPT]).toContain(
      "audit-actual-vs-theoretical-variance-p2-102.ts",
    );
    expect(pkg.scripts["test:ci:actual-vs-theoretical-variance-p2-102"]).toContain(
      ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_NPM_SCRIPT);

    expect(existsSync(join(ROOT, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC))).toBe(true);
    expect(
      formatActualVsTheoreticalVarianceP2_102AuditLines(
        auditActualVsTheoreticalVarianceP2_102(ROOT),
      ).length,
    ).toBeGreaterThan(5);
  });
});
