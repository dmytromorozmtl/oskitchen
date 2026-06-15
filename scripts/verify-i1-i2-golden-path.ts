/**
 * Focused verification for I1 (recommended modules) and I2 (POS auto-register).
 * Usage: npx tsx scripts/verify-i1-i2-golden-path.ts
 */
import { join } from "node:path";

import { chromium } from "playwright";

const BASE = "https://os-kitchen.com";
const TS = Date.now();
const EMAIL = `gp-i1i2-${TS}@kitchenos-test.com`;
const PASSWORD = "TestPass123!";

function loadEnv() {
  const { config } = require("dotenv") as typeof import("dotenv");
  config({ path: join(process.cwd(), ".env.local") });
}

async function cardTitle(page: import("playwright").Page) {
  await page.waitForSelector(".text-2xl.font-semibold", { timeout: 60_000 });
  return (await page.locator(".text-2xl.font-semibold").first().textContent())?.trim() ?? "";
}

async function waitEnabledClick(page: import("playwright").Page, name: RegExp, timeoutMs = 30_000) {
  const btn = page.getByRole("button", { name }).first();
  await btn.waitFor({ state: "visible", timeout: timeoutMs });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await btn.isEnabled()) {
      await btn.click();
      return;
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`Button ${name} not enabled within ${timeoutMs}ms`);
}

async function waitForTitle(page: import("playwright").Page, pattern: RegExp, timeoutMs = 45_000) {
  await page.waitForFunction(
    (reSource) => {
      const el = document.querySelector(".text-2xl.font-semibold");
      const text = el?.textContent?.trim() ?? "";
      return new RegExp(reSource, "i").test(text);
    },
    pattern.source,
    { timeout: timeoutMs },
  );
}

async function advanceOnboardingToRecommended(page: import("playwright").Page) {
  await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/full name/i).fill("I1 I2 QA");
  await page.getByLabel(/^company/i).fill(`Kitchen ${TS}`);
  await page.getByLabel(/work email|email/i).fill(EMAIL);
  await page.getByLabel(/^password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 90_000 });
  if (!page.url().includes("/onboarding")) {
    await page.goto(`${BASE}/onboarding`, { waitUntil: "domcontentloaded" });
  }
  await page.waitForTimeout(2000);

  for (let guard = 0; guard < 20; guard++) {
    const title = await cardTitle(page);
    if (/recommended modules/i.test(title)) return title;
    if (/welcome/i.test(title)) {
      await waitEnabledClick(page, /^continue$/i);
      await page.waitForTimeout(1500);
      continue;
    }
    if (/business profile/i.test(title)) {
      await page.getByLabel(/business name/i).fill("GP Restaurant");
      await page.getByRole("radio", { name: /restaurant/i }).check();
      await page.getByLabel(/country/i).click();
      await page.getByRole("button", { name: /United States/i }).click();
      await waitEnabledClick(page, /^continue$/i);
      await waitForTitle(page, /operating model/);
      console.log("  business profile → operating model");
      continue;
    }
    if (/operating model/i.test(title)) {
      await page.getByRole("radio", { name: /walk-in|daily service/i }).first().check();
      await waitEnabledClick(page, /^continue$/i);
      await waitForTitle(page, /fulfillment/);
      console.log("  operating model → fulfillment");
      continue;
    }
    if (/fulfillment/i.test(title)) {
      await page.getByLabel(/pickup address/i).fill("123 Test St");
      await waitEnabledClick(page, /^continue$/i);
      await waitForTitle(page, /menu items|sales channels|recommended modules/);
      console.log(`  fulfillment → ${await cardTitle(page)}`);
      continue;
    }
    if (/weekly menu|brands/i.test(title)) {
      console.log(`  unexpected step for restaurant flow: ${title}`);
      await waitEnabledClick(page, /^skip$/i, 60_000);
      await page.waitForTimeout(2500);
      continue;
    }
    if (/menu items/i.test(title)) {
      await page.waitForTimeout(2000);
      await waitEnabledClick(page, /skip.*later/i, 60_000);
      await page.waitForTimeout(2500);
      continue;
    }
    if (/sales channels/i.test(title)) {
      await waitEnabledClick(page, /^continue$/i);
      await page.waitForTimeout(3000);
      continue;
    }
    await page.waitForTimeout(1000);
  }
  throw new Error(`Could not reach recommended modules; last title: ${await cardTitle(page)}`);
}

async function main() {
  loadEnv();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log("\n=== I1/I2 Golden Path Verification ===\n");
  console.log(`Account: ${EMAIL}\n`);

  let i1Pass = false;
  let i2Pass = false;

  try {
    await advanceOnboardingToRecommended(page);
    console.log("Reached Recommended modules step");

    const before = await cardTitle(page);
    const t0 = Date.now();
    await waitEnabledClick(page, /^continue$/i);
    for (let i = 0; i < 20; i++) {
      const title = await cardTitle(page);
      if (/ready|you're ready/i.test(title)) {
        i1Pass = Date.now() - t0 < 8000;
        console.log(`I1: advanced to "${title}" in ${Date.now() - t0}ms — ${i1Pass ? "PASS" : "FAIL (slow)"}`);
        break;
      }
      await page.waitForTimeout(400);
    }
    if (!i1Pass && !/ready/i.test(await cardTitle(page))) {
      console.log(`I1: FAIL — still on "${await cardTitle(page)}" after Continue`);
    }

    await page.getByRole("button", { name: /go to dashboard/i }).click().catch(() => {});
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 }).catch(() => {});

    await page.goto(`${BASE}/dashboard/pos/terminal`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    const mainText = (await page.locator("main").innerText()).toLowerCase();
    const blockedRegister = /add register|create a register/.test(mainText);
    const blockedStaff = /add at least one active staff|open staff/.test(mainText);
    const hasTiles = (await page.getByTestId("pos-product-tile").count()) > 0;

    i2Pass = !blockedRegister && !blockedStaff && (hasTiles || /pos terminal/i.test(mainText));
    console.log(
      `I2: register block=${blockedRegister}, staff block=${blockedStaff}, tiles=${hasTiles} — ${i2Pass ? "PASS" : "FAIL"}`,
    );
  } catch (e) {
    console.error("Verification error:", e);
  } finally {
    await browser.close();
  }

  const verdict = i1Pass && i2Pass ? "10/10 PASS" : "FAIL";
  console.log(`\n=== VERDICT: ${verdict} ===\n`);
  process.exit(i1Pass && i2Pass ? 0 : 1);
}

main();
