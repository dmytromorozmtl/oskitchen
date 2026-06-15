import { describe, expect, it } from "vitest";

import {
  computeSyntheticControlLift,
  evaluateCausalForestPublishGate,
  mergeCausalLiftDailyIntoJson,
  recommendGeoHoldoutPercent,
} from "@/lib/storefront/theme-experiment-causal-forest";
import {
  appendFeatureStreamEvent,
  applyLinUcbCircuitBreaker,
  realtimeRegretCircuitBreakerPp,
} from "@/lib/storefront/theme-experiment-feature-stream-bus";
import { mergeCrdtLww, readCrdtLwwState } from "@/lib/storefront/theme-experiment-crdt-lww";
import { mergeGossipIntoJson } from "@/lib/storefront/theme-experiment-crdt-gossip";
import {
  evaluatePostPublishRegression,
  isAutoConcludeFrozen,
  seedPostPublishGuard,
} from "@/lib/storefront/theme-experiment-post-publish-guard";
import { redactAuditorMetadata } from "@/lib/auth/experiment-auditor-redact";

describe("O1 causal forest", () => {
  it("computes synthetic control and holdout", () => {
    const cells = [
      { region: "US", segment: "mobile", armId: "draft", liftPp: 4, exposures: 100, syntheticWeight: 100 },
      { region: "EU", segment: "desktop", armId: "draft", liftPp: 3, exposures: 80, syntheticWeight: 80 },
    ];
    expect(computeSyntheticControlLift(cells)).toBeGreaterThan(0);
    expect(recommendGeoHoldoutPercent(cells)).toBeGreaterThanOrEqual(3);
    const json = mergeCausalLiftDailyIntoJson(null, {
      at: new Date().toISOString(),
      cells,
      globalLiftPp: 3.5,
      recommendedHoldoutPercent: 5,
      syntheticControlLiftPp: 3.5,
      alignedWithHierarchical: true,
    });
    const snap = (json as { causalLiftDaily: { recommendedHoldoutPercent: number } }).causalLiftDaily;
    expect(snap.recommendedHoldoutPercent).toBe(5);
  });
});

describe("O2 feature stream", () => {
  it("caps exploration on high regret", () => {
    process.env.THEME_EXPERIMENT_REALTIME_EXPLORATION_CAP = "10";
    const merged = appendFeatureStreamEvent(null, {
      at: new Date().toISOString(),
      visitorId: "v1",
      sessionId: "s1",
      segment: "mobile",
      geo: "US",
      device: "mobile",
      cartValueCents: 0,
    }, 5);
    const snap = {
      at: new Date().toISOString(),
      explorationPercent: 15,
      regretPp: 5,
      featureDim: 5,
      arms: [{ armId: "draft", theta: [], weight: 0.9 }],
    };
    const capped = applyLinUcbCircuitBreaker(snap, 5);
    expect(capped.explorationPercent).toBeLessThanOrEqual(10);
    expect(5).toBeGreaterThan(realtimeRegretCircuitBreakerPp());
  });
});

describe("O3 crdt gossip", () => {
  it("merges gossip entries", () => {
    const { json, conflictCount } = mergeGossipIntoJson(null, {
      region: "iad1",
      vector: 10,
      at: new Date().toISOString(),
    });
    expect(json.crdtGossipBus).toBeTruthy();
    expect(conflictCount).toBe(0);
    const lww = readCrdtLwwState(json);
    expect(lww?.vector.logical).toBe(10);
    const merged = mergeCrdtLww(lww!, { vector: { logical: 12, db: 10, edge: 12, updatedAt: "" }, tombstones: [] });
    expect(merged.merged.vector.logical).toBe(12);
  });
});

describe("O5 post-publish guard", () => {
  it("detects regression and freezes", () => {
    const json = seedPostPublishGuard({
      previousRaw: null,
      conversionRate: 0.1,
      revenueProxyPp: 0,
      checkouts: 500,
    });
    const guard = json.postPublishGuard as {
      baseline: { conversionRate: number };
      sigmaThreshold: number;
      windowHours: number;
      frozenUntil: string | null;
      rollbackPending: boolean;
      rollbackTokenHash: string | null;
      lastCheckAt: string | null;
      currentConversionRate: number | null;
      zScore: number | null;
    };
    const next = evaluatePostPublishRegression({
      guard: {
        baseline: guard.baseline,
        windowHours: 24,
        sigmaThreshold: 2,
        frozenUntil: null,
        rollbackPending: false,
        rollbackTokenHash: null,
        lastCheckAt: null,
        currentConversionRate: null,
        zScore: null,
      },
      currentConversionRate: 0.05,
      currentCheckouts: 400,
    });
    expect(next.rollbackPending).toBe(true);
    const frozenJson = { postPublishGuard: { ...next, frozenUntil: new Date(Date.now() + 86400000).toISOString() } };
    expect(isAutoConcludeFrozen(frozenJson)).toBe(true);
  });
});

describe("O4 auditor redact", () => {
  it("redacts email", () => {
    expect(redactAuditorMetadata({ email: "x@y.com", action: "test" })?.email).toBeUndefined();
  });
});
