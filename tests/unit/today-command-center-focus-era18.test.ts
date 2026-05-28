import { describe, expect, it } from "vitest";

import {
  isTodayShiftQuiet,
  listTodayOperationalPulse,
  pickTodayAttentionItems,
  shouldCollapseTodayKpiWall,
} from "@/lib/today/today-command-center-focus-era18";
import { TODAY_COMMAND_CENTER_FOCUS_ERA18_POLICY_ID } from "@/lib/today/today-command-center-focus-era18-policy";

const quietKpis = {
  ordersDueToday: 0,
  ordersToday: 0,
  activeOrders: 0,
  openTasks: 0,
  overdueTasks: 0,
  failedWebhooks: 0,
  blockedOrdersApprox: 0,
  posTransactionsToday: 0,
  packingQueueOpen: 0,
  productionWorkOpen: 0,
  posKitchenQueueToday: 0,
};

describe("today command center focus era18", () => {
  it("locks era18 today focus policy id", () => {
    expect(TODAY_COMMAND_CENTER_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-today-command-center-focus-v1",
    );
  });

  it("detects quiet shifts without blockers or active signals", () => {
    expect(isTodayShiftQuiet(quietKpis, [])).toBe(true);
    expect(
      isTodayShiftQuiet({ ...quietKpis, packingQueueOpen: 2 }, []),
    ).toBe(false);
    expect(
      isTodayShiftQuiet(quietKpis, [
        {
          id: "mapping",
          title: "Catalog mapping backlog",
          detail: "1 SKU",
          href: "/dashboard/product-mapping",
          priority: 10,
        },
      ]),
    ).toBe(false);
  });

  it("collapses KPI wall on quiet shifts unless metrics=all", () => {
    expect(shouldCollapseTodayKpiWall({ quiet: true, showFullMetrics: false })).toBe(true);
    expect(shouldCollapseTodayKpiWall({ quiet: true, showFullMetrics: true })).toBe(false);
    expect(shouldCollapseTodayKpiWall({ quiet: false, showFullMetrics: false })).toBe(false);
  });

  it("prioritizes blockers over operational pulse items", () => {
    const blockers = [
      {
        id: "integrations",
        title: "Integration errors",
        detail: "1 connection",
        href: "/dashboard/sales-channels/health",
        priority: 12,
      },
    ];
    expect(pickTodayAttentionItems({ blockers, kpis: quietKpis })).toEqual(blockers);
  });

  it("lists operational pulse when shift is active without blockers", () => {
    const pulse = listTodayOperationalPulse({ ...quietKpis, activeOrders: 4, openTasks: 2 });
    expect(pulse.some((item) => item.id === "active-pipeline")).toBe(true);
    expect(pulse.some((item) => item.id === "open-tasks")).toBe(true);
  });
});
