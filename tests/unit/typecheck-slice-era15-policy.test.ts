import { describe, expect, it } from "vitest";

import {
  TYPECHECK_SLICE_ERA15_DOES_NOT_REPLACE_FULL,
  TYPECHECK_SLICE_ERA15_FULL_HEAP_MB,
  TYPECHECK_SLICE_ERA15_POLICY_ID,
  TYPECHECK_SLICE_ERA15_SLICE_HEAP_MB,
  TYPECHECK_SLICE_ERA15_SLICE_IDS,
} from "@/lib/ci/typecheck-slice-era15-policy";
import { TYPECHECK_SLICES } from "@/lib/ci/typecheck-slice-policy";

describe("typecheck slice era15 policy", () => {
  it("locks era15 typecheck slice recert policy id", () => {
    expect(TYPECHECK_SLICE_ERA15_POLICY_ID).toBe("era15-typecheck-slice-recert-v1");
    expect(TYPECHECK_SLICE_ERA15_SLICE_IDS).toEqual(TYPECHECK_SLICES.map((s) => s.id));
    expect(TYPECHECK_SLICE_ERA15_SLICE_IDS).toHaveLength(4);
    expect(TYPECHECK_SLICE_ERA15_FULL_HEAP_MB).toBe(8192);
    expect(TYPECHECK_SLICE_ERA15_SLICE_HEAP_MB).toBe(6144);
    expect(TYPECHECK_SLICE_ERA15_DOES_NOT_REPLACE_FULL).toContain("typecheck:full");
  });
});
