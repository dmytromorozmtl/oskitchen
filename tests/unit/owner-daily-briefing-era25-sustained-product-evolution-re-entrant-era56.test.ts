import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25SustainedProductEvolutionReentrantAction,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-sustained-product-evolution-re-entrant-era56";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-sustained-product-evolution-re-entrant-era56", () => {
  it("returns meta action at priority 31 when re-entrant visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
    });
    const action = buildOwnerDailyBriefingEra25SustainedProductEvolutionReentrantAction(
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-sustained-product-evolution-re-entrant");
  });
});
