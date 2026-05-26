import { expect, test } from "@playwright/test";

test("webhook jobs cron rejects unauthenticated requests", async ({ request }) => {
  const res = await request.get("/api/cron/webhook-jobs");
  expect(res.status()).toBe(401);
});
