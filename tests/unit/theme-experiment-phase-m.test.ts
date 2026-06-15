import { describe, expect, it } from "vitest";

import {
  evaluateBayesianFromBqPrior,
  resolveBayesianExperimentDecision,
} from "@/lib/storefront/theme-experiment-bayesian";
import {
  isBayesianPriorFresh,
  mergeBayesianPriorIntoJson,
  readBayesianPriorSnapshot,
} from "@/lib/storefront/theme-experiment-bayesian-prior";
import { assignArmForSegment } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { computeOffPolicyLift } from "@/lib/storefront/theme-experiment-off-policy";
import { scoreRegretWithModel, trainMlRegretWeightsFromHistory } from "@/lib/storefront/theme-experiment-ml-model";
import { mergeVersionVectorOnSync, readVersionVector } from "@/lib/storefront/theme-experiment-crdt";
import { resolveCrdtConflict } from "@/lib/storefront/theme-experiment-edge-quorum";

describe("M1 bayesian BQ prior", () => {
  it("merges and reads bayesianPrior snapshot", () => {
    const merged = mergeBayesianPriorIntoJson(null, {
      at: new Date().toISOString(),
      source: "bq",
      controlArmId: "published",
      bestArmId: "draft",
      liftPp: 3,
      probLiftAboveThreshold: 96,
      thresholdPp: 2,
      arms: [
        {
          armId: "published",
          alpha: 50,
          beta: 950,
          meanRate: 0.05,
          ciLow: 0.04,
          ciHigh: 0.06,
        },
        {
          armId: "draft",
          alpha: 70,
          beta: 930,
          meanRate: 0.07,
          ciLow: 0.06,
          ciHigh: 0.08,
        },
      ],
    });
    const snap = readBayesianPriorSnapshot(merged);
    expect(snap?.bestArmId).toBe("draft");
    expect(isBayesianPriorFresh(snap)).toBe(true);
  });

  it("evaluates BQ prior decision", () => {
    const prior = readBayesianPriorSnapshot(
      mergeBayesianPriorIntoJson(null, {
        at: new Date().toISOString(),
        source: "pymc",
        controlArmId: "published",
        bestArmId: "draft",
        liftPp: 4,
        probLiftAboveThreshold: 97,
        thresholdPp: 2,
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
            alpha: 15,
            beta: 85,
            meanRate: 0.15,
            ciLow: 0.12,
            ciHigh: 0.18,
          },
        ],
      }),
    )!;
    const d = evaluateBayesianFromBqPrior(prior);
    expect(d.recommendPublish).toBe(true);
  });
});

describe("M2 contextual bandit", () => {
  it("assigns arm deterministically per segment", () => {
    const arm = assignArmForSegment({
      visitorId: "visitor-1",
      segment: "mobile",
      segmentArmWeights: { mobile: { published: 1, draft: 99 } },
      defaultWeights: { published: 50, draft: 50 },
    });
    expect(arm).toBe("draft");
  });
});

describe("M2 off-policy", () => {
  it("computes IPS lift", () => {
    const ev = computeOffPolicyLift([
      { armId: "published", impressions: 1000, conversions: 50, propensity: 0.5 },
      { armId: "draft", impressions: 1000, conversions: 70, propensity: 0.5 },
    ]);
    expect(ev.arms).toHaveLength(2);
  });
});

describe("M3 CRDT", () => {
  it("merges version vector on conflict", () => {
    const vv = readVersionVector({ version: 5, versionVector: { logical: 5, db: 5, edge: 3 } });
    const merged = resolveCrdtConflict({ themeExperimentJson: { versionVector: vv }, edgeVersion: 7 });
    expect(merged.merged).toBe(true);
    expect(merged.vector.logical).toBeGreaterThanOrEqual(7);
    expect(mergeVersionVectorOnSync(vv, 7).logical).toBe(7);
  });
});

describe("M5 ML model", () => {
  it("scores and trains weights", () => {
    const history = Array.from({ length: 8 }, (_, i) => ({
      at: new Date().toISOString(),
      features: {
        liftPp: i,
        sampleSizeOk: i % 2 === 0,
        srmDeltaPp: 1,
        parityScorePp: 0,
        edgeSynced: true,
        daysRunning: 10,
        armImbalance: 1,
      },
      outcome: (i % 3 === 0 ? "blocked" : "running") as const,
    }));
    const w = trainMlRegretWeightsFromHistory(history);
    const score = scoreRegretWithModel(history[0]!.features, w);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("resolveBayesianExperimentDecision", () => {
  it("uses live conjugate when BQ-only off", () => {
    const d = resolveBayesianExperimentDecision({
      arms: [
        { armId: "published", conversions: 10, checkouts: 200 },
        { armId: "draft", conversions: 15, checkouts: 200 },
      ],
    });
    expect(d.posteriors.length).toBe(2);
  });
});
