import { describe, expect, it } from "vitest";

import {
  marketplaceBriefingAlertToRankedAction,
  mergeMarketplaceBriefingIntoTopActions,
  type MarketplaceBriefingAlert,
} from "@/lib/marketplace/briefing-integration-types";

describe("marketplace briefing integration types", () => {
  const approvalAlert: MarketplaceBriefingAlert = {
    id: "po-approval-batch",
    kind: "po_approval",
    title: "3 marketplace POs require approval",
    detail: "Pending purchase orders exceed your approval queue threshold.",
    href: "/dashboard/marketplace/orders?status=PENDING_APPROVAL",
    severity: "high",
    priority: 12,
  };

  it("maps PO approval alerts to owner-ranked briefing actions", () => {
    const action = marketplaceBriefingAlertToRankedAction(approvalAlert);
    expect(action.id).toBe("marketplace-po-approval-batch");
    expect(action.ownerRole).toBe("owner");
    expect(action.ctaLabel).toBe("Review POs");
    expect(action.tone).toBe("urgent");
  });

  it("merges marketplace alerts ahead of existing briefing actions by priority", () => {
    const merged = mergeMarketplaceBriefingIntoTopActions(
      [
        {
          id: "existing-low",
          title: "Review labor schedule",
          reason: "Coverage gap tomorrow",
          severity: "normal",
          ownerRole: "manager",
          href: "/dashboard/labor",
          status: "open",
          unblockCondition: "Fill shift",
          priority: 40,
          ctaLabel: "Open labor",
          tone: "normal",
        },
      ],
      [approvalAlert],
    );
    expect(merged[0]?.id).toBe("marketplace-po-approval-batch");
    expect(merged).toHaveLength(2);
  });

  it("maps budget threshold alerts to analytics CTA", () => {
    const action = marketplaceBriefingAlertToRankedAction({
      id: "budget-threshold",
      kind: "budget_threshold",
      title: "Marketplace budget at 85%+ used",
      detail: "$4,250 of $5,000 monthly budget consumed.",
      href: "/dashboard/marketplace/analytics",
      severity: "high",
      priority: 18,
    });
    expect(action.ctaLabel).toBe("View analytics");
    expect(action.ownerRole).toBe("manager");
  });
});
