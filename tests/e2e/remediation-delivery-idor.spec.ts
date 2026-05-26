import { test, expect } from "@playwright/test";

/**
 * Delivery IDOR smoke — uses chromium-authed storage (e2e/auth.setup.ts).
 *
 *   SMOKE_DELIVERY_CONNECTION_ID_OTHER=<tenant-b-uuid> npx playwright test tests/e2e/remediation-delivery-idor.spec.ts --project=chromium-authed
 */
const otherConn = process.env.SMOKE_DELIVERY_CONNECTION_ID_OTHER?.trim();

test.describe("delivery API tenant isolation", () => {
  test.skip(!otherConn, "Set SMOKE_DELIVERY_CONNECTION_ID_OTHER");

  test("quote with another tenant connection returns 404", async ({ request }) => {
    const res = await request.post("/api/delivery/quote", {
      data: { connectionId: otherConn },
    });
    expect(res.status()).toBe(404);
  });

  test("create with another tenant connection returns 404", async ({ request }) => {
    const res = await request.post("/api/delivery/create", {
      data: { connectionId: otherConn },
    });
    expect(res.status()).toBe(404);
  });
});
