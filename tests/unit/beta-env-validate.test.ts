import { describe, expect, it } from "vitest";

import { validateEnvField } from "@/lib/beta-ops/env-validate";
import { healthyStreak } from "@/lib/beta-ops/daily-ops-streak";

describe("validateEnvField", () => {
  it("accepts https smoke URL", () => {
    const r = validateEnvField("SMOKE_BASE_URL", "https://staging.example.com");
    expect(r?.ok).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = validateEnvField("E2E_LOGIN_EMAIL", "not-an-email");
    expect(r?.ok).toBe(false);
  });

  it("accepts UUID for delivery connection", () => {
    const r = validateEnvField(
      "SMOKE_DELIVERY_CONNECTION_ID_OTHER",
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(r?.ok).toBe(true);
  });

  it("validates cohort email list", () => {
    const r = validateEnvField("BETA_COHORT_EMAILS", "a@b.com,c@d.com");
    expect(r?.ok).toBe(true);
  });
});

describe("healthyStreak", () => {
  it("returns zero when no reports", () => {
    expect(healthyStreak([])).toEqual({ streak: 0, totalDays: 0 });
  });

  it("counts consecutive healthy days from end", () => {
    const reports = [
      { day: "2026-05-15", summary: { unhealthy: 0 } },
      { day: "2026-05-16", summary: { unhealthy: 1 } },
      { day: "2026-05-17", summary: { unhealthy: 0 } },
    ] as Parameters<typeof healthyStreak>[0];
    expect(healthyStreak(reports)).toEqual({ streak: 1, totalDays: 3 });
  });
});
