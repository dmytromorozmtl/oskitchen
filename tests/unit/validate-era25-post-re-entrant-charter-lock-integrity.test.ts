import { describe, expect, it } from "vitest";

import { evaluateEra25PostReentrantCharterLockIntegrity } from "@/scripts/ops/validate-era25-post-re-entrant-charter-lock-integrity";

describe("validate-era25-post-re-entrant-charter-lock-integrity", () => {
  it("re-exports era57 evaluator", () => {
    const result = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era57-era25-post-re-entrant-charter-lock-integrity-v1");
  });
});
