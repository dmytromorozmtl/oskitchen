import { describe, expect, it } from "vitest";

import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildOwnerDailyBriefingOperationalEmptyState,
  dedupeOwnerDailyBriefingHeroTilesByCategory,
  finalizeOwnerDailyBriefingTopActions,
  normalizeBriefingActionPath,
  resolveBriefingP0ProofBlockedLabel,
} from "@/lib/briefing/owner-daily-briefing-production-grade-era20";
import { OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-production-grade-era20-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

function action(
  partial: Partial<OwnerDailyBriefingRankedAction> & Pick<OwnerDailyBriefingRankedAction, "id" | "priority" | "href">,
): OwnerDailyBriefingRankedAction {
  return {
    title: partial.title ?? partial.id,
    reason: "test",
    severity: "normal",
    ownerRole: "owner",
    status: "open",
    unblockCondition: "test",
    ctaLabel: "Open",
    tone: "normal",
    ...partial,
  };
}

describe("owner-daily-briefing-production-grade-era20", () => {
  it("locks era20 production-grade policy id", () => {
    expect(OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID).toBe(
      "era20-owner-daily-briefing-production-grade-v1",
    );
  });

  it("normalizes href paths for dedupe", () => {
    expect(normalizeBriefingActionPath("/dashboard/integration-health#smoke")).toBe(
      "/dashboard/integration-health",
    );
  });

  it("keeps one launch wizard and one integration health action", () => {
    const finalized = finalizeOwnerDailyBriefingTopActions([
      action({ id: "smoke", priority: 1, href: "/dashboard/integration-health#smoke" }),
      action({ id: "recovery", priority: 2, href: "/dashboard/integration-health#recovery" }),
      action({ id: "commercial", priority: 3, href: LAUNCH_WIZARD_ROUTE }),
      action({ id: "setup", priority: 4, href: `${LAUNCH_WIZARD_ROUTE}?step=pos` }),
      action({ id: "hub", priority: 5, href: "/dashboard/order-hub" }),
    ]);
    expect(finalized).toHaveLength(3);
    expect(finalized.map((a) => a.id)).toEqual(["smoke", "commercial", "hub"]);
  });

  it("dedupes hero tiles by category", () => {
    const tiles = dedupeOwnerDailyBriefingHeroTilesByCategory([
      {
        id: "a",
        category: "orders",
        label: "Orders",
        value: "1",
        detail: "",
        whyItMatters: "",
        href: "/dashboard/order-hub",
        availability: "available",
        linkState: "operational",
        tone: "neutral",
        priority: 1,
      },
      {
        id: "b",
        category: "orders",
        label: "Orders dup",
        value: "2",
        detail: "",
        whyItMatters: "",
        href: "/dashboard/orders",
        availability: "available",
        linkState: "operational",
        tone: "neutral",
        priority: 2,
      },
      {
        id: "c",
        category: "kitchen",
        label: "KDS",
        value: "3",
        detail: "",
        whyItMatters: "",
        href: "/dashboard/kitchen",
        availability: "available",
        linkState: "operational",
        tone: "neutral",
        priority: 3,
      },
    ]);
    expect(tiles).toHaveLength(2);
    expect(tiles.map((t) => t.category)).toEqual(["orders", "kitchen"]);
  });

  it("builds operational empty state when no ranked actions", () => {
    const state = buildOwnerDailyBriefingOperationalEmptyState({
      topActionsCount: 0,
      activeOrders: 4,
      readinessOverall: 80,
      riskAllClear: true,
    });
    expect(state?.title).toContain("No ranked blockers");
    expect(state?.href).toBe("/dashboard/order-hub");
  });

  it("labels P0 blocked honestly", () => {
    expect(resolveBriefingP0ProofBlockedLabel("awaiting_ops_credentials")).toContain(
      "ops credentials",
    );
    expect(resolveBriefingP0ProofBlockedLabel("proof_passed")).toBeNull();
  });
});
