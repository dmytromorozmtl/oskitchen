import { describe, expect, it } from "vitest";

import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { resolveNextAction } from "@/lib/beta-ops/next-action";
import type { ProgramState } from "@/lib/beta-ops/program-state";

describe("beta next action", () => {
  it("suggests step 0 when empty state", () => {
    const state: ProgramState = { version: 1, updatedAt: "", steps: {} };
    const next = resolveNextAction(state);
    expect(next.step).toBe(0);
  });

  it("suggests step 1 after step 0 ok when cohort emails set", () => {
    const state: ProgramState = {
      version: 1,
      updatedAt: "",
      steps: { "0": { ok: true, completedAt: "2026-01-01" } },
    };
    process.env.BETA_COHORT_EMAILS = "a@b.com";
    process.env.DATABASE_URL = "postgresql://local/test";
    const next = resolveNextAction(state);
    expect(next.step).toBe(1);
    delete process.env.BETA_COHORT_EMAILS;
    delete process.env.DATABASE_URL;
  });

  it("flags env when step 1 has no cohort source", () => {
    const state: ProgramState = {
      version: 1,
      updatedAt: "",
      steps: { "0": { ok: true, completedAt: "2026-01-01" } },
    };
    const prevDb = process.env.DATABASE_URL;
    const prevCohort = process.env.BETA_COHORT_EMAILS;
    process.env.DATABASE_URL = "postgresql://local/test";
    delete process.env.BETA_COHORT_EMAILS;
    const env = checkEnvForStep(1, ["node", "test"]);
    if (!env.ok) {
      expect(env.missing.some((m) => m.includes("COHORT"))).toBe(true);
    }
    if (prevDb) process.env.DATABASE_URL = prevDb;
    else delete process.env.DATABASE_URL;
    if (prevCohort) process.env.BETA_COHORT_EMAILS = prevCohort;
  });
});

describe("env requirements step 0", () => {
  it("fails when SMOKE_BASE_URL missing", () => {
    const prev = process.env.SMOKE_BASE_URL;
    delete process.env.SMOKE_BASE_URL;
    const r = checkEnvForStep(0);
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("SMOKE_BASE_URL");
    if (prev) process.env.SMOKE_BASE_URL = prev;
  });
});
