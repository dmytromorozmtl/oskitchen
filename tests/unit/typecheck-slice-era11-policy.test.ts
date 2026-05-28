import { describe, expect, it } from "vitest";

import {
  TYPECHECK_SLICE_ERA11_NEW_SLICE_ID,
  TYPECHECK_SLICE_ERA11_POLICY_ID,
} from "@/lib/ci/typecheck-slice-era11-policy";
import {
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICES,
  findTypecheckSlice,
  typecheckSliceScript,
} from "@/lib/ci/typecheck-slice-policy";

describe("typecheck slice era11 policy", () => {
  it("locks era11 typecheck slice v3 policy on the registry", () => {
    expect(TYPECHECK_SLICE_ERA11_POLICY_ID).toBe("era11-typecheck-slice-v3");
    expect(TYPECHECK_SLICE_POLICY_ID).toBe(TYPECHECK_SLICE_ERA11_POLICY_ID);
    expect(TYPECHECK_SLICES).toHaveLength(4);
  });

  it("maps platform-auth slice to tsconfig and script", () => {
    expect(TYPECHECK_SLICE_ERA11_NEW_SLICE_ID).toBe("platform-auth");
    const slice = findTypecheckSlice("platform-auth");
    expect(slice.tsconfig).toBe("tsconfig.slice.platform-auth.json");
    expect(typecheckSliceScript("platform-auth")).toBe("typecheck:slice:platform-auth");
    expect(slice.heapMb).toBe(6144);
  });
});
