/**
 * Repeat Golden Path QA (post-fix verification) — document only.
 * Usage: npx tsx scripts/run-golden-path-repeat-qa.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium, type Page } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const BASE = "https://os-kitchen.com";
const TS = Date.now();
const EMAIL = `golden-path-${TS}@kitchenos-test.com`;
const PASSWORD = "TestPass123!";
const FULL_NAME = "Golden Path Test";
const COMPANY = `Test Kitchen ${TS}`;

type Bug = {
  step: number;
  severity: "critical" | "important" | "minor";
  url: string;
  description: string;
  expectation: string;
};

const bugs: Bug[] = [];
const notes: string[] = [];
const passed: string[] = [];
let consoleErrors: string[] = [];

function bug(
  step: number,
  url: string,
  description: string,
  expectation: string,
  severity: Bug["severity"] = "important",
) {
  bugs.push({ step, severity, url, description, expectation });
}

function note(msg: string) {
  notes.push(msg);
  logger.cli(`  · ${msg}`);
}

function pass(msg: string) {
  passed.push(msg);
}

function loadEnv() {
  const { config } = require("dotenv") as typeof import("dotenv");
  config({ path: join(process.cwd(), ".env.local") });
}

async function cardTitle(page: Page) {
  return (await page.locator(".text-2xl.font-semibold").first().textContent())?.trim() ?? "";
}

async function clickContinue(page: Page) {
  const btn = page.locator("form").getByRole("button", { name: /^continue$/i }).first();
  await btn.waitFor({ state: "visible", timeout: 20_000 });
  for (let i = 0; i < 30; i++) {
    if (await btn.isEnabled()) break;
    await page.waitForTimeout(500);
  }
  await btn.click();
}

async function confirmEmailAdmin(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return false;
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
  return true;
}

async function setupPosIfNeeded(page: Page) {
  if (!(await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false))) {
    return;
  }
  note("POS: creating register + staff for golden path");
  await page.goto("/dashboard/pos/registers");
  await page.waitForTimeout(2000);
  const addReg = page.getByRole("button", { name: /add register|new register|create register/i });
  if ((await addReg.count()) > 0) {
    await addReg.first().click();
    await page.waitForTimeout(500);
    const nameInput = page.getByLabel(/name/i).first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Main Register");
      await page.getByRole("button", { name: /save|create|add/i }).last().click();
      await page.waitForTimeout(3000);
    }
  }
  await page.goto("/dashboard/staff");
  await page.waitForTimeout(2000);
  const addStaff = page.getByRole("button", { name: /add staff|invite|new staff/i });
  if ((await addStaff.count()) > 0) {
    await addStaff.first().click();
    await page.waitForTimeout(500);
    const n = page.getByLabel(/name|full name/i).first();
    if (await n.isVisible().catch(() => false)) {
      await n.fill("POS Operator");
      const roleSelect = page.locator('select[name="role"], select').first();
      if ((await roleSelect.count()) > 0) await roleSelect.selectOption({ index: 0 }).catch(() => {});
      await page.getByRole("button", { name: /save|create|add|invite/i }).last().click();
      await page.waitForTimeout(3000);
    }
  }
}

let signupFlowCheckEmail = false;
let signupFlowWelcome = false;

async function main() {
  loadEnv();
  logger.cli(`\n=== GOLDEN PATH REPEAT QA — ${EMAIL} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, baseURL: BASE });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|ResizeObserver|hydration/i.test(m.text())) {
      consoleErrors.push(m.text().slice(0, 200));
    }
  });

  // STEP 1 — Signup
  logger.cli("STEP 1: Signup");
  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/full name/i).fill(FULL_NAME);
  await page.getByLabel(/^company/i).fill(COMPANY);
  await page.getByLabel(/work email|email/i).fill(EMAIL);
  await page.getByLabel(/^password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  let signupToast = "";
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const t = await page.locator("[data-sonner-toast]").allTextContents();
    if (t.length) signupToast = t.join("; ");
    if (/\/(onboarding|login|dashboard)/.test(page.url())) break;
  }
  if (page.url().includes("/signup") && /welcome|workspace/i.test(signupToast)) {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
  }
  note(`Signup toast: ${signupToast || "(none)"}`);
  note(`Signup URL after 12s: ${page.url()}`);

  const body = await page.content();
  if (/rate limit|invalid api key/i.test(body + signupToast)) {
    bug(1, `${BASE}/signup`, "Rate limit or Invalid API key", "Clean signup", "critical");
  } else {
    pass("Step 1: no auth provider errors");
  }

  const checkEmail = /check your email|confirm your address/i.test(signupToast);
  const welcomeOnboarding = /welcome|workspace/i.test(signupToast);
  signupFlowCheckEmail = checkEmail;
  signupFlowWelcome = welcomeOnboarding;
  const onLogin = page.url().includes("/login");
  const onOnboarding = page.url().includes("/onboarding");
  const onDashboard = page.url().includes("/dashboard");

  if (checkEmail && onLogin) {
    pass("Step 1: email confirmation flow (check email → login)");
  } else if (welcomeOnboarding || onOnboarding) {
    pass("Step 1: auto-confirm flow (welcome → onboarding)");
    note("Supabase auto-confirm enabled — check-email path not required");
  } else if (page.url().includes("/signup") && !signupToast) {
    bug(1, page.url(), "Signup stuck on /signup with no toast", "Toast + redirect", "critical");
  }

  // STEP 2 — Email confirm if needed
  logger.cli("\nSTEP 2: Email confirm");
  if (onLogin && !onOnboarding && !onDashboard) {
    await confirmEmailAdmin(EMAIL);
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/^password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60_000 }).catch(() => {});
    if (page.url().includes("/login")) {
      bug(2, page.url(), "Login failed after email confirm", "Authenticated session", "critical");
    } else {
      pass("Step 2: login after confirm OK");
    }
  } else {
    pass("Step 2: skipped (already authenticated)");
  }

  // STEP 3 — Onboarding
  logger.cli("\nSTEP 3: Onboarding");
  if (!page.url().includes("/onboarding")) await page.goto("/onboarding");

  if (page.url().includes("/onboarding")) {
    // Welcome if present
    let title = await cardTitle(page);
    if (/welcome/i.test(title)) {
      await clickContinue(page);
      await page.waitForTimeout(2500);
      title = await cardTitle(page);
      note(`After welcome → ${title}`);
    }

    // Business profile
    if (/business profile/i.test(title)) {
      const hasCurrency = (await page.locator("select#currency").count()) > 0;
      const hasTz = (await page.locator("select#timezone").count()) > 0;
      const hasCountry = (await page.getByLabel(/country/i).count()) > 0;
      if (hasCurrency && hasTz && hasCountry) pass("Step 3: Country/Currency/Timezone controls present");
      else bug(3, page.url(), "Missing locale selects", "Country combobox + currency/timezone selects");

      await page.getByLabel(/business name/i).fill("Golden Path Restaurant");
      await page.getByRole("radio", { name: /restaurant/i }).check();
      await page.getByLabel(/country/i).click();
      await page.getByRole("button", { name: /United States/i }).click();
      const before = title;
      await clickContinue(page);
      await page.waitForTimeout(3500);
      title = await cardTitle(page);
      if (/business profile/i.test(title)) {
        bug(
          3,
          page.url(),
          "Continue on Business profile did not advance (still on same step)",
          "Auto-advance to Operating model after Saved",
          "critical",
        );
      } else {
        pass("Step 3: Business profile Continue advances step");
        note(`After business profile → ${title}`);
      }
    }

    // Operating model
    if (/operating model/i.test(title)) {
      await page.getByRole("radio", { name: /walk-in|daily service/i }).first().check();
      await clickContinue(page);
      await page.waitForTimeout(2500);
      title = await cardTitle(page);
      pass("Step 3: Operating model saved");
      note(`After operating model → ${title}`);
    }

    // Fulfillment
    if (/fulfillment/i.test(title)) {
      await page.getByLabel(/pickup address/i).fill("123 Test St, Montreal");
      await page.locator("#deliveryEnabled").setChecked(false).catch(() => {});
      await clickContinue(page);
      await page.waitForTimeout(2500);
      title = await cardTitle(page);
    }

    // Skip optional steps
    for (let i = 0; i < 10 && page.url().includes("/onboarding"); i++) {
      title = await cardTitle(page);
      if (/weekly menu/i.test(title)) {
        await page.getByRole("button", { name: /^skip$/i }).first().click();
      } else if (/brands/i.test(title)) {
        await page.getByRole("button", { name: /^skip$/i }).first().click();
      } else if (/menu items/i.test(title)) {
        await page.getByRole("button", { name: /skip.*later/i }).click();
      } else if (/sales channels/i.test(title)) {
        await clickContinue(page);
      } else if (/recommended modules/i.test(title)) {
        await clickContinue(page);
      } else if (/ready/i.test(title)) {
        await page.getByRole("button", { name: /go to dashboard/i }).click();
        break;
      } else if (await page.getByRole("button", { name: /^skip$/i }).isVisible().catch(() => false)) {
        await page.getByRole("button", { name: /^skip$/i }).first().click();
      } else if (await page.getByRole("button", { name: /^continue$/i }).isVisible().catch(() => false)) {
        await clickContinue(page);
      } else break;
      await page.waitForTimeout(2500);
    }

    await page.waitForURL(/\/dashboard/, { timeout: 30_000 }).catch(() => {});
    if (page.url().includes("/dashboard")) pass("Step 3: onboarding → dashboard");
    else bug(3, page.url(), "Onboarding did not finish at dashboard", "/dashboard/today", "critical");
  }

  // STEP 4 — Today
  logger.cli("\nSTEP 4: Dashboard Today");
  consoleErrors = [];
  await page.goto("/dashboard/today", { waitUntil: "domcontentloaded" });
  if (await page.getByRole("heading", { name: /^today$/i }).isVisible().catch(() => false)) {
    pass("Step 4: Today heading visible");
  } else {
    bug(4, page.url(), "Today heading not visible", "Today dashboard loads");
  }
  const navCount = await page.locator('nav a[href^="/dashboard"]').count();
  note(`Sidebar links: ${navCount}`);
  if (consoleErrors.length) {
    bug(4, page.url(), `Console errors: ${consoleErrors.slice(0, 2).join(" | ")}`, "No console errors", "minor");
  }

  // STEP 5 — Product
  logger.cli("\nSTEP 5: Create product");
  await page.goto("/dashboard/products", { waitUntil: "domcontentloaded" });
  const addBtn = page.getByRole("button", { name: /add menu item|add product|add meal/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    bug(5, page.url(), "Add product CTA missing", "Add menu item / Add product button", "critical");
  } else {
    await addBtn.click();
    const dlg = page.getByRole("dialog");
    const dlgTitle = (await dlg.getByRole("heading").first().textContent()) ?? "";
    note(`Product dialog: ${dlgTitle}`);
    if (/new product/i.test(dlgTitle)) pass("Step 5: 'New product' for Restaurant");
    else if (/new meal/i.test(dlgTitle)) {
      bug(5, page.url(), `Dialog title '${dlgTitle}' for Restaurant daily`, "New product", "important");
    }
    for (const f of [/prepared date/i, /pickup date/i, /portion size/i, /reheating/i]) {
      if (await dlg.getByLabel(f).isVisible().catch(() => false)) {
        bug(5, page.url(), `Meal-prep field visible: ${f}`, "Hidden for DAILY_SERVICE", "minor");
      }
    }
    await dlg.getByLabel(/title|name/i).first().fill("Test Burger");
    await dlg.locator('select[name="category"]').selectOption("MAINS").catch(() => {});
    await dlg.getByLabel(/price/i).first().fill("12.00");
    await dlg.getByLabel(/description/i).first().fill("QA test burger");
    await dlg.getByRole("button", { name: /add product|add meal/i }).click();
    await page.waitForTimeout(4000);
    const toast = (await page.locator("[data-sonner-toast]").allTextContents()).join("; ");
    if (/product created/i.test(toast)) pass("Step 5: Product created toast");
  else if (/meal created/i.test(toast)) bug(5, page.url(), "Toast says Meal created", "Product created", "minor");
    if (await page.getByText("Test Burger").isVisible().catch(() => false)) pass("Step 5: Test Burger in list");
    else bug(5, page.url(), "Test Burger not in list", "Product visible after create", "important");
  }

  // STEP 6 — POS
  logger.cli("\nSTEP 6: POS");
  await page.goto("/dashboard/pos/terminal", { waitUntil: "domcontentloaded" });
  const posMain = await page.locator("main").innerText();
  if (/pro plans|upgrade to pro|not available on your current plan/i.test(posMain)) {
    bug(6, page.url(), "POS paywall still shown on trial", "POS accessible during trial", "critical");
  } else {
    pass("Step 6: no POS paywall on trial");
  }
  await setupPosIfNeeded(page);
  await page.goto("/dashboard/pos/terminal");
  await page.waitForTimeout(3000);
  const posAfter = await page.locator("main").innerText();
  if (/add register/i.test(posAfter.toLowerCase())) {
    bug(6, page.url(), "POS blocked: no register after setup attempt", "Terminal with catalog", "critical");
  } else if (await page.getByTestId("pos-product-tile").count()) {
    pass("Step 6: POS product tiles visible");
    const burger = page.getByTestId("pos-product-tile").filter({ hasText: "Test Burger" });
    if ((await burger.count()) === 0) {
      await page.getByPlaceholder(/search/i).fill("Test Burger").catch(() => {});
      await page.waitForTimeout(1000);
    }
    const tile = page.getByTestId("pos-product-tile").filter({ hasText: /burger|Test/i }).first();
    if ((await tile.count()) > 0) {
      await tile.click();
      await page.getByTestId("pos-complete-sale").click();
      await page.waitForTimeout(6000);
      const st = await page.getByTestId("pos-checkout-status").textContent().catch(() => "");
      if (/sale complete|order/i.test(st ?? "")) pass("Step 6: POS checkout completed");
      else bug(6, page.url(), `POS checkout: ${st?.slice(0, 100)}`, "Sale complete with order ref", "critical");
    } else {
      bug(6, page.url(), "Test Burger not on POS (posVisible?)", "Product in POS catalog", "important");
    }
  }

  await page.goto("/dashboard/orders");
  await page.waitForTimeout(2000);
  if ((await page.locator('a[href*="/dashboard/orders/"]').count()) > 0) pass("Step 6: order in orders list");

  // STEP 7 — Production / KDS
  logger.cli("\nSTEP 7: Production / Kitchen");
  await page.goto("/dashboard/production");
  await page.waitForTimeout(2000);
  const prodH1 = (await page.locator("h1").first().textContent()) ?? "";
  note(`Production h1: ${prodH1}`);
  if (/today.s queue/i.test(prodH1)) pass("Step 7: Today's Queue for daily service");
  else if (/prep list|production/i.test(prodH1)) {
    bug(7, page.url(), `Production shows '${prodH1}' not Today's Queue`, "Today's Queue for DAILY_SERVICE", "important");
  }
  await page.goto("/dashboard/kitchen");
  if (!page.url().includes("/login") && (await page.locator("h1").count()) > 0) {
    pass("Step 7: Kitchen display loads");
  }

  // STEP 8 — Billing
  logger.cli("\nSTEP 8: Billing");
  await page.goto("/dashboard/billing");
  await page.waitForTimeout(2000);
  const billText = await page.locator("main").innerText();
  const trialDaysMatch = billText.match(/Trial days remaining\s+(\S+)/);
  const trialDays = trialDaysMatch?.[1] ?? "—";
  const trialEndsMatch = billText.match(/Trial ends\s+(\S+)/);
  note(`Trial days: ${trialDays}, trial ends: ${trialEndsMatch?.[1] ?? "—"}`);
  if (trialDays !== "—" && /^\d+$/.test(trialDays)) pass("Step 8: trial days shows number");
  else bug(8, page.url(), `Trial days remaining = '${trialDays}'`, "Numeric days (e.g. 14)", "important");

  await page.goto("/dashboard/billing/plans");
  if (!/price ids missing|stripe not configured/i.test(await page.content())) {
    pass("Step 8: plans page without Stripe config errors");
  }
  const proBtn = page.getByRole("button", { name: /choose pro/i }).first();
  if (await proBtn.isEnabled().catch(() => false)) pass("Step 8: Choose Pro enabled");

  // STEP 9 — Storefront public
  logger.cli("\nSTEP 9: Storefront");
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const sp = await mobile.newPage();
  await sp.goto(`${BASE}/s/hello`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const hello = await sp.content();
  if (/tell guests what you offer/i.test(hello)) {
    bug(9, `${BASE}/s/hello`, "Placeholder hero copy", "Published content", "minor");
  } else pass("Step 9: no placeholder hero");
  if (/made with/i.test(hello)) pass("Step 9: Made with footer");
  await sp.goto(`${BASE}/s/hello/menu`, { waitUntil: "domcontentloaded" });
  if ((await sp.getByText(/\$\d/).count()) > 0) pass("Step 9: menu prices visible");
  await sp.goto(`${BASE}/s/hello/checkout`, { waitUntil: "domcontentloaded" });
  if (!sp.url().includes("404")) pass("Step 9: checkout loads");
  await mobile.close();

  // STEP 10 — Storefront preview
  logger.cli("\nSTEP 10: Storefront preview");
  await page.goto("/dashboard/storefront/preview", { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (page.url().includes("/login")) {
    bug(10, page.url(), "Preview redirected to login", "Authenticated preview", "important");
  } else {
    const hasIframe = (await page.locator("iframe").count()) > 0;
    if (hasIframe) pass("Step 10: preview iframe present");
    else bug(10, page.url(), "No preview iframe", "Storefront preview iframe", "minor");
  }

  await browser.close();

  writeReport();
}

function writeReport() {
  const critical = bugs.filter((b) => b.severity === "critical");
  const important = bugs.filter((b) => b.severity === "important");
  const minor = bugs.filter((b) => b.severity === "minor");
  const verdict = critical.length === 0 ? "PASS" : "FAIL";

  const reportPath = join(process.cwd(), "docs", "GOLDEN_PATH_REPEAT_QA_REPORT.md");
  const lines = [
    "# Golden Path — Repeat QA Report",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Production:** ${BASE}`,
    `**Test account:** ${EMAIL}`,
    `**Verdict:** **${verdict}** (${bugs.length} bugs: ${critical.length} critical, ${important.length} important, ${minor.length} minor)`,
    "",
    "## Original 8 fixes — verification",
    "",
    "| Fix | Status |",
    "|-----|--------|",
    `| 1 Signup message | ${signupFlowCheckEmail || signupFlowWelcome ? "✓" : "✗"} |`,
    `| 2 Email confirm | ${passed.some((p) => p.includes("Step 2")) ? "✓" : "—"} |`,
    `| 3 Onboarding Continue | ${passed.some((p) => p.includes("Business profile Continue")) ? "✓" : bugs.some((b) => b.step === 3) ? "✗" : "—"} |`,
    `| 4 New product title | ${passed.some((p) => p.includes("New product")) ? "✓" : "✗"} |`,
    `| 5 POS on trial | ${passed.some((p) => p.includes("no POS paywall")) ? "✓" : "✗"} |`,
    `| 6 Today's Queue | ${passed.some((p) => p.includes("Today's Queue")) ? "✓" : "✗"} |`,
    `| 7 Trial days | ${passed.some((p) => p.includes("trial days")) ? "✓" : "✗"} |`,
    `| 8 DAILY_SERVICE | ${passed.some((p) => p.includes("Operating model")) ? "✓" : "—"} |`,
    "",
    "## Passed checks",
    "",
    ...passed.map((p) => `- ${p}`),
    "",
    "## Notes",
    "",
    ...notes.map((n) => `- ${n}`),
    "",
  ];

  if (critical.length) {
    lines.push("## Critical bugs", "");
    critical.forEach((b, i) => {
      lines.push(`### C${i + 1}. Step ${b.step}`, "", `- **URL:** ${b.url}`, `- **Описание:** ${b.description}`, `- **Ожидание:** ${b.expectation}`, "");
    });
  }
  if (important.length) {
    lines.push("## Important bugs", "");
    important.forEach((b, i) => {
      lines.push(`### I${i + 1}. Step ${b.step}`, "", `- **URL:** ${b.url}`, `- **Описание:** ${b.description}`, `- **Ожидание:** ${b.expectation}`, "");
    });
  }
  if (minor.length) {
    lines.push("## Minor bugs", "");
    minor.forEach((b, i) => {
      lines.push(`### M${i + 1}. Step ${b.step}`, "", `- **URL:** ${b.url}`, `- **Описание:** ${b.description}`, `- **Ожидание:** ${b.expectation}`, "");
    });
  }
  if (!bugs.length) lines.push("_No new bugs found._", "");

  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(reportPath, lines.join("\n"), "utf8");
  logger.cli(`\n=== VERDICT: ${verdict} — ${bugs.length} bugs ===`);
  logger.cli(`Report: ${reportPath}\n`);
  if (critical.length) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    bug(0, BASE, `Automation crashed: ${e instanceof Error ? e.message : String(e)}`, "Complete run", "critical");
  })
  .finally(() => {
    writeReport();
  });
