import { describe, expect, it } from "vitest";

import { verifyExperimentalCron } from "@/lib/security/cron-auth";

describe("experimental cron gate", () => {
  it("returns 200 skipped when disabled", () => {
    const prevSecret = process.env.CRON_SECRET;
    const prevExp = process.env.ENABLE_EXPERIMENTAL_CRONS;
    process.env.CRON_SECRET = "test-secret";
    delete process.env.ENABLE_EXPERIMENTAL_CRONS;

    const req = new Request("http://localhost/api/cron/test", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const res = verifyExperimentalCron(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.response.status).toBe(200);
    }

    if (prevSecret) process.env.CRON_SECRET = prevSecret;
    else delete process.env.CRON_SECRET;
    if (prevExp) process.env.ENABLE_EXPERIMENTAL_CRONS = prevExp;
  });
});
