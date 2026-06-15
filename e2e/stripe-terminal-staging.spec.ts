import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import {
  mapReaderStatus,
  nextReconnectDelayMs,
} from "@/lib/payments/stripe-terminal-client";

import {
  installStripeTerminalMock,
  mockStripeTerminalApi,
} from "./helpers/stripe-terminal-mock";
import {
  skipStripeTerminalLiveIfNotReady,
  skipStripeTerminalStagingIfNotReady,
} from "./helpers/stripe-terminal-staging-ready";
import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

/**
 * Stripe Terminal **staging** E2E — simulated reader checkout + vault-gated live token probe.
 *
 * - Engine path: reader status + reconnect backoff (always runs).
 * - Mock UI path: authed POS card-terminal sale with simulated reader.
 * - Staging path: live `/api/pos/terminal` connection token when Stripe vault present.
 *
 * @see docs/stripe-terminal-sales-one-pager.md
 * @see e2e/stripe-terminal-payment.spec.ts — baseline mock flow
 * @see e2e/pos-checkout-staging.spec.ts — cash staging patterns
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

function terminalAmountCents(amount: number): number {
  return Math.round(amount * 100);
}

async function preparePosTerminal(page: Page): Promise<void> {
  await installStripeTerminalMock(page);
  await mockStripeTerminalApi(page);
  await page.goto("/dashboard/pos/terminal");

  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }
  if ((await page.getByTestId("pos-product-tile").count()) === 0) {
    test.skip(true, "No POS-visible products.");
  }
}

async function selectCardTerminalPayment(page: Page): Promise<void> {
  await page.getByLabel(/^payment$/i).click();
  await page.getByRole("option", { name: /card terminal/i }).click();
  await expect(page.getByTestId("stripe-terminal-reader")).toBeVisible({ timeout: 30_000 });
}

async function completeSimulatedTerminalSale(page: Page): Promise<string | null> {
  await page.getByTestId("pos-product-tile").first().click();
  await selectCardTerminalPayment(page);
  await expect(page.getByText(/connected/i)).toBeVisible({ timeout: 30_000 });

  await page.getByTestId("pos-complete-sale").click();
  await expect(page.getByTestId("pos-checkout-status")).toContainText(/tap card|ready/i, {
    timeout: 60_000,
  });

  await expect(page.getByTestId("stripe-terminal-checkout")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /tap, insert, or swipe card/i }).click();
  await expect(page.getByTestId("stripe-terminal-receipt-preview")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/payment approved/i)).toBeVisible();

  const statusText = (await page.getByTestId("pos-checkout-status").textContent()) ?? "";
  const orderMatch = statusText.match(/order\s+([a-f0-9-]{8,36})/i);
  return orderMatch?.[1]?.replace(/…$/, "").slice(0, 8) ?? null;
}

test.describe("stripe terminal staging engine", () => {
  test("mapReaderStatus covers staging reconnect states", () => {
    expect(mapReaderStatus({ connected: false, processing: false, readerStatus: null })).toBe(
      "disconnected",
    );
    expect(mapReaderStatus({ connected: true, processing: false, readerStatus: "offline" })).toBe(
      "offline",
    );
    expect(mapReaderStatus({ connected: true, processing: true, readerStatus: "online" })).toBe(
      "processing",
    );
  });

  test("nextReconnectDelayMs caps backoff for flaky staging readers", () => {
    expect(nextReconnectDelayMs(0)).toBe(1_000);
    expect(nextReconnectDelayMs(3)).toBe(8_000);
    expect(nextReconnectDelayMs(8)).toBe(15_000);
  });

  test("terminal amount rounds to Stripe cents", () => {
    expect(terminalAmountCents(12.345)).toBe(1_235);
    expect(terminalAmountCents(0.5)).toBe(50);
    expect(terminalAmountCents(99.999)).toBe(10_000);
  });
});

test.describe("stripe terminal staging page (chromium)", () => {
  test("POS terminal loads or redirects to login", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");
    await skipIfLoginRedirect(page);
    await expect(page.locator("body")).not.toContainText(/Something went wrong/i);
    await expect(
      page
        .getByTestId("pos-product-tile")
        .or(page.getByRole("link", { name: /add register/i }))
        .or(page.getByText(/not available on your current plan/i)),
    ).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("stripe terminal staging UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Stripe Terminal staging UI runs in chromium-authed project only",
    );
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Requires E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("simulated reader completes card-terminal sale on staging workspace", async ({ page }) => {
    await preparePosTerminal(page);
    const orderPrefix = await completeSimulatedTerminalSale(page);
    expect(orderPrefix).toBeTruthy();

    if (hasDb && orderPrefix) {
      const order = await prisma.order.findFirst({
        where: { id: { startsWith: orderPrefix } },
        select: { paymentStatus: true, paymentMode: true },
      });
      if (order) {
        expect(order.paymentStatus).toBe("PAID");
        expect(order.paymentMode).toMatch(/CARD_TERMINAL|CARD/i);
      }
    }
  });

  test("hardware settings panel lists Stripe Terminal reader catalog", async ({ page }) => {
    await page.goto("/dashboard/settings/hardware");
    await expect(page.getByRole("heading", { name: /payment hardware/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("stripe-terminal-hardware-panel")).toBeVisible();
    await expect(page.getByTestId("hardware-catalog-stripe_m2")).toBeVisible();
  });
});

test.describe("stripe terminal staging (vault gated — live token)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Live Stripe Terminal token probe runs in chromium-authed project only",
    );
    skipStripeTerminalStagingIfNotReady();
    skipStripeTerminalLiveIfNotReady();
  });

  test("GET /api/pos/terminal returns connection token on staging", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");
    await expect(page.locator("body")).not.toContainText(/Something went wrong/i, {
      timeout: 60_000,
    });

    const response = await page.request.get("/api/pos/terminal");
    if (response.status() === 403) {
      test.skip(true, "E2E user lacks pos.checkout — cannot issue Terminal token");
    }

    expect(response.status()).toBe(200);
    const payload = (await response.json()) as { token?: string };
    expect(payload.token?.trim().length).toBeGreaterThan(10);
  });

  test("staging POS terminal shows reader panel when entitled", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");

    const planBlocked = await page
      .getByText(/not available on your current plan|POS is not available/i)
      .isVisible()
      .catch(() => false);
    if (planBlocked) {
      test.skip(true, "POS terminal not entitled on staging workspace plan.");
    }

    await expect(page.getByTestId("stripe-terminal-reader").or(page.getByLabel(/^payment$/i))).toBeVisible({
      timeout: 60_000,
    });
  });
});
