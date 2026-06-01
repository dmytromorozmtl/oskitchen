import { describe, expect, it } from "vitest";

import {
  marketplaceCapitalFromSettingsCenter,
  mergeMarketplaceCapitalIntoSettingsCenter,
  parseMarketplaceCapitalSettings,
} from "@/lib/marketplace/capital-integration-types";

describe("marketplace capital integration types", () => {
  it("parses capital settings from settings center", () => {
    const settings = marketplaceCapitalFromSettingsCenter({
      marketplaceCapital: {
        creditLimitUsd: 15000,
        netTermsDays: 45,
        paymentSchedules: [],
      },
    });
    expect(settings.creditLimitUsd).toBe(15000);
    expect(settings.netTermsDays).toBe(45);
  });

  it("merges payment schedules into settings center json", () => {
    const merged = mergeMarketplaceCapitalIntoSettingsCenter(
      { marketplace: { monthlyBudgetUsd: 5000 } },
      {
        paymentSchedules: [
          {
            id: "sched-1",
            workspaceId: "ws-1",
            orderIds: ["order-1"],
            totalUsd: 1200,
            netTermsDays: 30,
            createdAt: "2026-06-02T13:00:00.000Z",
            entries: [
              {
                dueDate: "2026-07-02T13:00:00.000Z",
                amountUsd: 1200,
                status: "scheduled",
                orderId: "order-1",
                poNumber: "MPO-1",
              },
            ],
          },
        ],
      },
    );
    const capital = parseMarketplaceCapitalSettings(merged.marketplaceCapital);
    expect(capital.paymentSchedules).toHaveLength(1);
    expect(merged.marketplace).toEqual({ monthlyBudgetUsd: 5000 });
  });
});
