import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceTrustP2_120,
  formatMarketplaceTrustP2_120AuditLines,
} from "@/lib/marketplace/marketplace-trust-p2-120-audit";
import { MARKETPLACE_TRUST_P2_120_CAPABILITIES } from "@/lib/marketplace/marketplace-trust-p2-120-content";
import {
  buildMarketplaceTrustDemoReport,
  buildReviewsBlock,
  buildVerifiedBadgeBlock,
  computeTrustReadinessScore,
  hasActiveTrustSignals,
} from "@/lib/marketplace/marketplace-trust-p2-120-operations";
import {
  MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT,
  MARKETPLACE_TRUST_P2_120_CI_WORKFLOW,
  MARKETPLACE_TRUST_P2_120_DOC,
  MARKETPLACE_TRUST_P2_120_NPM_SCRIPT,
  MARKETPLACE_TRUST_P2_120_POLICY_ID,
  MARKETPLACE_TRUST_P2_120_ROUTE,
  MARKETPLACE_TRUST_P2_120_UNIT_TEST,
} from "@/lib/marketplace/marketplace-trust-p2-120-policy";

const ROOT = process.cwd();

describe("Marketplace trust (P2-120)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(MARKETPLACE_TRUST_P2_120_POLICY_ID).toBe("marketplace-trust-p2-120-v1");
    expect(MARKETPLACE_TRUST_P2_120_ROUTE).toBe("/dashboard/marketplace/trust");
    expect(MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT).toBe(4);
    expect(MARKETPLACE_TRUST_P2_120_CAPABILITIES).toHaveLength(4);
  });

  it("passes full marketplace trust audit", () => {
    const summary = auditMarketplaceTrustP2_120(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyVendorModerationLinked).toBe(true);
    expect(summary.legacyVendorsLinked).toBe(true);
    expect(summary.legacyQualityLinked).toBe(true);
    expect(summary.legacyDisputesLinked).toBe(true);
    expect(summary.legacyCheckoutTrustLinked).toBe(true);
    expect(summary.legacyCheckoutTrustComponentLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds verified badge block with status tiers", () => {
    expect(buildVerifiedBadgeBlock(0, 0).status).toBe("missing");
    expect(buildVerifiedBadgeBlock(1, 3).status).toBe("partial");
    expect(buildVerifiedBadgeBlock(5, 6).status).toBe("ready");
  });

  it("builds reviews block with score summary", () => {
    expect(buildReviewsBlock(0, null).status).toBe("missing");
    expect(buildReviewsBlock(5, 4.2).status).toBe("ready");
  });

  it("computes trust readiness score", () => {
    const score = computeTrustReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", count: 1 },
      { id: "b", label: "B", status: "missing", summary: "", count: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo marketplace trust report", () => {
    const report = buildMarketplaceTrustDemoReport();
    expect(report.blocks).toHaveLength(4);
    expect(report.verifiedVendorCount).toBeGreaterThan(0);
    expect(hasActiveTrustSignals(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[MARKETPLACE_TRUST_P2_120_NPM_SCRIPT]).toContain(
      "audit-marketplace-trust-p2-120.ts",
    );
    expect(pkg.scripts["test:ci:marketplace-trust-p2-120"]).toContain(
      MARKETPLACE_TRUST_P2_120_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_TRUST_P2_120_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(MARKETPLACE_TRUST_P2_120_NPM_SCRIPT);

    expect(existsSync(join(ROOT, MARKETPLACE_TRUST_P2_120_DOC))).toBe(true);
    expect(
      formatMarketplaceTrustP2_120AuditLines(auditMarketplaceTrustP2_120(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
