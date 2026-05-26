import { describe, expect, it } from "vitest";

import {
  GA4_PARITY_DRIFT_STREAK_ALERT,
  nextGa4ParityDriftStreak,
  readGa4ParityDriftStreak,
} from "@/lib/storefront/ga4-parity-json";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";

const driftScore: Ga4ParityScore = {
  status: "drift",
  parityScorePp: 5,
  firstPartyLiftPp: 8,
  ga4LiftPp: 3,
  headline: "drift",
  detail: "drift",
  ga4: null,
  cachedAt: null,
};

const okScore: Ga4ParityScore = {
  status: "ok",
  parityScorePp: 1,
  firstPartyLiftPp: 2,
  ga4LiftPp: 1,
  headline: "ok",
  detail: "ok",
  ga4: null,
  cachedAt: null,
};

describe("ga4 parity drift streak", () => {
  it("increments on drift and resets on ok", () => {
    const s1 = nextGa4ParityDriftStreak(null, driftScore);
    expect(s1.count).toBe(1);
    const s2 = nextGa4ParityDriftStreak(s1, driftScore);
    expect(s2.count).toBe(2);
    expect(s2.count).toBeGreaterThanOrEqual(GA4_PARITY_DRIFT_STREAK_ALERT);
    const s3 = nextGa4ParityDriftStreak(s2, okScore);
    expect(s3.count).toBe(0);
  });

  it("reads streak from json", () => {
    const raw = { ga4ParityDriftStreak: { count: 2, lastAt: "2026-01-01T00:00:00Z", lastParityPp: 4 } };
    expect(readGa4ParityDriftStreak(raw)?.count).toBe(2);
  });
});
