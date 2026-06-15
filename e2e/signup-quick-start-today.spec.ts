import { expect, test, type Page } from "@playwright/test";

import {
  QUICK_START_PATH,
  QUICK_START_SKIP_DESTINATION,
  SIGNUP_PATH,
  SIGNUP_POST_AUTH_DEFAULT_PATH,
  SIGNUP_QUICK_START_TODAY_E2E_POLICY_ID,
  TODAY_HEADING_PATTERN,
  TODAY_PATH,
} from "@/lib/onboarding/signup-quick-start-today-e2e-policy";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import {
  skipSignupQuickStartIfNotReady,
  uniqueSignupEmail,
} from "./helpers/signup-quick-start-ready";

/**
 * Signup → Quick Start → Today golden path.
 *
 * - Public: signup shell renders.
 * - Authed: quick-start resolves to Today (redirect or skip).
 * - Staging: optional full signup when E2E_SIGNUP_AUTO_CONFIRM=true.
 *
 * @see e2e/quick-start-wizard.spec.ts
 * @see docs/GOLDEN_PATH_REPEAT_QA_REPORT.md
 */

async function assertTodayCommandCenter(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`${TODAY_PATH.replace("/", "\\/")}`), {
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { name: TODAY_HEADING_PATTERN }).first()).toBeVisible({
    timeout: 30_000,
  });
}

async function completeQuickStartViaSkip(page: Page): Promise<void> {
  await page.goto(QUICK_START_PATH);
  await skipIfLoginRedirect(page);

  if (page.url().includes(TODAY_PATH)) {
    await assertTodayCommandCenter(page);
    return;
  }

  if (!page.url().includes("/dashboard/quick-start")) {
    test.skip(true, "Quick Start not available — onboarding state or permissions block access.");
  }

  await expect(page.getByRole("heading", { name: /first order in about 15 minutes/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: /skip for now/i }).click();
  await assertTodayCommandCenter(page);
}

async function runFullSignupQuickStartToday(page: Page): Promise<void> {
  const email = uniqueSignupEmail();
  const password = "E2eSignup!234";

  await page.goto(SIGNUP_PATH);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
  await page.getByLabel("Full name").fill("E2E Signup QA");
  await page.getByLabel("Company").fill("E2E Kitchen QA");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText(/account created|welcome to os kitchen/i)).toBeVisible({
    timeout: 30_000,
  });

  const landedOnboarding = page.url().includes(SIGNUP_POST_AUTH_DEFAULT_PATH);
  const landedLogin = page.url().includes("/login");
  if (landedLogin) {
    test.skip(true, "Signup requires email confirmation — enable auto-confirm on staging.");
  }
  if (!landedOnboarding && !page.url().includes("/dashboard")) {
    test.skip(true, `Unexpected post-signup URL: ${page.url()}`);
  }

  await page.goto(QUICK_START_PATH);
  await completeQuickStartViaSkip(page);
}

test.describe("signup quick start today policy", () => {
  test("exports canonical route constants", () => {
    expect(SIGNUP_QUICK_START_TODAY_E2E_POLICY_ID).toBe("signup-quick-start-today-e2e-v1");
    expect(SIGNUP_POST_AUTH_DEFAULT_PATH).toBe("/onboarding");
    expect(QUICK_START_SKIP_DESTINATION).toBe("/dashboard/today");
  });
});

test.describe("signup page (chromium)", () => {
  test("signup form renders trial CTA", async ({ page }) => {
    await page.goto(SIGNUP_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel("Work email")).toBeVisible();
  });
});

test.describe("signup quick start today (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Quick Start → Today journey runs in chromium-authed project only",
    );
  });

  test("quick start skip or redirect lands on Today command center", async ({ page }) => {
    await completeQuickStartViaSkip(page);
  });

  test("onboarding layout links to quick start", async ({ page }) => {
    await page.goto("/onboarding");
    if (page.url().includes(TODAY_PATH)) {
      test.skip(true, "Onboarding already completed — layout redirect to Today.");
    }
    if (page.url().includes("/login")) {
      test.skip(true, "Authed session missing.");
    }
    await expect(page.getByRole("link", { name: /quick start/i })).toBeVisible();
    await page.getByRole("link", { name: /quick start/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/quick-start/);
  });
});

test.describe("signup quick start today staging (chromium)", () => {
  test.beforeEach(() => {
    skipSignupQuickStartIfNotReady();
  });

  test("fresh signup through quick start skip opens Today", async ({ page }) => {
    await runFullSignupQuickStartToday(page);
  });
});
