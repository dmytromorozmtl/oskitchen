/**
 * Owner briefing → blocker click → resolve E2E policy (QA-20).
 *
 * @see e2e/owner-briefing-blocker-resolve.spec.ts
 * @see components/dashboard/owner-daily-briefing-hero.tsx
 * @see components/dashboard/today-command-center.tsx
 */

export const OWNER_BRIEFING_BLOCKER_RESOLVE_E2E_POLICY_ID =
  "owner-briefing-blocker-resolve-e2e-v1" as const;

export const TODAY_PATH = "/dashboard/today" as const;
export const INTEGRATION_HEALTH_PATH = "/dashboard/integration-health" as const;
export const LAUNCH_WIZARD_PATH = "/dashboard/launch-wizard" as const;

export const BRIEFING_HERO_TESTID = "owner-daily-briefing-hero" as const;
export const BRIEFING_NEXT_ACTION_TESTID = "owner-daily-briefing-next-action" as const;
export const BRIEFING_RANKED_ACTION_TESTID_PREFIX = "owner-briefing-action-" as const;
export const BRIEFING_INTEGRATION_LANE_TESTID = "owner-briefing-integration-health-lane" as const;

export const TODAY_BLOCKERS_HEADING = /Blockers & integration risk/i;

/** Playwright selectors for surfaces that unblock a briefing blocker. */
export const RESOLVE_SURFACE_SELECTORS = [
  '[data-testid^="go-live-blocker-next-action-"]',
  '[data-testid^="launch-wizard-blocker-"]',
  '[data-testid="launch-wizard-commercial-blockers"]',
  '[data-testid^="owner-briefing-integration-"]',
  'a[href*="integration-health"]',
  'a[href*="error-recovery"]',
] as const;

export const OWNER_BRIEFING_BLOCKER_RESOLVE_VISIBLE_MS = 30_000 as const;

export type BriefingBlockerClickSurface =
  | "ranked_blocker_action"
  | "ranked_action"
  | "next_action"
  | "today_blocker_link"
  | "integration_lane_row";

export function ownerBriefingRankedActionTestId(actionId: string): string {
  return `${BRIEFING_RANKED_ACTION_TESTID_PREFIX}${actionId}`;
}

export function isBriefingBlockerRankedActionId(actionId: string): boolean {
  return actionId.startsWith("blocker-");
}

export function isAllowedBriefingResolveHref(href: string): boolean {
  const trimmed = href.trim();
  return trimmed.startsWith("/dashboard") || trimmed.startsWith("/help");
}

export function briefingBlockerRankedActionId(blockerId: string): string {
  return `blocker-${blockerId}`;
}
