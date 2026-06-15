import { afterEach, describe, expect, it } from "vitest";

import {
  assertNodeStartupReadiness,
  collectProductionReadinessIssues,
  productionStartupReadinessFailure,
  shouldFatalOnNodeStartup,
} from "@/lib/startup/production-readiness";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("production startup readiness", () => {
  it("reports distributed rate-limit blockers in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.RATE_LIMIT_ADAPTER;
    delete process.env.REDIS_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.CRON_SECRET = "cron-secret";

    expect(collectProductionReadinessIssues()).toEqual([
      {
        id: "rate_limit",
        message:
          "Distributed rate limiting is required in production for critical routes. Configure Upstash or Redis before serving traffic.",
      },
    ]);
    expect(productionStartupReadinessFailure()).toContain("Distributed rate limiting is required");
  });

  it("aggregates queue and rate-limit production blockers", () => {
    process.env.NODE_ENV = "production";
    delete process.env.CRON_SECRET;
    delete process.env.RATE_LIMIT_ADAPTER;
    delete process.env.REDIS_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const issues = collectProductionReadinessIssues();
    expect(issues.map((issue) => issue.id)).toEqual(["rate_limit", "webhook_queue"]);
    expect(productionStartupReadinessFailure()).toContain("CRON_SECRET");
  });

  it("only enables fatal boot enforcement for real production-serving contexts", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    expect(shouldFatalOnNodeStartup()).toBe(false);

    process.env.VERCEL_ENV = "production";
    expect(shouldFatalOnNodeStartup()).toBe(true);

    process.env.CI = "1";
    expect(shouldFatalOnNodeStartup()).toBe(false);
  });

  it("throws on node startup when fatal enforcement is active and blockers remain", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "production";
    delete process.env.CRON_SECRET;
    delete process.env.RATE_LIMIT_ADAPTER;
    delete process.env.REDIS_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(() => assertNodeStartupReadiness()).toThrow(/Production startup readiness failed/);
  });
});
