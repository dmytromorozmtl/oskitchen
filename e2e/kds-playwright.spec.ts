import { expect, test } from "@playwright/test";

import { resolveExpoLane } from "@/lib/kitchen/kds-expo-view";
import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  KDS_KITCHEN_PATH,
  KDS_PLAYWRIGHT_E2E_POLICY_ID,
  KDS_PLAYWRIGHT_FLOW_STEPS,
  KDS_PLAYWRIGHT_ORDER_COMPLETED_LABEL,
  KDS_PLAYWRIGHT_ORDER_DETAIL_PATH,
  kdsPlaywrightOrderDetailPath,
  kdsTicketTestId,
} from "@/lib/qa/kds-playwright-e2e-policy";

import { runKdsPlaywrightFlow } from "./helpers/kds-playwright-flow";
import {
  skipKdsPlaywrightIfE2EGateDisabled,
  skipKdsPlaywrightIfGateDisabled,
  skipKdsPlaywrightIfNotAuthed,
} from "./helpers/kds-playwright-ready";

/**
 * KDS Playwright golden path — open shift → POS order → KDS ticket → bump → expo → complete.
 *
 * @see e2e/kds-bump-expo.spec.ts
 * @see e2e/kds-staging.spec.ts
 * @see e2e/pos-shift-checkout-receipt.spec.ts
 */

test.describe("kds playwright policy", () => {
  test("exports full kitchen lifecycle flow steps", () => {
    expect(KDS_PLAYWRIGHT_E2E_POLICY_ID).toBe("kds-playwright-e2e-v1");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(KDS_PLAYWRIGHT_ORDER_DETAIL_PATH).toBe("/dashboard/orders");
    expect(KDS_PLAYWRIGHT_FLOW_STEPS).toEqual([
      "open_shift",
      "pos_order",
      "kds_ticket",
      "bump_ready",
      "expo_lane",
      "complete_order",
    ]);
    expect(kdsTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
    expect(kdsPlaywrightOrderDetailPath("abc")).toBe("/dashboard/orders/abc");
  });

  test("READY tickets map to expo ready lane before completion", () => {
    expect(
      resolveExpoLane({ status: "READY", elapsedSeconds: 90, dueAtIso: null }),
    ).toBe("ready");
  });

  test("formats ticket numbers for expo matching", () => {
    const orderId = "12345678-abcd-ef01-2345-6789abcdef01";
    expect(formatKdsTicketNumber(orderId)).toMatch(/^#[A-F0-9]{6}$/);
  });

  test("locks completed order label contract", () => {
    expect(KDS_PLAYWRIGHT_ORDER_COMPLETED_LABEL).toBe("Completed");
  });
});

test.describe("kds playwright (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "KDS Playwright E2E runs in chromium-authed project only",
    );
    skipKdsPlaywrightIfGateDisabled();
    skipKdsPlaywrightIfE2EGateDisabled();
    skipKdsPlaywrightIfNotAuthed();
  });

  test("open shift POS order flows through KDS bump expo and completes", async ({ page }) => {
    const result = await runKdsPlaywrightFlow(page);
    expect(result.steps).toEqual(KDS_PLAYWRIGHT_FLOW_STEPS);
    expect(result.shiftId.length).toBeGreaterThan(0);
    expect(result.orderId.length).toBeGreaterThan(0);
    expect(result.ticketNumber).toMatch(/^#[A-F0-9]{6}$/);
  });
});
