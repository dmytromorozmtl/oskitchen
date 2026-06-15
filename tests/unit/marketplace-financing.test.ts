import { describe, expect, it } from "vitest";

import {
  buildEarlyPaymentOffers,
  buildFactoringOffers,
  buildMarketplaceFinancingSnapshot,
  buildNetTermsTermProducts,
} from "@/lib/marketplace/financing-builders";
import {
  MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT,
  MARKETPLACE_FINANCING_PATH,
  MARKETPLACE_FINANCING_POLICY_ID,
  MARKETPLACE_FINANCING_SERVICE,
} from "@/lib/marketplace/financing-policy";

describe("Marketplace Financing", () => {
  it("locks policy constants", () => {
    expect(MARKETPLACE_FINANCING_POLICY_ID).toBe("marketplace-financing-v1");
    expect(MARKETPLACE_FINANCING_SERVICE).toBe("services/marketplace/financing.ts");
    expect(MARKETPLACE_FINANCING_PATH).toBe("/dashboard/marketplace/financing");
    expect(MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT).toBe(2);
  });

  it("builds net-30/60/90 term products with eligibility", () => {
    const terms = buildNetTermsTermProducts({ activeDays: 30, gmv90Usd: 6000, capitalFunded: false });
    expect(terms).toHaveLength(3);
    expect(terms[0]?.eligible).toBe(true);
    expect(terms[1]?.eligible).toBe(true);
    expect(terms[2]?.eligible).toBe(false);
    expect(terms[0]?.isActive).toBe(true);
  });

  it("builds early payment offers from schedules", () => {
    const offers = buildEarlyPaymentOffers(
      [
        {
          id: "sched-1",
          workspaceId: "ws-1",
          orderIds: ["o1"],
          totalUsd: 500,
          netTermsDays: 30,
          createdAt: new Date().toISOString(),
          entries: [
            {
              dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
              amountUsd: 500,
              status: "scheduled",
              orderId: "o1",
              poNumber: "PO-100",
            },
          ],
        },
      ],
      new Date(),
    );
    expect(offers).toHaveLength(1);
    expect(offers[0]?.discountPercent).toBe(2);
    expect(offers[0]?.discountUsd).toBe(10);
  });

  it("assembles financing snapshot", () => {
    const snapshot = buildMarketplaceFinancingSnapshot({
      workspaceId: "ws-1",
      currency: "USD",
      creditLine: {
        limitUsd: 10000,
        usedUsd: 2500,
        availableUsd: 7500,
        activeNetTermsDays: 60,
        source: "gmv_derived",
      },
      termProducts: buildNetTermsTermProducts({ activeDays: 60, gmv90Usd: 12000, capitalFunded: true }),
      earlyPaymentOffers: [],
      factoringOffers: buildFactoringOffers({
        receivablesUsd: 3200,
        partners: [
          {
            slug: "factoring-a",
            name: "Capital A",
            title: "Invoice factoring",
            deepLink: "/capital",
            advanceRatePercent: 88,
            feePercent: 2.5,
          },
        ],
      }),
    });

    expect(snapshot.policyId).toBe(MARKETPLACE_FINANCING_POLICY_ID);
    expect(snapshot.basePath).toBe(MARKETPLACE_FINANCING_PATH);
    expect(snapshot.summary.activeTermLabel).toBe("Net-60");
    expect(snapshot.summary.factoringEligibleUsd).toBe(3200);
    expect(snapshot.factoringOffers[0]?.advanceUsd).toBe(2816);
  });
});
