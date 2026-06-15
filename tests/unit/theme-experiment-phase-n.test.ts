import { describe, expect, it } from "vitest";

import {
  evaluateHierarchicalBayesianDecision,
  readHierarchicalBayesianPrior,
} from "@/lib/storefront/theme-experiment-bayesian-hierarchical";
import { mergeBayesianPriorIntoJson } from "@/lib/storefront/theme-experiment-bayesian-prior";
import { assignArmLinUcb, buildLinUcbFeatureVector, mergeLinUcbIntoJson } from "@/lib/storefront/theme-experiment-linucb";
import { mergeCrdtLww, readCrdtLwwState } from "@/lib/storefront/theme-experiment-crdt-lww";
import { resolveGlobalEdgeConfigIds } from "@/lib/storefront/theme-experiment-edge-global-quorum";
import {
  mergeVertexModelIntoJson,
  readMlChampionChallenger,
  recordMlShadowComparison,
  shouldAutoPromoteVertex,
} from "@/lib/storefront/theme-experiment-vertex-ml";
import { redactAuditorMetadata } from "@/lib/auth/experiment-auditor-redact";

describe("N1 hierarchical bayesian", () => {
  it("requires all metrics to pass", () => {
    const json = mergeBayesianPriorIntoJson(null, {
      at: new Date().toISOString(),
      source: "pymc_gpu",
      controlArmId: "published",
      bestArmId: "draft",
      liftPp: 3,
      probLiftAboveThreshold: 96,
      thresholdPp: 2,
      hierarchical: true,
      arms: [
        {
          armId: "published",
          alpha: 10,
          beta: 90,
          meanRate: 0.1,
          ciLow: 0.08,
          ciHigh: 0.12,
        },
        {
          armId: "draft",
          alpha: 12,
          beta: 88,
          meanRate: 0.12,
          ciLow: 0.1,
          ciHigh: 0.14,
        },
      ],
      metrics: [
        {
          metricId: "conversion",
          controlArmId: "published",
          bestArmId: "draft",
          liftPp: 3,
          probWinning: 95,
          probLiftAboveThreshold: 96,
          meanControl: 0.05,
          meanTreatment: 0.08,
          ciLow: 0.04,
          ciHigh: 0.09,
        },
        {
          metricId: "revenue",
          controlArmId: "published",
          bestArmId: "draft",
          liftPp: 2,
          probWinning: 90,
          probLiftAboveThreshold: 80,
          meanControl: 1,
          meanTreatment: 1.2,
          ciLow: 0.9,
          ciHigh: 1.3,
        },
      ],
    });
    const hier = readHierarchicalBayesianPrior(json)!;
    const d = evaluateHierarchicalBayesianDecision(hier);
    expect(d.recommendPublish).toBe(false);
  });
});

describe("N2 linucb", () => {
  it("assigns from snapshot", () => {
    const snap = {
      at: new Date().toISOString(),
      explorationPercent: 10,
      regretPp: 2,
      featureDim: 5,
      arms: [
        { armId: "published", theta: [], weight: 0.2 },
        { armId: "draft", theta: [], weight: 0.8 },
      ],
    };
    const json = mergeLinUcbIntoJson(null, snap);
    const features = buildLinUcbFeatureVector({ segment: "mobile" });
    const arm = assignArmLinUcb({
      visitorId: "v1",
      features,
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
    });
    expect(["published", "draft"]).toContain(arm);
    expect(json.linucbWeights).toBeTruthy();
  });
});

describe("N3 global quorum", () => {
  it("resolves replica ids from env", () => {
    const ids = resolveGlobalEdgeConfigIds(null);
    expect(Array.isArray(ids)).toBe(true);
  });

  it("merges crdt lww", () => {
    const a = readCrdtLwwState({
      crdtLww: { vector: { logical: 5, db: 5, edge: 3, updatedAt: "" }, tombstones: [] },
    })!;
    const b = { vector: { logical: 7, db: 5, edge: 7, updatedAt: "" }, tombstones: [] };
    const { merged } = mergeCrdtLww(a, b);
    expect(merged.vector.logical).toBe(7);
  });
});

describe("N4 auditor rls", () => {
  it("redacts pii keys", () => {
    const out = redactAuditorMetadata({ email: "a@b.com", storeSlug: "x" });
    expect(out?.email).toBeUndefined();
    expect(out?.storeSlug).toBe("x");
  });
});

describe("N5 vertex ml", () => {
  it("tracks champion challenger wins", () => {
    const features = {
      liftPp: 5,
      sampleSizeOk: true,
      srmDeltaPp: 1,
      parityScorePp: 0,
      edgeSynced: true,
      daysRunning: 14,
      armImbalance: 1,
    };
    let json: Record<string, unknown> = {};
    let cc = readMlChampionChallenger(json);
    for (let i = 0; i < 15; i++) {
      cc = recordMlShadowComparison({
        themeExperimentJson: json,
        features,
        heuristicBlocked: false,
      });
      json = { mlChampionChallenger: cc };
    }
    expect(cc.shadowDays).toBe(15);
    process.env.THEME_EXPERIMENT_ML_AUTO_PROMOTE = "1";
    cc.consecutiveWins = 14;
    cc.champion = "vertex";
    expect(shouldAutoPromoteVertex(cc)).toBe(true);
    delete process.env.THEME_EXPERIMENT_ML_AUTO_PROMOTE;

    json = mergeVertexModelIntoJson(json, {
      version: 2,
      sha256: "a".repeat(64),
      at: new Date().toISOString(),
      provider: "vertex",
      auc: 0.85,
      f1: 0.8,
      intercept: 0,
      weights: {
        liftPp: -1,
        sampleSizeOk: -1,
        srmDeltaPp: 1,
        parityScorePp: 1,
        edgeSynced: -1,
        daysRunning: -0.1,
      },
      featureImportance: {},
    });
    expect(json.mlRegretModelV2).toBeTruthy();
  });
});
