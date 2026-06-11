import { expect, type Page } from "@playwright/test";

import {
  DASHBOARD_POST_LOGIN_PATTERN,
  LOGIN_PATH,
  LOGIN_TODAY_PLAYBOOK_VISIBLE_MS,
  PLAYBOOKS_HEADING_PATTERN,
  PLAYBOOKS_PATH,
  PLAYBOOK_TODAY_ALL_LINK_LABEL,
  PLAYBOOK_TODAY_STRIP_TITLE,
  TODAY_HEADING_PATTERN,
  TODAY_PATH,
  type LoginTodayPlaybookFlowStep,
  type LoginTodayPlaybookNavigationSurface,
} from "@/lib/qa/login-today-playbook-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";

export type LoginTodayPlaybookFlowResult = {
  steps: LoginTodayPlaybookFlowStep[];
  navigationSurface: LoginTodayPlaybookNavigationSurface;
  destinationPath: string;
};

export async function performDashboardLogin(page: Page): Promise<void> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  const password = process.env.E2E_LOGIN_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD required for dashboard login.");
  }

  await page.goto(LOGIN_PATH);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(DASHBOARD_POST_LOGIN_PATTERN, {
    timeout: LOGIN_TODAY_PLAYBOOK_VISIBLE_MS,
  });
}

export async function runLoginTodayPlaybookFlow(
  page: Page,
  options: { skipLogin?: boolean } = {},
): Promise<LoginTodayPlaybookFlowResult> {
  const steps: LoginTodayPlaybookFlowStep[] = [];

  if (!options.skipLogin) {
    await performDashboardLogin(page);
    steps.push("login");
  }

  if (!page.url().includes(TODAY_PATH)) {
    await page.goto(TODAY_PATH);
  }
  await expect(page.getByRole("heading", { name: TODAY_HEADING_PATTERN }).first()).toBeVisible({
    timeout: LOGIN_TODAY_PLAYBOOK_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);
  steps.push("today");

  let navigationSurface: LoginTodayPlaybookNavigationSurface = "direct_path";

  const playbookStripLink = page.getByRole("link", { name: PLAYBOOK_TODAY_ALL_LINK_LABEL });
  const stripTitle = page.getByText(PLAYBOOK_TODAY_STRIP_TITLE, { exact: true });

  if (
    (await stripTitle.isVisible().catch(() => false)) &&
    (await playbookStripLink.isVisible().catch(() => false))
  ) {
    await playbookStripLink.click();
    navigationSurface = "playbook_strip_link";
  } else {
    await page.goto(PLAYBOOKS_PATH);
  }
  steps.push("playbook_navigation");

  await expect(page).toHaveURL(new RegExp(`${PLAYBOOKS_PATH.replace("/", "\\/")}`), {
    timeout: LOGIN_TODAY_PLAYBOOK_VISIBLE_MS,
  });
  await expect(page.getByRole("heading", { name: PLAYBOOKS_HEADING_PATTERN })).toBeVisible({
    timeout: LOGIN_TODAY_PLAYBOOK_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);
  steps.push("playbooks_hub");

  return {
    steps,
    navigationSurface,
    destinationPath: new URL(page.url()).pathname,
  };
}
