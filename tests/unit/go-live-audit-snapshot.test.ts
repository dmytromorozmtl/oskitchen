import { describe, expect, it } from "vitest";

import { buildGoLiveAuditSnapshot, parseGoLiveAuditSnapshot } from "@/lib/go-live/audit-snapshot";
import type { ValidationReport } from "@/lib/go-live/launch-validator";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

function sampleInputs(): ReadinessInputs {
  return {
    hasBusinessProfile: true,
    hasFulfillmentRules: true,
    hasMenu: true,
    productCount: 10,
    mappedProductCount: 10,
    unmappedProductCount: 0,
    customerCount: 2,
    connectionsConnected: 1,
    connectionsBroken: 0,
    testOrderCount: 1,
    productionRuns: 1,
    packingTaskCount: 1,
    packingValidatedCount: 1,
    labelsPrinted: 1,
    deliveryRoutes: 1,
    staffActive: 3,
    trainingCompletions: 1,
    hasBilling: true,
    hasBackup: true,
    hasSupportContact: true,
    hasAnalytics: true,
    storefrontPublished: true,
    webhooksHealthy: true,
    approvalsCount: 4,
    approvalsRequired: 5,
    externalCertificationRequired: true,
    externalTargetProviderCount: 2,
    externalCertifiedProviderCount: 1,
    externalMissingProviderCount: 1,
    externalMissingProviderLabels: ["Shopify"],
    placeholderIntegrationScopeCount: 1,
    placeholderIntegrationScopeLabels: ["Uber Direct"],
  };
}

function sampleReport(): ValidationReport {
  return {
    readiness: {
      score: 88,
      totalWeight: 10,
      earnedWeight: 8.8,
      byStage: [],
      required: {
        passed: [],
        missing: [{ key: "approvals", label: "Approvals captured", stage: "FULL_GO_LIVE", value: 4, satisfied: false, required: true, weight: 3 }],
      },
      signals: [],
    },
    blockers: [
      {
        key: "external_integrations_uncertified",
        severity: "CRITICAL",
        stage: "CHANNEL_INTEGRATIONS",
        title: "External integrations are not certified",
        impact: "Launch would rely on external channel flows that have not been verified end-to-end.",
        resolution: "Certify external providers.",
      },
    ],
    canApprove: false,
    recommendedStatus: "BLOCKED",
    riskLevel: "CRITICAL",
    reasons: ["1 approval(s) outstanding."],
  };
}

describe("go-live audit snapshot", () => {
  it("builds and parses immutable audit metadata", () => {
    const snapshot = buildGoLiveAuditSnapshot(sampleInputs(), sampleReport());
    const parsed = parseGoLiveAuditSnapshot(snapshot as never);

    expect(parsed).toEqual(snapshot);
    expect(parsed?.externalCertification.missingLabels).toEqual(["Shopify"]);
    expect(parsed?.criticalBlockerKeys).toEqual(["external_integrations_uncertified"]);
  });

  it("returns null for unrelated metadata", () => {
    expect(parseGoLiveAuditSnapshot({ foo: "bar" } as never)).toBeNull();
    expect(parseGoLiveAuditSnapshot(null)).toBeNull();
  });
});
