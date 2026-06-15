import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/freemium-tier-plan.md");
const MARKETPLACE_PRICING_PATH = join(process.cwd(), "docs/marketplace-pricing-strategy.md");
const PLAN_REGISTRY_PATH = join(process.cwd(), "lib/billing/plan-registry.ts");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("freemium tier plan doc", () => {
  it("exists with options, proposed FREE caps, and rollout phases", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Freemium entry point plan — OS Kitchen");
    expect(doc).toContain("freemium-tier-plan-v1");
    expect(doc).toContain("## Strategic options");
    expect(doc).toContain("## Proposed FREE tier");
    expect(doc).toContain("SubscriptionPlan");
    expect(doc).toContain("PLAN_REGISTRY");
    expect(doc).toContain("feature-registry.ts");
    expect(doc).toContain("Phase 2 — Extended trial");
  });

  it("reflects NO-GO baseline and distinguishes vendor FREE tier", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const marketplace = readFileSync(MARKETPLACE_PRICING_PATH, "utf8");
    const registry = readFileSync(PLAN_REGISTRY_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("no FREE subscription plan in code");
    expect(doc).toContain("$29/mo");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("Free POS");
    expect(registry).toContain("STARTER");
    expect(registry).not.toContain("FREE:");
    expect(marketplace).toContain("FREE");
  });
});
