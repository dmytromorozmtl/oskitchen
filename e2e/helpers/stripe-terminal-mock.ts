import type { Page } from "@playwright/test";

/** Injected before navigation — simulated Stripe Terminal.js reader for CI (no hardware). */
export const STRIPE_TERMINAL_MOCK_INIT_SCRIPT = `
window.__KOS_STRIPE_TERMINAL_MOCK__ = {
  create: function () {
    var connected = false;
    var currentReader = null;
    return {
      discoverReaders: async function () {
        if (!connected) {
          return {
            discoveredReaders: [
              {
                id: "sim_reader_m2",
                label: "Simulated Reader M2",
                status: "online",
                device_type: "simulated_wisepos_e",
                battery_level: 88,
              },
            ],
          };
        }
        return { discoveredReaders: currentReader ? [currentReader] : [] };
      },
      connectReader: async function (reader) {
        connected = true;
        currentReader = reader;
        return { reader: reader };
      },
      disconnectReader: async function () {
        connected = false;
        currentReader = null;
      },
      collectPaymentMethod: async function () {
        if (!connected) {
          return { error: { message: "Reader disconnected" } };
        }
        return { paymentIntent: { id: "pi_simulated_e2e_" + Date.now() } };
      },
      processPayment: async function (paymentIntent) {
        if (!connected) {
          return { error: { message: "Reader disconnected" } };
        }
        return { paymentIntent: paymentIntent };
      },
    };
  },
};
`;

export async function installStripeTerminalMock(page: Page): Promise<void> {
  await page.addInitScript(STRIPE_TERMINAL_MOCK_INIT_SCRIPT);
}

export async function mockStripeTerminalApi(page: Page): Promise<void> {
  await page.route("**/api/pos/terminal**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: "mock_terminal_connection_token" }),
      });
      return;
    }
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          clientSecret: "pi_mock_secret_simulated",
          paymentIntentId: "pi_mock_simulated_e2e",
        }),
      });
      return;
    }
    if (method === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          transaction: { id: "txn-mock-e2e-001", paymentStatus: "PAID" },
        }),
      });
      return;
    }
    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
      return;
    }
    await route.continue();
  });
}
