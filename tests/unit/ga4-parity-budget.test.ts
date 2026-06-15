import { describe, expect, it } from "vitest";

import { computeGa4ParityErrorBudget } from "@/lib/storefront/ga4-parity-budget";
import type { Ga4ParityHistoryPoint } from "@/lib/storefront/ga4-parity-json";

describe("computeGa4ParityErrorBudget", () => {
  it("counts drift calendar days in window", () => {
    const history: Ga4ParityHistoryPoint[] = [
      {
        at: new Date().toISOString(),
        status: "drift",
        parityScorePp: 5,
        firstPartyLiftPp: 3,
        ga4LiftPp: 8,
      },
      {
        at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "ok",
        parityScorePp: 1,
        firstPartyLiftPp: 2,
        ga4LiftPp: 1,
      },
    ];
    const b = computeGa4ParityErrorBudget(history, { budgetDays: 3, windowDays: 30 });
    expect(b.driftDays).toBe(1);
    expect(b.status).toBe("healthy");
  });

  it("marks exhausted at budget", () => {
    const now = Date.now();
    const history: Ga4ParityHistoryPoint[] = [0, 1, 2].map((d) => ({
      at: new Date(now - d * 24 * 60 * 60 * 1000).toISOString(),
      status: "drift" as const,
      parityScorePp: 4,
      firstPartyLiftPp: 2,
      ga4LiftPp: 6,
    }));
    const b = computeGa4ParityErrorBudget(history, { budgetDays: 3 });
    expect(b.status).toBe("exhausted");
    expect(b.remainingDays).toBe(0);
  });
});
