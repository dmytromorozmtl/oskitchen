import { describe, expect, it } from "vitest";

import { evaluateContinuousImprovementLoop } from "../../scripts/ops/validate-continuous-improvement-loop";

describe("validate-continuous-improvement-loop", () => {
  it("reads artifacts without throwing", () => {
    expect(() => evaluateContinuousImprovementLoop({})).not.toThrow();
  });

  it("reports not in pure operational mode with honest NO-GO", () => {
    const result = evaluateContinuousImprovementLoop({});
    expect(result.pureOperationalMode).toBe(false);
    expect(result.tracks).toHaveLength(7);
    expect(result.improvementLoopMilestone).toBe("sustained_ops_blocked");
    expect(result.goDecision === "NO-GO" || result.goDecision === null).toBe(true);
  });
});
