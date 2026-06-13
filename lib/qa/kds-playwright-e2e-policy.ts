/**
 * Blueprint P1-19 — KDS Playwright E2E (order → KDS → bump → expo → DONE).
 *
 * @see e2e/kds-playwright.spec.ts
 * @see lib/kitchen/kds-bump-expo-e2e-policy.ts
 * @see e2e/helpers/pos-checkout-shift-flow.ts
 */

export {
  KDS_BUMP_EXPO_EXPO_VISIBLE_MS,
  KDS_BUMP_EXPO_TICKET_VISIBLE_MS,
  KDS_BUMP_NEXT_BUTTON_TEST_ID,
  KDS_EXPO_LANE_READY_TEST_ID,
  KDS_EXPO_PATH,
  KDS_EXPO_TICKET_TEST_ID,
  KDS_EXPO_VIEW_ROOT_TEST_ID,
  KDS_KITCHEN_PATH,
  KDS_SECTION_READY_TEST_ID,
  kdsTicketNextActionTestId,
  kdsTicketTestId,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";

export { POS_SHIFTS_PATH } from "@/lib/pos/pos-checkout-shift-report-e2e-policy";

export const KDS_PLAYWRIGHT_E2E_POLICY_ID = "kds-playwright-e2e-v1" as const;

export const KDS_PLAYWRIGHT_ORDER_DETAIL_PATH = "/dashboard/orders" as const;
export const KDS_PLAYWRIGHT_ORDER_COMPLETED_LABEL = "Completed" as const;
export const KDS_PLAYWRIGHT_COMPLETE_ORDER_BUTTON = "Complete order" as const;

export const KDS_PLAYWRIGHT_VISIBLE_MS = 60_000 as const;

export const KDS_PLAYWRIGHT_E2E_SPEC = "e2e/kds-playwright.spec.ts" as const;
export const KDS_PLAYWRIGHT_FLOW_HELPER = "e2e/helpers/kds-playwright-flow.ts" as const;
export const KDS_PLAYWRIGHT_READY_HELPER = "e2e/helpers/kds-playwright-ready.ts" as const;
export const KDS_PLAYWRIGHT_AUDIT_SCRIPT = "scripts/audit-kds-playwright-e2e.ts" as const;
export const KDS_PLAYWRIGHT_NPM_SCRIPT = "audit:kds-playwright-e2e" as const;
export const KDS_PLAYWRIGHT_UNIT_TEST = "tests/unit/kds-playwright-e2e.test.ts" as const;
export const KDS_PLAYWRIGHT_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const KDS_PLAYWRIGHT_FLOW_STEPS = [
  "open_shift",
  "pos_order",
  "kds_ticket",
  "bump_ready",
  "expo_lane",
  "complete_order",
] as const;

export type KdsPlaywrightFlowStep = (typeof KDS_PLAYWRIGHT_FLOW_STEPS)[number];

export function kdsPlaywrightOrderDetailPath(orderId: string): string {
  return `${KDS_PLAYWRIGHT_ORDER_DETAIL_PATH}/${orderId}`;
}

export function hasKdsPlaywrightCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isKdsPlaywrightE2EEnabled(): boolean {
  return process.env.E2E_KDS_PLAYWRIGHT?.trim() === "true";
}

export function isKdsPlaywrightGateEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KDS_V1_CERTIFIED?.trim() === "true"
  );
}
