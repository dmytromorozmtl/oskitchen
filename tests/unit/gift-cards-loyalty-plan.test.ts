import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/gift-cards-loyalty-plan.md");
const LIMITATION_PATH = join(process.cwd(), "docs/sales-limitation-sheet.md");
const CRM_ROADMAP_PATH = join(process.cwd(), "docs/crm-loyalty-growth-roadmap.md");
const CROSS_CHANNEL_POLICY_PATH = join(
  process.cwd(),
  "lib/rewards/cross-channel-rewards-era14-policy.ts",
);
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("gift cards and loyalty plan doc", () => {
  it("exists with dual ledger, phases, and service references", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Gift cards and loyalty plan — OS Kitchen");
    expect(doc).toContain("gift-cards-loyalty-plan-v1");
    expect(doc).toContain("dual ledger");
    expect(doc).toContain("deferred_locked");
    expect(doc).toContain("gift-card-service.ts");
    expect(doc).toContain("restaurant-loyalty-service.ts");
    expect(doc).toContain("## Phase 2 — Parity certification");
    expect(doc).toContain("cross-channel-rewards-honesty-checklist.md");
  });

  it("reflects NO-GO baseline and aligns with limitation sheet and policy", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const limitation = readFileSync(LIMITATION_PATH, "utf8");
    const crm = readFileSync(CRM_ROADMAP_PATH, "utf8");
    const policy = readFileSync(CROSS_CHANNEL_POLICY_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("separate ledgers");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("Unified loyalty");
    expect(limitation).toContain("unified gift card / loyalty");
    expect(crm).toContain("gift cards");
    expect(policy).toContain("deferred_locked");
  });
});
