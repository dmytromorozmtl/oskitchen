import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { verifyCronSecret } from "@/lib/security/cron-auth";

describe("cron auth hardening", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret-value";
  });

  it("rejects invalid bearer tokens with timing-safe comparison", () => {
    const req = new Request("http://localhost/api/cron/webhook-jobs", {
      headers: { Authorization: "Bearer wrong-secret-value" },
    });
    const res = verifyCronSecret(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("invalid_authorization");
      expect(res.response.status).toBe(401);
    }
  });

  it("accepts valid bearer token", () => {
    const req = new Request("http://localhost/api/cron/webhook-jobs", {
      headers: { Authorization: "Bearer test-cron-secret-value" },
    });
    expect(verifyCronSecret(req).ok).toBe(true);
  });

  it("fails closed when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/cron/webhook-jobs", {
      headers: { Authorization: "Bearer anything" },
    });
    const res = verifyCronSecret(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("missing_secret");
      expect(res.response.status).toBe(503);
    }
  });
});

describe("runCronRoute cron auth audit wiring", () => {
  it("logs cron.auth_denied when bearer auth fails", () => {
    const source = readFileSync(join(process.cwd(), "lib/api/run-cron.ts"), "utf8");
    expect(source).toContain("logCronAuthDenied");
    expect(source).toContain('"reason" in auth');
  });
});
