import { expect, type Locator, type Page } from "@playwright/test";

import {
  BRIEFING_HERO_TESTID,
  BRIEFING_INTEGRATION_LANE_TESTID,
  BRIEFING_NEXT_ACTION_TESTID,
  BRIEFING_RANKED_ACTION_TESTID_PREFIX,
  OWNER_BRIEFING_BLOCKER_RESOLVE_VISIBLE_MS,
  RESOLVE_SURFACE_SELECTORS,
  TODAY_BLOCKERS_HEADING,
  TODAY_PATH,
  type BriefingBlockerClickSurface,
} from "@/lib/briefing/owner-briefing-blocker-resolve-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type OwnerBriefingBlockerFlowResult = {
  clickedSurface: BriefingBlockerClickSurface;
  destinationPath: string;
  resolveSurfaceFound: boolean;
  resolveClicked: boolean;
};

async function firstVisible(locators: Locator[]): Promise<Locator | null> {
  for (const locator of locators) {
    if (await locator.isVisible().catch(() => false)) {
      return locator;
    }
  }
  return null;
}

async function pickBriefingBlockerClickTarget(page: Page): Promise<{
  locator: Locator;
  surface: BriefingBlockerClickSurface;
} | null> {
  const rankedBlocker = page.locator(
    `[data-testid^="${BRIEFING_RANKED_ACTION_TESTID_PREFIX}blocker-"]`,
  );
  if (await rankedBlocker.first().isVisible().catch(() => false)) {
    return { locator: rankedBlocker.first(), surface: "ranked_blocker_action" };
  }

  const rankedAction = page.locator(`[data-testid^="${BRIEFING_RANKED_ACTION_TESTID_PREFIX}"]`);
  if (await rankedAction.first().isVisible().catch(() => false)) {
    return { locator: rankedAction.first(), surface: "ranked_action" };
  }

  const nextAction = page.getByTestId(BRIEFING_NEXT_ACTION_TESTID);
  if (await nextAction.isVisible().catch(() => false)) {
    return { locator: nextAction, surface: "next_action" };
  }

  const blockersCard = page
    .locator("div")
    .filter({ has: page.getByRole("heading", { name: TODAY_BLOCKERS_HEADING }) });
  const todayBlockerLink = blockersCard.getByRole("link").first();
  if (await todayBlockerLink.isVisible().catch(() => false)) {
    return { locator: todayBlockerLink, surface: "today_blocker_link" };
  }

  const integrationLane = page.getByTestId(BRIEFING_INTEGRATION_LANE_TESTID);
  const integrationRow = integrationLane.locator('[data-testid^="owner-briefing-integration-"]').first();
  if (await integrationRow.isVisible().catch(() => false)) {
    return { locator: integrationRow, surface: "integration_lane_row" };
  }

  return null;
}

async function findResolveSurface(page: Page): Promise<Locator | null> {
  const candidates = RESOLVE_SURFACE_SELECTORS.map((selector) => page.locator(selector).first());
  return firstVisible(candidates);
}

export async function runOwnerBriefingBlockerResolveFlow(
  page: Page,
): Promise<OwnerBriefingBlockerFlowResult | null> {
  await page.goto(TODAY_PATH);
  await skipIfLoginRedirect(page, "Owner briefing blocker resolve requires dashboard auth");

  await expect(page.getByTestId(BRIEFING_HERO_TESTID)).toBeVisible({
    timeout: OWNER_BRIEFING_BLOCKER_RESOLVE_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);

  const clickTarget = await pickBriefingBlockerClickTarget(page);
  if (!clickTarget) {
    return null;
  }

  const beforePath = new URL(page.url()).pathname;
  await clickTarget.locator.click();
  await page.waitForLoadState("domcontentloaded");
  await expect
    .poll(() => new URL(page.url()).pathname, {
      timeout: OWNER_BRIEFING_BLOCKER_RESOLVE_VISIBLE_MS,
    })
    .not.toBe(beforePath)
    .catch(() => undefined);
  await assertNoDashboardRscFailure(page);

  const destinationPath = new URL(page.url()).pathname;
  const resolveSurface = await findResolveSurface(page);
  let resolveClicked = false;

  if (resolveSurface) {
    await resolveSurface.click();
    await assertNoDashboardRscFailure(page);
    resolveClicked = true;
  }

  return {
    clickedSurface: clickTarget.surface,
    destinationPath,
    resolveSurfaceFound: resolveSurface !== null,
    resolveClicked,
  };
}
