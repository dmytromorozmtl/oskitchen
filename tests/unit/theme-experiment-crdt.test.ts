import { describe, expect, it } from "vitest";

import { bumpVersionVector, mergeVersionVectorOnSync, readVersionVector } from "@/lib/storefront/theme-experiment-crdt";

describe("theme-experiment-crdt", () => {
  it("bumps db logical version", () => {
    const v0 = readVersionVector(null, 0);
    const v1 = bumpVersionVector(v0, "db");
    expect(v1.db).toBe(1);
    expect(v1.logical).toBe(1);
  });

  it("merges edge version on sync", () => {
    const merged = mergeVersionVectorOnSync(readVersionVector({ version: 3 }, 3), 3);
    expect(merged.edge).toBe(3);
    expect(merged.logical).toBe(3);
  });
});
