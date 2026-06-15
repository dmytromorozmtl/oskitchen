import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  NULL_REFERENCE_REGRESSION_CASES,
  NULL_REFERENCE_REGRESSION_EXPECTED_COUNT,
  NULL_REFERENCE_REGRESSION_GUARDS_MODULE,
  NULL_REFERENCE_REGRESSION_POLICY_ID,
} from "@/lib/safety/null-reference-regression-policy";
import {
  MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE,
  filterRecordsWithId,
  isMarketplacePOLineItemDelegate,
  resolveMealPrepCustomerName,
  resolveOperatorSinceDate,
  resolvePlaybookTopPick,
  resolveSettledOrderHubTabCounts,
  shouldRenderPlaybookTodayStrip,
} from "@/lib/safety/null-reference-guards";

const ROOT = process.cwd();

describe("null reference regression suite", () => {
  it("locks policy with 6 documented cases", () => {
    expect(NULL_REFERENCE_REGRESSION_POLICY_ID).toBe("absolute-final-null-reference-v1");
    expect(NULL_REFERENCE_REGRESSION_CASES).toHaveLength(NULL_REFERENCE_REGRESSION_EXPECTED_COUNT);
    expect(NULL_REFERENCE_REGRESSION_EXPECTED_COUNT).toBe(6);
  });

  it("case 1 — today profile.createdAt falls back to now", () => {
    const fixed = new Date("2026-06-01T12:00:00.000Z");
    expect(resolveOperatorSinceDate(undefined, fixed)).toEqual(fixed);
    expect(resolveOperatorSinceDate(null, fixed)).toEqual(fixed);
    expect(resolveOperatorSinceDate(new Date("2025-01-01"), fixed)).toEqual(
      new Date("2025-01-01"),
    );
  });

  it("case 2 — playbook strip hidden when no recommendation and no active runs", () => {
    expect(shouldRenderPlaybookTodayStrip([], [])).toBe(false);
    expect(shouldRenderPlaybookTodayStrip([], [{ id: "run-1" }])).toBe(true);
    expect(shouldRenderPlaybookTodayStrip([{ id: "pb-1" }], [])).toBe(true);
    expect(resolvePlaybookTopPick([])).toBeUndefined();
    expect(resolvePlaybookTopPick([{ id: "pb-1", title: "Open" }])).toEqual({
      id: "pb-1",
      title: "Open",
    });
  });

  it("case 3 — meal prep customer name never null", () => {
    expect(resolveMealPrepCustomerName(null, null)).toBe("");
    expect(resolveMealPrepCustomerName(undefined, "  Jane  ")).toBe("Jane");
    expect(resolveMealPrepCustomerName("  Alex  ", null)).toBe("Alex");
    expect(resolveMealPrepCustomerName("   ", "Fallback")).toBe("Fallback");
  });

  it("case 4 — marketplace PO line item Prisma delegate is correct", () => {
    expect(MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE).toBe("marketplacePOLineItem");
    expect(isMarketplacePOLineItemDelegate("marketplacePOLineItem")).toBe(true);
    expect(isMarketplacePOLineItemDelegate("marketplacePoLineItem")).toBe(false);

    const serviceSource = readFileSync(
      join(ROOT, "services/marketplace/supplier-marketplace-service.ts"),
      "utf8",
    );
    expect(serviceSource).toContain(`prisma.${MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE}.findFirst`);
  });

  it("case 5 — brand analytics filters rows missing id before queries", () => {
    expect(
      filterRecordsWithId([
        { id: "brand-a", name: "A" },
        { id: null, name: "Broken" },
        { id: "  ", name: "Blank id" },
        { name: "No id" },
      ]),
    ).toEqual([{ id: "brand-a", name: "A" }]);
  });

  it("case 6 — order hub tab counts settle rejections to zero rows", () => {
    const tabs = [
      { id: "all", label: "All" },
      { id: "missing_customer", label: "Missing customer" },
    ] as const;

    const settled = resolveSettledOrderHubTabCounts(
      [
        {
          status: "fulfilled",
          value: {
            id: "all",
            label: "All",
            internal: 3,
            external: 2,
            total: 5,
          },
        },
        {
          status: "rejected",
          reason: new Error("count timeout"),
        },
      ],
      tabs,
    );

    expect(settled[0]?.total).toBe(5);
    expect(settled[1]).toEqual({
      id: "missing_customer",
      label: "Missing customer",
      internal: 0,
      external: 0,
      total: 0,
    });
  });

  it("wires guards module referenced by policy", () => {
    expect(existsGuardModule()).toBe(true);
  });

  it("order hub service uses settled tab count guard", () => {
    const source = readFileSync(
      join(ROOT, "services/order-hub/order-hub-exact-counts-service.ts"),
      "utf8",
    );
    expect(source).toContain("resolveSettledOrderHubTabCounts");
    expect(source).toContain("Promise.allSettled");
  });
});

function existsGuardModule(): boolean {
  try {
    readFileSync(join(ROOT, NULL_REFERENCE_REGRESSION_GUARDS_MODULE), "utf8");
    return true;
  } catch {
    return false;
  }
}
