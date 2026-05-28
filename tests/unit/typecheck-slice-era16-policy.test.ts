import { describe, expect, it } from "vitest";

import {
  TYPECHECK_SLICE_ERA16_FORBIDDEN_CLAIMS,
  TYPECHECK_SLICE_ERA16_HONEST_SCOPE,
  TYPECHECK_SLICE_ERA16_POLICY_ID,
  TYPECHECK_SLICE_ERA16_REPORT_NPM_SCRIPT,
  TYPECHECK_SLICE_ERA16_SLICE_COUNT,
} from "@/lib/ci/typecheck-slice-era16-policy";
import { TYPECHECK_SLICE_REPORT_VERSION } from "@/lib/ci/typecheck-slice-report";

describe("typecheck slice era16 policy", () => {
  it("locks era16 typecheck slice reporting policy id", () => {
    expect(TYPECHECK_SLICE_ERA16_POLICY_ID).toBe("era16-typecheck-slice-report-v1");
    expect(TYPECHECK_SLICE_REPORT_VERSION).toBe("era16-typecheck-slice-report-v1");
  });

  it("does not claim slices replace full typecheck", () => {
    expect(TYPECHECK_SLICE_ERA16_HONEST_SCOPE.replacesFullTypecheck).toBe(false);
    expect(TYPECHECK_SLICE_ERA16_HONEST_SCOPE.addsNewStrictSlice).toBe(false);
    expect(TYPECHECK_SLICE_ERA16_HONEST_SCOPE.reportsAllSliceFailures).toBe(true);
  });

  it("tracks four strict slices without adding a fifth", () => {
    expect(TYPECHECK_SLICE_ERA16_SLICE_COUNT).toBe(4);
  });

  it("defines report npm script name", () => {
    expect(TYPECHECK_SLICE_ERA16_REPORT_NPM_SCRIPT).toBe("typecheck:report:slices");
  });

  it("forbids false canonical claims", () => {
    expect(TYPECHECK_SLICE_ERA16_FORBIDDEN_CLAIMS.length).toBeGreaterThan(0);
  });
});
