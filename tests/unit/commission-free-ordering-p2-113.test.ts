import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissionFreeOrderingP2_113,
  formatCommissionFreeOrderingP2_113AuditLines,
} from "@/lib/marketing/commission-free-ordering-p2-113-audit";
import { COMMISSION_FREE_ORDERING_P2_113_MESSAGES } from "@/lib/marketing/commission-free-ordering-p2-113-content";
import {
  buildCommissionFreeOrderingDemoReport,
  buildCompareMessage,
  buildStorefrontMessage,
  buildStripeMessage,
  computeMarketplaceFeesUsd,
  computeOwnedChannelFeesUsd,
  formatStripeFeeDisclosure,
  matchesCommissionFreeHeadline,
} from "@/lib/marketing/commission-free-ordering-p2-113-operations";
import {
  COMMISSION_FREE_ORDERING_P2_113_CI_WORKFLOW,
  COMMISSION_FREE_ORDERING_P2_113_DOC,
  COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT,
  COMMISSION_FREE_ORDERING_P2_113_NPM_SCRIPT,
  COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
  COMMISSION_FREE_ORDERING_P2_113_ROUTE,
  COMMISSION_FREE_ORDERING_P2_113_UNIT_TEST,
} from "@/lib/marketing/commission-free-ordering-p2-113-policy";

const ROOT = process.cwd();

describe("Commission-free ordering (P2-113)", () => {
  it("locks policy id, route, and three messages", () => {
    expect(COMMISSION_FREE_ORDERING_P2_113_POLICY_ID).toBe(
      "commission-free-ordering-p2-113-v1",
    );
    expect(COMMISSION_FREE_ORDERING_P2_113_ROUTE).toBe(
      "/dashboard/marketing/commission-free-ordering",
    );
    expect(COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT).toBe(3);
    expect(COMMISSION_FREE_ORDERING_P2_113_MESSAGES).toHaveLength(3);
  });

  it("passes full commission-free ordering audit", () => {
    const summary = auditCommissionFreeOrderingP2_113(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyStripeLinked).toBe(true);
    expect(summary.legacyPaymentLinked).toBe(true);
    expect(summary.legacyOrderingLinked).toBe(true);
    expect(summary.legacyOwnChannelLinked).toBe(true);
    expect(summary.messageCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds storefront, stripe, and compare message blocks", () => {
    const storefront = buildStorefrontMessage();
    expect(matchesCommissionFreeHeadline(storefront.headline)).toBe(true);

    const stripe = buildStripeMessage({
      processingPct: 2.9,
      fixedFeeUsd: 0.3,
      stripeReady: true,
      stripeMode: "test",
    });
    expect(formatStripeFeeDisclosure({ processingPct: 2.9, fixedFeeUsd: 0.3 })).toContain("2.9%");
    expect(stripe.body).toContain("Stripe");

    const compare = buildCompareMessage({
      marketplaceCommissionPct: 25,
      stripeProcessingPct: 2.9,
    });
    expect(compare.headline).toContain("25%");
  });

  it("computes marketplace vs owned channel fees", () => {
    const marketplace = computeMarketplaceFeesUsd({
      monthlyOrderVolumeUsd: 10000,
      marketplaceCommissionPct: 25,
    });
    expect(marketplace).toBe(2500);

    const owned = computeOwnedChannelFeesUsd({
      monthlyOrderVolumeUsd: 10000,
      stripeProcessingPct: 2.9,
      stripeFixedFeeUsd: 0.3,
      orderCount: 300,
    });
    expect(owned).toBeLessThan(marketplace);
  });

  it("builds demo commission-free ordering report", () => {
    const report = buildCommissionFreeOrderingDemoReport();
    expect(report.messages).toHaveLength(3);
    expect(report.osKitchenOrderCommissionPct).toBe(0);
    expect(report.monthlyDeltaUsd).toBeGreaterThan(0);
    expect(report.stripeMode).toBe("test");
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[COMMISSION_FREE_ORDERING_P2_113_NPM_SCRIPT]).toContain(
      "audit-commission-free-ordering-p2-113.ts",
    );
    expect(pkg.scripts["test:ci:commission-free-ordering-p2-113"]).toContain(
      COMMISSION_FREE_ORDERING_P2_113_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, COMMISSION_FREE_ORDERING_P2_113_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(COMMISSION_FREE_ORDERING_P2_113_NPM_SCRIPT);

    expect(existsSync(join(ROOT, COMMISSION_FREE_ORDERING_P2_113_DOC))).toBe(true);
    expect(
      formatCommissionFreeOrderingP2_113AuditLines(
        auditCommissionFreeOrderingP2_113(ROOT),
      ).length,
    ).toBeGreaterThan(5);
  });
});
