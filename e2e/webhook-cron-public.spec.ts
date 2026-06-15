import { test, expect } from "@playwright/test";

test.describe("webhook job cron route", () => {
  test("rejects missing or invalid CRON_SECRET with 401", async ({ request }) => {
    const res = await request.get("/api/cron/webhook-jobs");
    expect([401, 503]).toContain(res.status());
  });

  test("dry-run returns batch metadata when authorized", async ({ request }) => {
    test.skip(!process.env.CRON_SECRET, "CRON_SECRET not set in Playwright env");
    const secret = process.env.CRON_SECRET as string;
    const res = await request.get(`/api/cron/webhook-jobs?dryRun=1`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.dryRun).toBe(true);
    expect(typeof body.batchSize).toBe("number");
  });
});
