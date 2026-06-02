import type { Page } from "@playwright/test";

/**
 * Stub Stripe Connect hosted onboarding when account-link UI is exercised in browser.
 * Server-side Stripe API calls from Next.js actions are not intercepted here.
 */
export async function mockVendorStripeConnectAPI(page: Page): Promise<void> {
  await page.route("**/connect.stripe.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>Stripe Connect test onboarding (mock)</h1></body></html>",
    });
  });

  await page.route("**/js.stripe.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "// stripe mock" });
  });
}
