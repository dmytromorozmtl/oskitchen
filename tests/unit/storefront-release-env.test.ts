import { describe, expect, it } from "vitest";

import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";

describe("storefront release env", () => {
  it("flags missing critical secrets", () => {
    const keys = ["DATABASE_URL", "STOREFRONT_MIDDLEWARE_SECRET", "CRON_SECRET", "NEXT_PUBLIC_APP_URL"] as const;
    const saved: Partial<Record<(typeof keys)[number], string | undefined>> = {};
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    try {
      const checks = evaluateStorefrontReleaseEnv({ requireStripe: false });
      const summary = storefrontReleaseEnvSummary(checks);
      expect(summary.criticalFailed).toBeGreaterThan(0);
      expect(checks.find((c) => c.id === "database_url")?.passed).toBe(false);
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });

  it("requires stripe when requested", () => {
    const checks = evaluateStorefrontReleaseEnv({ requireStripe: true });
    const stripe = checks.find((c) => c.id === "stripe_secret");
    expect(stripe?.level).toBe("critical");
  });

  it("rejects placeholder NEXT_PUBLIC_APP_URL", () => {
    const saved = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app.yourdomain.com";
    try {
      const checks = evaluateStorefrontReleaseEnv({ requireStripe: false });
      const app = checks.find((c) => c.id === "app_url");
      expect(app?.passed).toBe(false);
      expect(app?.detail).toMatch(/Placeholder/i);
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = saved;
    }
  });
});
