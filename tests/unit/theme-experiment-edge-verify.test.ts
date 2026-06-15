import { describe, expect, it, vi } from "vitest";

import {
  edgeVersionMatchesExpected,
  pollEdgeVersionMatch,
} from "@/lib/storefront/theme-experiment-edge-verify";

describe("edgeVersionMatchesExpected", () => {
  it("matches when enabled and versions equal", () => {
    expect(
      edgeVersionMatchesExpected({
        experimentEnabled: true,
        expectedVersion: 3,
        edgeVersion: 3,
      }),
    ).toBe(true);
  });

  it("matches when disabled and edge null", () => {
    expect(
      edgeVersionMatchesExpected({
        experimentEnabled: false,
        expectedVersion: 2,
        edgeVersion: null,
      }),
    ).toBe(true);
  });

  it("fails on drift", () => {
    expect(
      edgeVersionMatchesExpected({
        experimentEnabled: true,
        expectedVersion: 3,
        edgeVersion: 2,
      }),
    ).toBe(false);
  });
});

describe("pollEdgeVersionMatch", () => {
  it("retries until read returns expected version", async () => {
    let calls = 0;
    const readVersion = vi.fn(async () => {
      calls++;
      return calls >= 3 ? 5 : 4;
    });
    const r = await pollEdgeVersionMatch({
      experimentEnabled: true,
      expectedVersion: 5,
      readVersion,
      maxAttempts: 5,
      delayMs: 1,
    });
    expect(r.matched).toBe(true);
    expect(r.edgeVersion).toBe(5);
    expect(calls).toBe(3);
  });
});
