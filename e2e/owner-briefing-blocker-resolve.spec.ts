import { expect, test } from "@playwright/test";

import { pickOwnerDailyBriefingTopActions } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  BRIEFING_HERO_TESTID,
  BRIEFING_NEXT_ACTION_TESTID,
  INTEGRATION_HEALTH_PATH,
  OWNER_BRIEFING_BLOCKER_RESOLVE_E2E_POLICY_ID,
  TODAY_PATH,
  briefingBlockerRankedActionId,
  isAllowedBriefingResolveHref,
  isBriefingBlockerRankedActionId,
  ownerBriefingRankedActionTestId,
} from "@/lib/briefing/owner-briefing-blocker-resolve-e2e-policy";
import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";

import { runOwnerBriefingBlockerResolveFlow } from "./helpers/owner-briefing-blocker-flow";
import { skipOwnerBriefingBlockerIfNotAuthed } from "./helpers/owner-briefing-blocker-ready";

/**
 * Owner briefing → blocker click → resolve E2E.
 *
 * Today ranked blocker / next action → destination workflow → resolve CTA.
 *
 * @see components/dashboard/owner-daily-briefing-hero.tsx
 * @see e2e/dashboard-rsc-regression.spec.ts
 */

test.describe("owner briefing blocker resolve policy", () => {
  test("exports Today briefing and resolve surface contract", () => {
    expect(OWNER_BRIEFING_BLOCKER_RESOLVE_E2E_POLICY_ID).toBe(
      "owner-briefing-blocker-resolve-e2e-v1",
    );
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(BRIEFING_HERO_TESTID).toBe("owner-daily-briefing-hero");
    expect(BRIEFING_NEXT_ACTION_TESTID).toBe("owner-daily-briefing-next-action");
    expect(ownerBriefingRankedActionTestId("blocker-integration-woo")).toBe(
      "owner-briefing-action-blocker-integration-woo",
    );
    expect(isBriefingBlockerRankedActionId("blocker-integration-woo")).toBe(true);
    expect(isAllowedBriefingResolveHref("/dashboard/integration-health")).toBe(true);
    expect(isAllowedBriefingResolveHref("https://evil.example")).toBe(false);
  });

  test("maps Today blockers into ranked briefing actions", () => {
    const actions = pickOwnerDailyBriefingTopActions({
      blockers: [
        {
          id: "integration-woo",
          title: "WooCommerce webhook failing",
          detail: "Last delivery failed — orders may stall.",
          href: INTEGRATION_HEALTH_PATH,
          priority: 1,
        },
      ],
      alerts: [],
      readinessOverall: 60,
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
        webhooksNeedingAttention: 1,
        failedExternalOrders: 0,
        openSupportTickets: 0,
        overdueTasks: 0,
      },
      pilotAttentionCount: 0,
      integrationOverall: "degraded",
      lowStockCount: 0,
    });

    const blockerAction = actions.find(
      (action) => action.id === briefingBlockerRankedActionId("integration-woo"),
    );
    expect(blockerAction?.href).toBe(INTEGRATION_HEALTH_PATH);
    expect(blockerAction?.ctaLabel).toBe("Fix blocker");
    expect(isBriefingBlockerRankedActionId(blockerAction?.id ?? "")).toBe(true);
  });

  test("go-live blocker rows expose fix next-action hrefs", () => {
    const blocker: LaunchBlocker = {
      key: "no_billing",
      severity: "CRITICAL",
      stage: "FINANCIAL_VALIDATION",
      title: "Billing not configured",
      impact: "Cannot collect payments",
      resolution: "Connect Stripe billing",
      actionRoute: "/dashboard/billing",
    };
    const action = resolveGoLiveBlockerRowNextAction(blocker);
    expect(action?.label).toBe("Fix blocker");
    expect(isAllowedBriefingResolveHref(action?.href ?? "")).toBe(true);
  });
});

test.describe("owner briefing blocker resolve (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Owner briefing blocker resolve runs in chromium-authed project only",
    );
    skipOwnerBriefingBlockerIfNotAuthed();
  });

  test("briefing blocker click opens resolve workflow without RSC failure", async ({ page }) => {
    const result = await runOwnerBriefingBlockerResolveFlow(page);
    if (!result) {
      test.skip(true, "Today briefing has no blockers or next actions — tenant fully clear.");
    }

    expect(result.destinationPath.startsWith("/dashboard") || result.destinationPath.startsWith("/help")).toBe(
      true,
    );
    expect(["ranked_blocker_action", "ranked_action", "next_action", "today_blocker_link", "integration_lane_row"]).toContain(
      result.clickedSurface,
    );
  });
});
