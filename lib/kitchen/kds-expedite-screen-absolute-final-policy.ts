/**
 * Absolute Final Task 94 — expedite screen polish.
 *
 * @see app/dashboard/kitchen/expedite/page.tsx
 * @see components/kitchen/kds-expedite-screen.tsx
 */

import type { KdsPriorityLaneItem } from "@/lib/kitchen/kds-priority-lane-era19";
import type { KdsRushModeSnapshot } from "@/lib/kitchen/kds-rush-mode";

export const KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID =
  "kds-expedite-screen-absolute-final-v1" as const;

export const KDS_EXPEDITE_SCREEN_ROUTE = "/dashboard/kitchen/expedite" as const;

export const KDS_EXPEDITE_SCREEN_PAGE_PATH = "app/dashboard/kitchen/expedite/page.tsx" as const;

export const KDS_EXPEDITE_SCREEN_COMPONENT_PATH =
  "components/kitchen/kds-expedite-screen.tsx" as const;

export const KDS_EXPEDITE_SCREEN_SERVICE_PATH =
  "services/kitchen/kds-expedite-screen-service.ts" as const;

export const KDS_EXPEDITE_SCREEN_POLISH_PILLARS = [
  "hero_expedite_ticket",
  "rush_level_banner",
  "priority_expedite_queue",
  "large_touch_targets",
  "dark_mode_tablet_landscape",
] as const;

export const KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX = 44 as const;

export const KDS_EXPEDITE_SCREEN_REQUIRED_MARKERS = [
  'data-testid="kds-expedite-screen"',
  "kds-expedite-hero",
  "kds-expedite-queue",
] as const;

export const KDS_EXPEDITE_SCREEN_HONESTY_MARKERS = [
  "BETA",
  "not rush-hour certified",
  "priority routing",
  "Expedite screen",
] as const;

export const KDS_EXPEDITE_SCREEN_UNIT_TEST =
  "tests/unit/kds-expedite-screen-absolute-final.test.ts" as const;

export const KDS_EXPEDITE_SCREEN_WIRING_PATHS = [
  KDS_EXPEDITE_SCREEN_PAGE_PATH,
  KDS_EXPEDITE_SCREEN_COMPONENT_PATH,
  KDS_EXPEDITE_SCREEN_SERVICE_PATH,
  "lib/kitchen/kds-expedite-screen-absolute-final-policy.ts",
  "lib/kitchen/kds-expedite-screen-audit.ts",
  KDS_EXPEDITE_SCREEN_UNIT_TEST,
  "app/dashboard/kitchen/expo/page.tsx",
] as const;

export const KDS_EXPEDITE_SCREEN_CI_SCRIPTS = [
  "test:ci:kds-expedite-screen",
  "test:ci:kds-expedite-screen:cert",
] as const;

export type KdsExpediteScreenModel = {
  policyId: typeof KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID;
  rush: KdsRushModeSnapshot;
  hero: KdsPriorityLaneItem | null;
  queue: KdsPriorityLaneItem[];
  overdueCount: number;
  activeCount: number;
};

export function pickKdsExpediteHeroTicket(
  routes: readonly KdsPriorityLaneItem[],
): KdsPriorityLaneItem | null {
  return routes[0] ?? null;
}

export function buildKdsExpediteQueue(
  routes: readonly KdsPriorityLaneItem[],
  hero: KdsPriorityLaneItem | null,
): KdsPriorityLaneItem[] {
  if (!hero) return [...routes];
  return routes.filter((item) => item.order.id !== hero.order.id);
}

export function summarizeKdsExpediteScreen(rush: KdsRushModeSnapshot): {
  overdueCount: number;
  activeCount: number;
} {
  return {
    overdueCount: rush.queue.overdue,
    activeCount: rush.queue.total,
  };
}
