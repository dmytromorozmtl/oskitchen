/**
 * Production golden path QA — documents bugs only (no fixes).
 * Usage: npx tsx scripts/run-golden-path-prod-qa.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium, type ConsoleMessage, type Page } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const BASE = "https://os-kitchen.com";
const TS = Date.now();
const EMAIL = `golden-path-${TS}@kitchenos-test.com`;
const PASSWORD = "TestPass123!";
const FULL_NAME = "Golden Path Test";
const COMPANY = "Test Kitchen";

type Bug = {
  step: number;
  url: string;
  description: string;
  expectation: string;
};

const bugs: Bug[] = [];
const notes: string[] = [];
let consoleErrors: string[] = [];

function bug(
  step: number,
  url: string,
  description: string,
  expectation: string,
) {
  bugs.push({ step, url, description, expectation });
}

function note(msg: string) {
  notes.push(msg);
  logger.cli(`  · ${msg}`);
}

function loadEnv() {
  const { config } = require("dotenv") as typeof import("dotenv");
  config({ path: join(process.cwd(), ".env.local") });
}

async function confirmEmailViaAdmin(email: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    note("SUPABASE admin keys missing — step 2 cannot auto-confirm");
    return null;
  }
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    note(`Supabase listUsers failed: ${listErr.message}`);
    return null;
  }
  const user = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    note("User not found in Supabase after signup");
    return null;
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (updErr) {
    note(`email_confirm failed: ${updErr.message}`);
    return null;
  }
  const supabaseHost = new URL(url).hostname;
  note(`Supabase project host: ${supabaseHost}`);
  return user.id;
}

function attachConsole(page: Page) {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (
        !t.includes("favicon") &&
        !t.includes("ResizeObserver") &&
        !t.includes("hydration")
      ) {
        consoleErrors.push(t.slice(0, 300));
      }
    }
  });
}

async function main() {
  loadEnv();
  logger.cli(`\n=== GOLDEN PATH PROD QA — ${EMAIL} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    baseURL: BASE,
  });
  const page = await context.newPage();
  attachConsole(page);

  // —— STEP 1: Signup ——
  logger.cli("STEP 1: Signup");
  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupStatus = (await page.goto("/signup")).status();
  if (signupStatus !== 200) {
    bug(1, `${BASE}/signup`, `HTTP ${signupStatus}`, "Page loads 200");
  }

  await page.getByLabel(/full name/i).fill(FULL_NAME);
  await page.getByLabel(/^company/i).fill(COMPANY);
  await page.getByLabel(/work email|email/i).fill(EMAIL);
  await page.getByLabel(/^password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForTimeout(3000);
  const toastText = await page.locator("[data-sonner-toast]").allTextContents();
  const bodyAfterSignup = await page.content();
  const hasRateLimit = /rate limit|invalid api key/i.test(bodyAfterSignup + toastText.join(" "));
  if (hasRateLimit) {
    bug(
      1,
      `${BASE}/signup`,
      "Signup returned rate limit or Invalid API key",
      "Form submits without auth provider errors",
    );
  }

  const onOnboarding = page.url().includes("/onboarding");
  const onLogin = page.url().includes("/login");
  const checkEmailMsg =
    toastText.some((t) => /check your email|confirm/i.test(t)) ||
    bodyAfterSignup.includes("check your email");

  if (onOnboarding) {
    note("Signup: immediate session → /onboarding (email confirm may be disabled in Supabase)");
    bug(
      1,
      `${BASE}/signup`,
      "After signup user lands on /onboarding without 'Check your email' step",
      "Show 'Check your email' confirmation message before first login (per golden path spec)",
    );
  } else if (checkEmailMsg || onLogin) {
    note("Signup: check-your-email flow shown");
  } else {
    bug(
      1,
      page.url(),
      `Unexpected post-signup state: ${page.url()} toasts=${toastText.join(";")}`,
      "Either /onboarding or 'check your email' then /login",
    );
  }

  // —— STEP 2: Email confirm ——
  logger.cli("\nSTEP 2: Email confirm");
  if (!onOnboarding) {
    await confirmEmailViaAdmin(EMAIL);
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/^password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    try {
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60_000 });
    } catch {
      const errToast = await page.locator("[data-sonner-toast]").allTextContents();
      if (errToast.length) {
        bug(
          2,
          `${BASE}/login`,
          `Login after confirm failed: ${errToast.join("; ")}`,
          "User can sign in after email confirmation",
        );
      }
    }
  }

  const afterAuthUrl = page.url();
  if (!/\/(onboarding|dashboard)/.test(afterAuthUrl)) {
    bug(
      2,
      afterAuthUrl,
      "After email confirm / login user not on dashboard or onboarding",
      "Redirect to /dashboard or /onboarding when logged in",
    );
  } else {
    note(`Authenticated at ${afterAuthUrl}`);
  }

  // —— STEP 3: Onboarding ——
  logger.cli("\nSTEP 3: Onboarding");
  if (page.url().includes("/onboarding")) {
    const stepBefore = await page.locator("button.bg-primary.text-primary-foreground").first().textContent();

    const onboardingDeadline = Date.now() + 90_000;
    for (let round = 0; round < 15 && page.url().includes("/onboarding") && Date.now() < onboardingDeadline; round++) {
      const cardTitle = (await page.locator("h3").first().textContent().catch(() => "")) ?? "";
      note(`Onboarding step[${round}]: ${cardTitle.trim() || "(unknown)"}`);
      const click = async (loc: ReturnType<Page["getByRole"]>) => {
        await loc.click({ timeout: 8_000 });
      };

      if (/welcome/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/business profile/i.test(cardTitle)) {
        await page.getByLabel(/business name/i).fill("Test Kitchen");
        await page.getByRole("radio", { name: /restaurant/i }).check();
        const countryIsSelect =
          (await page.locator('select[name="country"]').count()) > 0 ||
          (await page.locator("[data-country-select]").count()) > 0;
        if (!countryIsSelect) {
          bug(3, page.url(), "Country is not a select dropdown", "Country uses select, not free text");
        }
        if ((await page.locator("select#currency").count()) === 0) {
          bug(3, page.url(), "Currency is not a select", "Currency <select id=currency>");
        }
        if ((await page.locator("select#timezone").count()) === 0) {
          bug(3, page.url(), "Timezone is not a select", "Timezone <select id=timezone>");
        }
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/operating model/i.test(cardTitle)) {
        const daily = page.getByRole("radio", { name: /walk-in|daily service/i });
        if ((await daily.count()) > 0) await daily.first().check();
        else bug(3, page.url(), "No Walk-in / daily service option", "Daily service selectable");
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/fulfillment/i.test(cardTitle)) {
        await page.getByLabel(/pickup address/i).fill("123 Test St");
        await page.locator("#deliveryEnabled").setChecked(false).catch(() => {});
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/weekly menu/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /^skip$/i }).first());
      } else if (/brands/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /^skip$/i }).first());
      } else if (/menu items/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /skip.*later/i }));
      } else if (/sales channels/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/recommended modules/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else if (/you.re ready/i.test(cardTitle)) {
        await click(page.getByRole("button", { name: /go to dashboard/i }));
        break;
      } else if (await page.getByRole("button", { name: /^skip$/i }).isVisible().catch(() => false)) {
        await click(page.getByRole("button", { name: /^skip$/i }).first());
      } else if (await page.getByRole("button", { name: /^continue$/i }).isVisible().catch(() => false)) {
        await click(page.getByRole("button", { name: /^continue$/i }).first());
      } else {
        break;
      }
      await page.waitForTimeout(1500);
      const stepAfter = await page.locator("button.bg-primary.text-primary-foreground").first().textContent();
      if (round > 0 && stepBefore === stepAfter && /welcome/i.test(cardTitle ?? "")) {
        bug(3, page.url(), "Onboarding step did not advance after Continue", "Steps advance only on user action");
      }
    }

    if (page.url().includes("/onboarding")) {
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: /skip onboarding/i }).click();
      await page.waitForTimeout(3000);
    }
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 }).catch(() => {});
    if (!page.url().includes("/dashboard")) {
      bug(3, page.url(), "Onboarding did not redirect to dashboard", "After Go to dashboard → /dashboard/today");
    } else {
      note(`Onboarding complete → ${page.url()}`);
    }
  } else {
    note("Skipped onboarding — already completed or not shown");
  }

  // —— STEP 4: Dashboard Today ——
  logger.cli("\nSTEP 4: Dashboard Today");
  consoleErrors = [];
  await page.goto("/dashboard/today", { waitUntil: "networkidle" });
  if (page.url().includes("/login")) {
    bug(4, page.url(), "Redirected to login on /dashboard/today", "Authenticated dashboard loads");
  }
  const todayHeading = page.getByRole("heading", { name: /today/i });
  if (!(await todayHeading.isVisible().catch(() => false))) {
    bug(4, `${BASE}/dashboard/today`, "Today heading not visible", "Today dashboard renders");
  }
  if (consoleErrors.length > 0) {
    bug(
      4,
      `${BASE}/dashboard/today`,
      `Console errors: ${consoleErrors.slice(0, 3).join(" | ")}`,
      "No console errors on Today page",
    );
  }
  const sidebarLinks = page.locator('nav a[href^="/dashboard"]');
  const linkCount = await sidebarLinks.count();
  note(`Sidebar dashboard links: ${linkCount}`);

  // —— STEP 5: Create product ——
  logger.cli("\nSTEP 5: Create product");
  await page.goto("/dashboard/products", { waitUntil: "networkidle" });
  const addBtn = page.getByRole("button", { name: /add product|add meal|new product/i });
  if (!(await addBtn.first().isVisible().catch(() => false))) {
    bug(5, `${BASE}/dashboard/products`, "Add product button not found", "Add product CTA visible");
  } else {
    await addBtn.first().click();
    await page.waitForTimeout(1000);
    const dialog = page.getByRole("dialog");
    const formTitle = await dialog.getByRole("heading").first().textContent().catch(() => "");
    if (formTitle && !/new product|add product/i.test(formTitle)) {
      bug(5, page.url(), `Form title: ${formTitle}`, "Title 'New product' for Restaurant");
    }
    for (const badField of [/prepared date/i, /pickup date/i, /^portion$/i, /reheating/i]) {
      if (await dialog.getByLabel(badField).isVisible().catch(() => false)) {
        bug(5, page.url(), `Unexpected field for Daily: ${badField}`, "No meal-prep-only fields for restaurant daily");
      }
    }
    await dialog.getByLabel(/title|name/i).first().fill("Test Burger");
    const category = dialog.locator('select[name="category"], [name="category"]');
    if ((await category.count()) > 0) {
      await category.selectOption({ label: /MAINS|mains/i }).catch(() =>
        category.selectOption("MAINS").catch(() => {}),
      );
    }
    const price = dialog.getByLabel(/price/i);
    if ((await price.count()) > 0) await price.first().fill("12.00");
    const desc = dialog.getByLabel(/description/i);
    if ((await desc.count()) > 0) await desc.first().fill("Golden path test burger");
    const submit = dialog.getByRole("button", { name: /add product|save|create/i });
    await submit.first().click();
    await page.waitForTimeout(3000);
    const createdToast = await page.locator("[data-sonner-toast]").allTextContents();
    if (!createdToast.some((t) => /created|saved/i.test(t))) {
      bug(5, page.url(), "No 'Product created' toast after submit", "Toast confirms product created");
    }
    if (!(await page.getByText("Test Burger").isVisible().catch(() => false))) {
      bug(5, page.url(), "Test Burger not in product list", "Product appears in list after create");
    }
  }

  // —— STEP 6: POS ——
  logger.cli("\nSTEP 6: POS order");
  await page.goto("/dashboard/pos/terminal", { waitUntil: "networkidle" });
  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    bug(6, page.url(), "POS requires register setup", "Terminal usable after onboarding");
  } else {
    const search = page.getByPlaceholder(/search/i);
    if ((await search.count()) > 0) await search.fill("Test Burger");
    await page.waitForTimeout(1000);
    const tile = page.getByText("Test Burger").first();
    if (await tile.isVisible().catch(() => false)) {
      await tile.click();
    } else {
      const posTile = page.getByTestId("pos-product-tile").first();
      if ((await posTile.count()) > 0) await posTile.click();
      else bug(6, page.url(), "Test Burger not found on POS", "Product visible in POS catalog");
    }
    const complete = page.getByTestId("pos-complete-sale");
    if ((await complete.count()) > 0) {
      await complete.click();
      await page.waitForTimeout(5000);
      const status = await page.getByTestId("pos-checkout-status").textContent().catch(() => "");
      if (!/sale complete|order/i.test(status ?? "")) {
        bug(6, page.url(), `POS checkout status: ${status}`, "Sale completes with order reference");
      } else {
        note(`POS: ${status?.slice(0, 80)}`);
      }
    }
  }
  await page.goto("/dashboard/orders", { waitUntil: "networkidle" });
  const hasOrder = await page.locator('a[href*="/dashboard/orders/"]').count();
  if (hasOrder === 0) {
    bug(6, `${BASE}/dashboard/orders`, "No orders after POS checkout", "Order visible in orders list");
  }

  // —— STEP 7: Production ——
  logger.cli("\nSTEP 7: Production");
  await page.goto("/dashboard/production", { waitUntil: "networkidle" });
  const prodH1 = await page.locator("h1").first().textContent().catch(() => "");
  if (/weekly batch/i.test(prodH1 ?? "")) {
    bug(7, page.url(), `Production shows Weekly Batch for daily: ${prodH1}`, "Today's Queue for DAILY_SERVICE");
  }
  note(`Production h1: ${prodH1}`);

  // —— STEP 8: KDS ——
  logger.cli("\nSTEP 8: Kitchen / KDS");
  await page.goto("/dashboard/kitchen", { waitUntil: "networkidle" });
  if (page.url().includes("/login")) {
    bug(8, page.url(), "KDS redirected to login", "Kitchen display loads when authenticated");
  }

  // —— STEP 9: Billing ——
  logger.cli("\nSTEP 9: Billing");
  await page.goto("/dashboard/billing", { waitUntil: "networkidle" });
  const billingBody = await page.content();
  if (/stripe not configured|price ids missing/i.test(billingBody)) {
    bug(9, `${BASE}/dashboard/billing`, "Stripe configuration error on billing page", "Plan and status display without config errors");
  }
  await page.goto("/dashboard/billing/plans", { waitUntil: "networkidle" });
  const plansBody = await page.content();
  const planCount = (plansBody.match(/starter|pro|team|enterprise/gi) ?? []).length;
  if (planCount < 4) {
    bug(9, `${BASE}/dashboard/billing/plans`, `Expected 4 plans, found ~${planCount} mentions`, "Starter, Pro, Team, Enterprise visible");
  }
  const choosePro = page.getByRole("button", { name: /choose pro/i });
  if ((await choosePro.count()) > 0 && (await choosePro.first().isDisabled())) {
    bug(9, page.url(), "Choose Pro button disabled", "Choose Pro active for upgrade");
  }

  // —— STEP 10: Storefront (public, no auth) ——
  logger.cli("\nSTEP 10: Storefront");
  const pub = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const sp = await pub.newPage();
  await sp.goto(`${BASE}/s/hello`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const helloHtml = await sp.content();
  if (/welcome.*tell guests what you offer/i.test(helloHtml.replace(/\s+/g, " "))) {
    bug(10, `${BASE}/s/hello`, "Hardcoded placeholder hero copy visible", "Published storefront content, not template placeholders");
  }
  const skeletons = await sp.locator('[class*="skeleton"], [data-skeleton]').count();
  if (skeletons > 5) {
    bug(10, `${BASE}/s/hello`, `${skeletons} skeleton elements on homepage`, "Product photos loaded, not skeletons");
  }
  const madeWith = await sp.getByText(/made with.*kitchen/i).count();
  if (madeWith === 0) {
    bug(10, `${BASE}/s/hello`, "Missing 'Made with OS-Kitchen' footer", "Footer branding present");
  }
  await sp.goto(`${BASE}/s/hello/menu`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if ((await sp.getByText(/\$\d/).count()) === 0 && (await sp.locator('[class*="price"]').count()) === 0) {
    bug(10, `${BASE}/s/hello/menu`, "No prices visible on menu", "Menu shows product prices");
  }
  await sp.goto(`${BASE}/s/hello/checkout`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (sp.url().includes("404") || (await sp.getByText(/not found/i).isVisible().catch(() => false))) {
    bug(10, `${BASE}/s/hello/checkout`, "Checkout page 404 or not found", "Checkout form loads");
  }
  await pub.close();

  await browser.close();
  if (bugs.length > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    bug(0, BASE, `Automation crashed: ${e instanceof Error ? e.message : String(e)}`, "Script completes all 10 steps");
  })
  .finally(() => {
    const reportPath = join(
      process.cwd(),
      "docs",
      `GOLDEN_PATH_BUG_REPORT_${new Date().toISOString().slice(0, 10)}.md`,
    );
    const lines = [
      "# Golden Path — Production Bug Report",
      "",
      `**Date:** ${new Date().toISOString()}`,
      `**Production:** ${BASE}`,
      `**Test account:** ${EMAIL}`,
      "",
      "## Summary",
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Bugs found | **${bugs.length}** |`,
      "",
      "## Notes",
      "",
      ...notes.map((n) => `- ${n}`),
      "",
      "## Bugs",
      "",
    ];
    if (bugs.length === 0) {
      lines.push("_No bugs recorded by automation._\n");
    } else {
      bugs.forEach((b, i) => {
        lines.push(
          `### ${i + 1}. Step ${b.step}`,
          "",
          `- **URL:** ${b.url}`,
          `- **Описание:** ${b.description}`,
          `- **Ожидание:** ${b.expectation}`,
          "",
        );
      });
    }
    mkdirSync(join(process.cwd(), "docs"), { recursive: true });
    writeFileSync(reportPath, lines.join("\n"), "utf8");
    logger.cli(`\nReport: ${reportPath} (${bugs.length} bugs)\n`);
  });
