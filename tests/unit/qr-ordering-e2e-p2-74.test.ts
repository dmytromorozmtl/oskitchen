import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditQrOrderingE2EP274,
  formatQrOrderingE2EP274AuditLines,
} from "@/lib/qr/qr-ordering-e2e-p2-74-audit";
import {
  QR_ORDERING_E2E_P2_74_ARTIFACT,
  QR_ORDERING_E2E_P2_74_CHECK_NPM_SCRIPT,
  QR_ORDERING_E2E_P2_74_CI_NPM_SCRIPT,
  QR_ORDERING_E2E_P2_74_CI_WORKFLOW,
  QR_ORDERING_E2E_P2_74_DOC,
  QR_ORDERING_E2E_P2_74_FULL_CHAIN,
  QR_ORDERING_E2E_P2_74_POLICY_ID,
  QR_ORDERING_E2E_P2_74_SCENARIO_COUNT,
  QR_ORDERING_E2E_P2_74_UNIT_TEST,
  QR_ORDERING_E2E_P2_74_WIRING_PATHS,
} from "@/lib/qr/qr-ordering-e2e-p2-74-policy";
import {
  buildDegradedQrOrderingE2EP274Scenarios,
  runQrOrderingE2EBenchmarkP274,
} from "@/lib/qr/qr-ordering-e2e-p2-74-scoring";
import { runQrOrderingE2EChain } from "@/lib/qr/qr-ordering-e2e-p2-74-flow";

const ROOT = process.cwd();

describe("QR ordering E2E — scan to KDS (P2-74)", () => {
  it("locks P2-74 policy, full chain, and scenario count", () => {
    expect(QR_ORDERING_E2E_P2_74_POLICY_ID).toBe("qr-ordering-e2e-p2-74-v1");
    expect(QR_ORDERING_E2E_P2_74_FULL_CHAIN).toEqual([
      "qr_scan",
      "storefront_checkout",
      "webhook_event",
      "kitchen_task",
      "kds_ticket",
    ]);
    expect(QR_ORDERING_E2E_P2_74_SCENARIO_COUNT).toBe(6);
  });

  it("runs full QR ordering E2E chain simulator", () => {
    const result = runQrOrderingE2EChain("demo-store", "12", 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chain.kdsVisible).toBe(true);
      expect(result.chain.webhookEventId).toBeTruthy();
      expect(result.chain.kitchenTaskId).toBeTruthy();
    }
  });

  it("passes full QR ordering E2E flow benchmark", () => {
    const benchmark = runQrOrderingE2EBenchmarkP274();
    expect(benchmark.scenarioCount).toBe(6);
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("detects degraded QR ordering E2E scenarios", () => {
    const degraded = runQrOrderingE2EBenchmarkP274(buildDegradedQrOrderingE2EP274Scenarios());
    expect(degraded.passed).toBe(false);
    expect(degraded.passPct).toBeLessThan(100);
  });

  it("passes full P2-74 QR ordering E2E audit", () => {
    const summary = auditQrOrderingE2EP274(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.dashboardWired).toBe(true);
    expect(summary.qrClientWired).toBe(true);
    expect(summary.qrOrderApiWired).toBe(true);
    expect(summary.qrOrderingServiceWired).toBe(true);
    expect(summary.upstreamP137Passed).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-74 wiring paths, CI gate, and artifact", () => {
    for (const path of QR_ORDERING_E2E_P2_74_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[QR_ORDERING_E2E_P2_74_CHECK_NPM_SCRIPT]).toContain(
      QR_ORDERING_E2E_P2_74_UNIT_TEST,
    );
    expect(pkg.scripts?.[QR_ORDERING_E2E_P2_74_CI_NPM_SCRIPT]).toContain(
      QR_ORDERING_E2E_P2_74_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, QR_ORDERING_E2E_P2_74_CI_WORKFLOW), "utf8");
    expect(ci).toContain(QR_ORDERING_E2E_P2_74_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, QR_ORDERING_E2E_P2_74_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(QR_ORDERING_E2E_P2_74_POLICY_ID);
    expect(artifact.status).toBe("LIVE");
    expect(artifact.scenarioCount).toBe(6);

    const doc = readFileSync(join(ROOT, QR_ORDERING_E2E_P2_74_DOC), "utf8");
    expect(doc).toContain(QR_ORDERING_E2E_P2_74_POLICY_ID);
    expect(doc).toContain("qr_scan");
  });

  it("formats audit lines", () => {
    const summary = auditQrOrderingE2EP274(ROOT);
    const lines = formatQrOrderingE2EP274AuditLines(summary);
    expect(lines.some((line) => line.includes(QR_ORDERING_E2E_P2_74_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
