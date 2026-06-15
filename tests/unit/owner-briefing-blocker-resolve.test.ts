import { describe, expect, it } from "vitest";

import { pickOwnerDailyBriefingTopActions } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  BRIEFING_RANKED_ACTION_TESTID_PREFIX,
  INTEGRATION_HEALTH_PATH,
  OWNER_BRIEFING_BLOCKER_RESOLVE_E2E_POLICY_ID,
  TODAY_PATH,
  briefingBlockerRankedActionId,
  isBriefingBlockerRankedActionId,
  ownerBriefingRankedActionTestId,
} from "@/lib/briefing/owner-briefing-blocker-resolve-e2e-policy";
import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";

describe("Owner briefing blocker resolve lifecycle (QA-20)", () => {
  it("exports E2E policy id and Today path", () => {
    expect(OWNER_BRIEFING_BLOCKER_RESOLVE_E2E_POLICY_ID).toBe(
      "owner-briefing-blocker-resolve-e2e-v1",
    );
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(BRIEFING_RANKED_ACTION_TESTID_PREFIX).toBe("owner-briefing-action-");
  });

  it("builds ranked blocker actions with stable test ids", () => {
    const actions = pickOwnerDailyBriefingTopActions({
      blockers: [
        {
          id: "stuck-order-hub",
          title: "Orders blocked in hub",
          detail: "2 orders need routing.",
          href: "/dashboard/order-hub",
          priority: 3,
        },
      ],
      alerts: [],
      readinessOverall: 55,
      kpis: {
        ordersToday: 2,
        ordersDueToday: 1,
        activeOrders: 2,
        blockedOrdersApprox: 2,
        posKitchenQueueToday: 0,
        posTransactionsToday: 0,
        productionWorkOpen: 0,
        packingQueueOpen: 0,
        revenueToday: 0,
        errorIntegrations: 0,
        webhooksNeedingAttention: 0,
        failedExternalOrders: 0,
        openSupportTickets: 0,
        overdueTasks: 0,
      },
      pilotAttentionCount: 0,
      integrationOverall: "healthy",
      lowStockCount: 0,
    });

    const blockerId = briefingBlockerRankedActionId("stuck-order-hub");
    expect(isBriefingBlockerRankedActionId(blockerId)).toBe(true);
    expect(ownerBriefingRankedActionTestId(blockerId)).toBe(
      `${BRIEFING_RANKED_ACTION_TESTID_PREFIX}${blockerId}`,
    );
    expect(actions.some((action) => action.id === blockerId)).toBe(true);
  });

  it("integration degradation surfaces health center resolve href", () => {
    const actions = pickOwnerDailyBriefingTopActions({
      blockers: [],
      alerts: [],
      readinessOverall: 70,
      kpis: {
        ordersToday: 0,
        ordersDueToday: 0,
        activeOrders: 0,
        blockedOrdersApprox: 0,
        posKitchenQueueToday: 0,
        posTransactionsToday: 0,
        productionWorkOpen: 0,
        packingQueueOpen: 0,
        revenueToday: 0,
        errorIntegrations: 1,
        webhooksNeedingAttention: 0,
        failedExternalOrders: 0,
        openSupportTickets: 0,
        overdueTasks: 0,
      },
      pilotAttentionCount: 0,
      integrationOverall: "degraded",
      lowStockCount: 0,
    });

    const integrationAction = actions.find((action) => action.id === "integration-health-action");
    expect(integrationAction?.href).toBe(INTEGRATION_HEALTH_PATH);
  });

  it("go-live blocker next action links to dashboard modules", () => {
    const blocker: LaunchBlocker = {
      key: "external_integrations",
      severity: "HIGH_RISK",
      stage: "INTEGRATION_VALIDATION",
      title: "External integrations not certified",
      impact: "Channel orders may fail",
      resolution: "Run integration health checks",
      actionRoute: INTEGRATION_HEALTH_PATH,
    };
    const action = resolveGoLiveBlockerRowNextAction(blocker);
    expect(action?.href).toBe(INTEGRATION_HEALTH_PATH);
    expect(action?.tone).toBe("urgent");
  });
});
