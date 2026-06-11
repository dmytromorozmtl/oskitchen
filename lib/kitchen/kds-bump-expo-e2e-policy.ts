/**
 * Blueprint P1-43 — KDS bump → expo E2E (kitchen flow).
 *
 * @see e2e/kds-bump-expo.spec.ts
 * @see app/dashboard/kitchen/expo/page.tsx
 * @see components/kitchen/expo-view-client.tsx
 */

import { KDS_EXPO_VIEW_ROUTE } from "@/lib/kitchen/kds-expo-view-policy";

export const KDS_BUMP_EXPO_E2E_POLICY_ID = "kds-bump-expo-e2e-v1" as const;

export const KDS_KITCHEN_PATH = "/dashboard/kitchen" as const;
export const KDS_EXPO_PATH = KDS_EXPO_VIEW_ROUTE;

export const KDS_SECTION_READY_TEST_ID = "kds-section-ready" as const;
export const KDS_EXPO_VIEW_ROOT_TEST_ID = "kds-expo-view-root" as const;
export const KDS_EXPO_LANE_READY_TEST_ID = "kds-expo-lane-ready" as const;
export const KDS_EXPO_TICKET_TEST_ID = "kds-expo-ticket" as const;
export const KDS_BUMP_NEXT_BUTTON_TEST_ID = "kds-bump-next-button" as const;

export const KDS_BUMP_EXPO_TICKET_VISIBLE_MS = 15_000 as const;
export const KDS_BUMP_EXPO_EXPO_VISIBLE_MS = 30_000 as const;

export const KDS_BUMP_EXPO_E2E_SPEC = "e2e/kds-bump-expo.spec.ts" as const;
export const KDS_BUMP_EXPO_FLOW_HELPER = "e2e/helpers/kds-bump-expo-flow.ts" as const;
export const KDS_BUMP_EXPO_READY_HELPER = "e2e/helpers/kds-bump-expo-ready.ts" as const;
export const KDS_BUMP_EXPO_AUDIT_SCRIPT = "scripts/audit-kds-bump-expo-e2e.ts" as const;
export const KDS_BUMP_EXPO_NPM_SCRIPT = "audit:kds-bump-expo-e2e" as const;
export const KDS_BUMP_EXPO_UNIT_TEST = "tests/unit/kds-bump-expo-e2e.test.ts" as const;
export const KDS_BUMP_EXPO_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const KDS_BUMP_EXPO_FLOW_STEPS = [
  "pos_order",
  "kds_ticket",
  "bump_ready",
  "expo_lane",
] as const;

export type KdsBumpExpoFlowStep = (typeof KDS_BUMP_EXPO_FLOW_STEPS)[number];

export const KDS_BUMP_EXPO_READY_LANE = "ready" as const;

export function kdsTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

export function kdsTicketNextActionTestId(orderId: string): string {
  return `kds-ticket-next-action-${orderId}`;
}

export function isKdsBumpExpoGateEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KDS_V1_CERTIFIED?.trim() === "true"
  );
}

export function hasKdsBumpExpoCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}
