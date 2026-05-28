import { beforeEach, describe, expect, it, vi } from "vitest";

const requireKitchenAiActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai/require-kitchen-ai-actor", () => ({
  requireKitchenAiActor,
}));

import { requireForecastAiPageAccess } from "@/lib/forecast/require-forecast-ai-page-access";

describe("requireForecastAiPageAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to kitchen AI actor with financial read capability", async () => {
    requireKitchenAiActor.mockResolvedValue({
      ok: true,
      dataUserId: "owner-1",
    });

    const access = await requireForecastAiPageAccess();

    expect(access).toEqual({ ok: true, dataUserId: "owner-1" });
    expect(requireKitchenAiActor).toHaveBeenCalledWith({
      capability: "copilot.read.financial",
      operation: "kitchen_ai.order_forecast_page",
    });
  });

  it("returns deny result from kitchen AI actor", async () => {
    requireKitchenAiActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to use Kitchen AI tools.",
    });

    const access = await requireForecastAiPageAccess();

    expect(access).toEqual({
      ok: false,
      error: "You do not have permission to use Kitchen AI tools.",
    });
  });
});
