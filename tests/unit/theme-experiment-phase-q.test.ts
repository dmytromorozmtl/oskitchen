import { describe, expect, it } from "vitest";

import {
  applyAutoHoldoutBump,
  buildInterferenceMatrixSnapshot,
  evaluateInterferencePublishGate,
} from "@/lib/storefront/theme-experiment-interference-matrix";
import { assignArmWasmKernel, isWasmAssignmentEnabled } from "@/lib/storefront/theme-experiment-wasm-assignment";
import {
  appendPosteriorPoint,
  buildPartialRollbackPreviewDiff,
  mergeCausalPosteriorsIntoJson,
} from "@/lib/storefront/theme-experiment-causal-posteriors";
import { seedPartialRollbackSnapshot } from "@/lib/storefront/theme-experiment-partial-rollback";
import {
  evaluateBqPrivateLinkCompliance,
  s3PutObjectCmekParams,
} from "@/lib/compliance/experiment-bq-private-link";
import { buildIso27001Attestation } from "@/lib/compliance/iso27001-crosswalk";
import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";

describe("Q1 interference matrix", () => {
  it("bumps holdout on elevated spillover", () => {
    process.env.THEME_EXPERIMENT_INTERFERENCE_MATRIX = "1";
    const snap = buildInterferenceMatrixSnapshot([
      {
        workspaceId: "ws1",
        storeSlug: "cafe",
        spilloverPp: 2.5,
        crossLiftPp: 2,
        exposures: 100,
        syntheticWeight: 100,
      },
    ]);
    const json = { interferenceMatrix: { ...snap, recommendedHoldoutBumpPercent: 2 } };
    const { applied, holdoutPercent } = applyAutoHoldoutBump(json, 5);
    expect(applied).toBe(true);
    expect(holdoutPercent).toBeGreaterThan(5);
    const gate = evaluateInterferencePublishGate(json);
    expect(gate.passed).toBe(false);
  });
});

describe("Q2 wasm assignment", () => {
  it("assigns arm under SLO", () => {
    process.env.THEME_EXPERIMENT_WASM_ASSIGNMENT = "1";
    const snap: LinUcbSnapshot = {
      at: new Date().toISOString(),
      explorationPercent: 10,
      regretPp: 0,
      featureDim: 5,
      arms: [
        { armId: "published", theta: [0.1], weight: 0.5 },
        { armId: "draft", theta: [0.2], weight: 0.5 },
      ],
    };
    const r = assignArmWasmKernel({
      storeSlug: "cafe",
      visitorId: "v1",
      segment: "default",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
    });
    expect(["published", "draft"]).toContain(r.armId);
    expect(isWasmAssignmentEnabled()).toBe(true);
  });
});

describe("Q5 causal posteriors", () => {
  it("streams posteriors and builds rollback diff", () => {
    const stream = {
      at: new Date().toISOString(),
      metricId: "conversion_rate",
      points: [],
      pymcVersion: "5.x",
      streaming: true,
    };
    const withPoint = appendPosteriorPoint(stream, {
      at: new Date().toISOString(),
      mu: 0.05,
      sigma: 0.01,
      hdiLow: 0.03,
      hdiHigh: 0.07,
      probPositive: 0.92,
    });
    const json = mergeCausalPosteriorsIntoJson(null, withPoint);
    const rollbackJson = seedPartialRollbackSnapshot({
      previousRaw: json,
      publishedSnapshot: { version: 1, tokens: { brandColor: "#111" }, navigationItems: [{ l: "old" }] },
      winnerSnapshot: { version: 1, tokens: { brandColor: "#222" }, navigationItems: [{ l: "win" }] },
    });
    const diff = buildPartialRollbackPreviewDiff(rollbackJson);
    expect(diff?.copyKept).toContain("navigationItems");
  });
});

describe("Q3 private link", () => {
  it("requires CMEK when configured", () => {
    process.env.AUDIT_ARCHIVE_S3_CMEK_KEY_ARN = "arn:aws:kms:us-east-1:1:key/abc";
    process.env.GCP_VPC_SC_PERIMETER = "perimeter/experiment";
    const audit = evaluateBqPrivateLinkCompliance();
    expect(audit.status).toBe("compliant");
    expect(s3PutObjectCmekParams()?.SSEKMSKeyId).toContain("kms");
  });
});

describe("Q4 ISO 27001", () => {
  it("crosswalks SOC2 to ISO", () => {
    const att = buildIso27001Attestation();
    expect(att.controls.some((c) => c.isoControlId === "A.8.15")).toBe(true);
  });
});
