import { describe, expect, it } from "vitest";

import {
  PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS,
  PUBLIC_POST_ABUSE_MATRIX_ENTRIES,
  publicPostAbuseMatrixSummary,
} from "@/lib/security/public-post-abuse-matrix";

describe("public POST abuse matrix", () => {
  it("lists era17 hardened P1 routes", () => {
    expect(PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS).toHaveLength(6);
    expect(PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS).toContain(
      "/api/storefront/experiment/auto-conclude/approve",
    );
    expect(PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS).toContain("/api/iot/temperature");
  });

  it("marks era17 hardened entries in the matrix", () => {
    const hardened = PUBLIC_POST_ABUSE_MATRIX_ENTRIES.filter((e) => e.era17Hardened);
    expect(hardened.length).toBeGreaterThanOrEqual(6);
    for (const path of PUBLIC_POST_ABUSE_ERA17_HARDENED_PATHS) {
      expect(
        PUBLIC_POST_ABUSE_MATRIX_ENTRIES.some((e) => e.apiPath === path && e.era17Hardened),
        path,
      ).toBe(true);
    }
  });

  it("summarizes matrix coverage", () => {
    const summary = publicPostAbuseMatrixSummary();
    expect(summary.era17HardenedCount).toBe(6);
    expect(summary.p1Count).toBeGreaterThanOrEqual(6);
  });
});
