import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditQrScanStorefrontKdsE2EP137 } from "@/lib/qa/qr-scan-storefront-kds-e2e-p1-37-audit";
import {
  QR_ORDERING_E2E_P2_74_ARTIFACT,
  QR_ORDERING_E2E_P2_74_DASHBOARD_PAGE,
  QR_ORDERING_E2E_P2_74_KDS_CHANNEL_TEST_ID,
  QR_ORDERING_E2E_P2_74_PANEL,
  QR_ORDERING_E2E_P2_74_POLICY_ID,
  QR_ORDERING_E2E_P2_74_SCAN_CHANNEL_TEST_ID,
  QR_ORDERING_E2E_P2_74_SCENARIO_COUNT,
  QR_ORDERING_E2E_P2_74_WIRING_PATHS,
} from "@/lib/qr/qr-ordering-e2e-p2-74-policy";
import { runQrOrderingE2EBenchmarkP274 } from "@/lib/qr/qr-ordering-e2e-p2-74-scoring";

export type QrOrderingE2EP274AuditSummary = {
  policyId: typeof QR_ORDERING_E2E_P2_74_POLICY_ID;
  wiringComplete: boolean;
  panelWired: boolean;
  dashboardWired: boolean;
  qrClientWired: boolean;
  qrOrderApiWired: boolean;
  qrOrderingServiceWired: boolean;
  upstreamP137Passed: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditQrOrderingE2EP274(root = process.cwd()): QrOrderingE2EP274AuditSummary {
  const wiringComplete = QR_ORDERING_E2E_P2_74_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let panelWired = false;
  if (existsSync(join(root, QR_ORDERING_E2E_P2_74_PANEL))) {
    const source = readFileSync(join(root, QR_ORDERING_E2E_P2_74_PANEL), "utf8");
    panelWired =
      source.includes('data-testid="qr-ordering-e2e-panel"') &&
      source.includes(`data-testid="${QR_ORDERING_E2E_P2_74_SCAN_CHANNEL_TEST_ID}"`) &&
      source.includes(`data-testid="${QR_ORDERING_E2E_P2_74_KDS_CHANNEL_TEST_ID}"`);
  }

  let dashboardWired = false;
  if (existsSync(join(root, QR_ORDERING_E2E_P2_74_DASHBOARD_PAGE))) {
    const source = readFileSync(join(root, QR_ORDERING_E2E_P2_74_DASHBOARD_PAGE), "utf8");
    dashboardWired =
      source.includes("QrOrderingE2EPanel") && source.includes("scan to KDS");
  }

  let qrClientWired = false;
  const qrClientPath = join(root, "components/qr/qr-ordering-client.tsx");
  if (existsSync(qrClientPath)) {
    const source = readFileSync(qrClientPath, "utf8");
    qrClientWired =
      source.includes('data-testid="qr-ordering-page"') &&
      source.includes('data-testid="qr-place-order"') &&
      source.includes("/api/public/qr-order");
  }

  let qrOrderApiWired = false;
  const qrOrderApiPath = join(root, "app/api/public/qr-order/route.ts");
  if (existsSync(qrOrderApiPath)) {
    const source = readFileSync(qrOrderApiPath, "utf8");
    qrOrderApiWired = source.includes("processQROrder");
  }

  let qrOrderingServiceWired = false;
  const qrServicePath = join(root, "services/qr/qr-ordering-service.ts");
  if (existsSync(qrServicePath)) {
    const source = readFileSync(qrServicePath, "utf8");
    qrOrderingServiceWired =
      source.includes("processQROrder") && source.includes("createOrderViaCenter");
  }

  const upstreamP137Passed = auditQrScanStorefrontKdsE2EP137(root).passed;
  const benchmark = runQrOrderingE2EBenchmarkP274();
  const artifactPresent = existsSync(join(root, QR_ORDERING_E2E_P2_74_ARTIFACT));

  const passed =
    wiringComplete &&
    panelWired &&
    dashboardWired &&
    qrClientWired &&
    qrOrderApiWired &&
    qrOrderingServiceWired &&
    upstreamP137Passed &&
    benchmark.passed &&
    artifactPresent &&
    benchmark.scenarioCount === QR_ORDERING_E2E_P2_74_SCENARIO_COUNT;

  return {
    policyId: QR_ORDERING_E2E_P2_74_POLICY_ID,
    wiringComplete,
    panelWired,
    dashboardWired,
    qrClientWired,
    qrOrderApiWired,
    qrOrderingServiceWired,
    upstreamP137Passed,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatQrOrderingE2EP274AuditLines(
  summary: QrOrderingE2EP274AuditSummary,
): string[] {
  return [
    `QR ordering E2E (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `E2E panel: ${summary.panelWired ? "yes" : "no"}`,
    `Dashboard page: ${summary.dashboardWired ? "wired" : "missing"}`,
    `QR guest client: ${summary.qrClientWired ? "wired" : "missing"}`,
    `QR order API: ${summary.qrOrderApiWired ? "wired" : "missing"}`,
    `QR ordering service: ${summary.qrOrderingServiceWired ? "wired" : "missing"}`,
    `Upstream P1-37: ${summary.upstreamP137Passed ? "passed" : "failed"}`,
    `Flow benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
