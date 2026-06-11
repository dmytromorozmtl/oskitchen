import { expect, test } from "@playwright/test";

import {
  KDS_BUMP_EXPO_E2E_POLICY_ID,
  KDS_BUMP_EXPO_FLOW_STEPS,
  KDS_EXPO_PATH,
  KDS_EXPO_VIEW_ROOT_TEST_ID,
  KDS_KITCHEN_PATH,
  kdsTicketTestId,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";
import { resolveExpoLane } from "@/lib/kitchen/kds-expo-view";
import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";

import { runKdsBumpExpoFlow } from "./helpers/kds-bump-expo-flow";
import {
  skipKdsBumpExpoIfGateDisabled,
  skipKdsBumpExpoIfNotAuthed,
} from "./helpers/kds-bump-expo-ready";

/**
 * KDS bump → expo golden path.
 *
 * POS order → kitchen ticket → bump to ready → expo ready lane.
 *
 * @see e2e/kds-staging.spec.ts
 * @see e2e/kds-bump-packing-route.spec.ts
 */

test.describe("kds bump expo policy", () => {
  test("exports kitchen flow route and testid contract", () => {
    expect(KDS_BUMP_EXPO_E2E_POLICY_ID).toBe("kds-bump-expo-e2e-v1");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(KDS_EXPO_PATH).toBe("/dashboard/kitchen/expo");
    expect(KDS_EXPO_VIEW_ROOT_TEST_ID).toBe("kds-expo-view-root");
    expect(kdsTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
    expect(KDS_BUMP_EXPO_FLOW_STEPS).toEqual([
      "pos_order",
      "kds_ticket",
      "bump_ready",
      "expo_lane",
    ]);
  });

  test("maps bumped READY tickets to expo ready lane", () => {
    expect(
      resolveExpoLane({
        status: "READY",
        elapsedSeconds: 120,
        dueAtIso: null,
      }),
    ).toBe("ready");
  });

  test("formats expo ticket numbers from order ids", () => {
    const orderId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    expect(formatKdsTicketNumber(orderId)).toMatch(/^#[A-F0-9]{6}$/);
  });
});

test.describe("kds bump expo (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "KDS bump → expo runs in chromium-authed project only",
    );
    skipKdsBumpExpoIfGateDisabled();
    skipKdsBumpExpoIfNotAuthed();
  });

  test("POS order bumps on KDS and appears on expo ready lane", async ({ page }) => {
    const result = await runKdsBumpExpoFlow(page);
    expect(result.steps).toEqual(KDS_BUMP_EXPO_FLOW_STEPS);
    expect(result.orderId.length).toBeGreaterThan(0);
    expect(result.ticketNumber).toMatch(/^#[A-F0-9]{6}$/);
  });
});
