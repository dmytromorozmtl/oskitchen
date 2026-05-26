import { describe, expect, it } from "vitest";

import { canMarkReady, summariseChecks } from "@/lib/implementation/go-live-readiness";
import type { ReadinessCheckResult } from "@/lib/implementation/implementation-types";

function check(input: Partial<ReadinessCheckResult> & Pick<ReadinessCheckResult, "title">): ReadinessCheckResult {
  return {
    category: input.category ?? "sales_channels",
    title: input.title,
    required: input.required ?? false,
    status: input.status ?? "PASS",
    explanation: input.explanation ?? input.title,
    actionRoute: input.actionRoute,
    resultJson: input.resultJson,
  };
}

describe("implementation go-live readiness", () => {
  it("stays blocked when a required check fails even with a high score", () => {
    const snapshot = summariseChecks([
      check({ title: "Business name set", required: true, status: "PASS" }),
      check({ title: "Products in catalog", required: true, status: "PASS" }),
      check({ title: "External integrations certified for go-live", required: true, status: "FAIL" }),
      check({ title: "Reports saved", status: "PASS" }),
      check({ title: "Training completions", status: "PASS" }),
      check({ title: "Analytics events firing", status: "PASS" }),
      check({ title: "Support contact confirmed", status: "PASS" }),
      check({ title: "Packing tasks ready", status: "PASS" }),
    ]);

    expect(snapshot.score).toBeGreaterThanOrEqual(85);
    expect(snapshot.band).toBe("blocked");
    expect(canMarkReady(snapshot)).toBe(false);
  });

  it("only allows go-live when readiness is fully ready", () => {
    expect(
      canMarkReady({
        score: 74,
        band: "needs_work",
        blockers: [],
        warnings: ["Training completions"],
        checkedAt: new Date().toISOString(),
        checks: [],
      }),
    ).toBe(false);

    expect(
      canMarkReady({
        score: 100,
        band: "ready",
        blockers: [],
        warnings: [],
        checkedAt: new Date().toISOString(),
        checks: [],
      }),
    ).toBe(true);
  });
});
