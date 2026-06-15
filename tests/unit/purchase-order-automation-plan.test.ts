import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/purchase-order-automation-plan.md");
const ARCH_PATH = join(process.cwd(), "docs/PURCHASING_ARCHITECTURE.md");
const AUTOMATION_TYPES_PATH = join(process.cwd(), "lib/ai/purchasing-automation-types.ts");
const CHECKOUT_GATE_PATH = join(process.cwd(), "components/marketplace/checkout-approval-gate.tsx");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("purchase order automation plan doc", () => {
  it("exists with dual tracks, phases, and automation defaults", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Purchase order automation plan — OS Kitchen");
    expect(doc).toContain("purchase-order-automation-plan-v1");
    expect(doc).toContain("purchasing-automation.ts");
    expect(doc).toContain("MarketplacePurchaseOrder");
    expect(doc).toContain("CheckoutApprovalGate");
    expect(doc).toContain("## Phase 2 — Certification checklist");
    expect(doc).toContain("AUTO_PURCHASE_AUTO_APPROVE_MAX");
  });

  it("reflects NO-GO baseline and default automation off", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const arch = readFileSync(ARCH_PATH, "utf8");
    const types = readFileSync(AUTOMATION_TYPES_PATH, "utf8");
    const gate = readFileSync(CHECKOUT_GATE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("enabled: false");
    expect(doc).toContain("Autonomous purchasing");
    expect(doc).toContain("ai-honesty-policy.md");
    expect(arch).toContain("purchasing-service.ts");
    expect(types).toContain("enabled: false");
    expect(gate).toContain("checkout-approval-gate-required");
  });
});
