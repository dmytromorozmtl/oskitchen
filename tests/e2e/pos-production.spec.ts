import { expect, test } from "@playwright/test";

/**
 * POS production path — delegates to authenticated POS checkout in `e2e/pos-checkout-flow.spec.ts`.
 * This spec runs a lightweight health gate for CI-critical-paths when dashboard creds are absent.
 */
test("POS module health endpoint responds", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});
