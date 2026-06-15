import { expect, test } from "@playwright/test";

/**
 * Unauthenticated HTTP smoke for staging deploy verification.
 *
 * Run (one command per line in zsh):
 *   export PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app
 *   npm run test:e2e:pilot:http
 */
function resolveBaseUrl(): string | null {
  const raw =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (!u.protocol.startsWith("http")) return null;
    return u.origin;
  } catch {
    return null;
  }
}

const BASE = resolveBaseUrl();

test.describe("Pilot golden path — HTTP (no auth)", () => {
  test.beforeEach(() => {
    test.skip(!BASE, "Set PLAYWRIGHT_BASE_URL=https://your-staging.vercel.app");
  });

  test("health returns ok or degraded with JSON", async ({ request }) => {
    const res = await request.get(`${BASE}/api/health`);
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
  });

  test("login and signup pages load", async ({ request }) => {
    expect((await request.get(`${BASE}/login`)).status()).toBe(200);
    expect((await request.get(`${BASE}/signup`)).status()).toBe(200);
  });

  test("cron requires auth", async ({ request }) => {
    expect((await request.get(`${BASE}/api/cron/webhook-jobs`)).status()).toBe(401);
  });

  test("experimental cron returns 404", async ({ request }) => {
    expect((await request.get(`${BASE}/api/cron/martian-orbital-dtn-relay-sync`)).status()).toBe(404);
  });

  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/today`);
    await expect(page).toHaveURL(/\/login/);
  });
});
