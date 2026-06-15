import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVendorPayoutWebhookP2_121,
  formatVendorPayoutWebhookP2_121AuditLines,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-audit";
import { VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES } from "@/lib/marketplace/vendor-payout-webhook-p2-121-content";
import {
  buildConnectOnboardingBlock,
  buildPayoutTransferBlock,
  buildVendorPayoutWebhookDemoReport,
  computePayoutWebhookReadinessScore,
  hasActivePayoutFlow,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-operations";
import {
  VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_CI_WORKFLOW,
  VENDOR_PAYOUT_WEBHOOK_P2_121_DOC,
  VENDOR_PAYOUT_WEBHOOK_P2_121_NPM_SCRIPT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
  VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_UNIT_TEST,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";

const ROOT = process.cwd();

describe("Vendor payout webhook (P2-121)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID).toBe("vendor-payout-webhook-p2-121-v1");
    expect(VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE).toBe(
      "/dashboard/marketplace/vendor-payout-webhook",
    );
    expect(VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT).toBe(4);
    expect(VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES).toHaveLength(4);
  });

  it("passes full vendor payout webhook audit", () => {
    const summary = auditVendorPayoutWebhookP2_121(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyStripeConnectLinked).toBe(true);
    expect(summary.legacyWebhookRouteLinked).toBe(true);
    expect(summary.legacyConnectConfigLinked).toBe(true);
    expect(summary.legacyVendorFinanceLinked).toBe(true);
    expect(summary.legacyVendorApiLinked).toBe(true);
    expect(summary.legacyInstantPayoutsLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds connect onboarding block with status tiers", () => {
    expect(buildConnectOnboardingBlock(false, "not_connected").status).toBe("missing");
    expect(buildConnectOnboardingBlock(false, "pending_verification").status).toBe("partial");
    expect(buildConnectOnboardingBlock(true, "ready").status).toBe("ready");
  });

  it("builds payout transfer block with paid out count", () => {
    expect(buildPayoutTransferBlock(0, 0).status).toBe("missing");
    expect(buildPayoutTransferBlock(3, 0).status).toBe("ready");
    expect(buildPayoutTransferBlock(0, 500).status).toBe("partial");
  });

  it("computes payout webhook readiness score", () => {
    const score = computePayoutWebhookReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", count: 1 },
      { id: "b", label: "B", status: "missing", summary: "", count: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo vendor payout webhook report", () => {
    const report = buildVendorPayoutWebhookDemoReport();
    expect(report.blocks).toHaveLength(4);
    expect(report.connectReady).toBe(true);
    expect(hasActivePayoutFlow(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[VENDOR_PAYOUT_WEBHOOK_P2_121_NPM_SCRIPT]).toContain(
      "audit-vendor-payout-webhook-p2-121.ts",
    );
    expect(pkg.scripts["test:ci:vendor-payout-webhook-p2-121"]).toContain(
      VENDOR_PAYOUT_WEBHOOK_P2_121_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, VENDOR_PAYOUT_WEBHOOK_P2_121_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(VENDOR_PAYOUT_WEBHOOK_P2_121_NPM_SCRIPT);

    expect(existsSync(join(ROOT, VENDOR_PAYOUT_WEBHOOK_P2_121_DOC))).toBe(true);
    expect(
      formatVendorPayoutWebhookP2_121AuditLines(auditVendorPayoutWebhookP2_121(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
