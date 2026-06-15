import { expect, test, type Page } from "@playwright/test";

import {
  processTerminalCardPayment,
  type StripeTerminalPaymentResult,
} from "@/lib/payments/stripe-terminal-client";

import {
  installStripeTerminalMock,
  mockStripeTerminalApi,
} from "./helpers/stripe-terminal-mock";

/**
 * Stripe Terminal payment E2E — simulated reader (no physical hardware or Stripe vault).
 *
 * @see docs/stripe-terminal-sales-one-pager.md
 * @see e2e/helpers/stripe-terminal-mock.ts
 */

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

test.describe("stripe terminal payment (simulated reader mock)", () => {
  test("processTerminalCardPayment completes with mocked terminal + API", async () => {
    const calls: string[] = [];
    const terminal = {
      collectPaymentMethod: async () => {
        calls.push("collect");
        return { paymentIntent: { id: "pi_unit_mock" } };
      },
      processPayment: async (pi: { id: string }) => {
        calls.push("process");
        return { paymentIntent: pi };
      },
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("/api/pos/terminal") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            clientSecret: "pi_secret_mock",
            paymentIntentId: "pi_unit_mock",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("/api/pos/terminal") && init?.method === "PUT") {
        return new Response(
          JSON.stringify({ success: true, transaction: { id: "txn-mock" } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return originalFetch(input, init);
    };

    try {
      const result: StripeTerminalPaymentResult = await processTerminalCardPayment({
        terminal: terminal as never,
        amount: 12.5,
        orderId: "order-mock-e2e",
      });
      expect(result.paymentIntentId).toBe("pi_unit_mock");
      expect(result.transaction).toEqual({ id: "txn-mock" });
      expect(calls).toEqual(["collect", "process"]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test.describe("stripe terminal POS UI (chromium-authed)", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Requires E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD (chromium-authed project)",
    );
  });

  test("connect reader → process payment → receipt preview", async ({ page }) => {
    await preparePosTerminal(page);
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
  });

  test("disconnect mid-transaction shows graceful fallback", async ({ page }) => {
    await preparePosTerminal(page);
    await page.getByTestId("pos-product-tile").first().click();
    await selectCardTerminalPayment(page);
    await page.getByRole("button", { name: /^disconnect$/i }).click();

    await expect(page.getByText(/disconnected/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/use cash or saved card until the reader reconnects/i),
    ).toBeVisible();
  });

  test("offline blocks card terminal complete sale", async ({ page, context }) => {
    await preparePosTerminal(page);
    await page.getByTestId("pos-product-tile").first().click();
    await selectCardTerminalPayment(page);

    await context.setOffline(true);
    await page.getByTestId("pos-complete-sale").click();
    await expect(page.getByTestId("pos-checkout-status")).toContainText(/reconnect|offline/i, {
      timeout: 30_000,
    });
    await context.setOffline(false);
  });
});
