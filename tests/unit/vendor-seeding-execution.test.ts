import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const EXECUTION_PATH = join(process.cwd(), "docs/vendor-seeding-execution.md");
const STRATEGY_PATH = join(process.cwd(), "docs/vendor-seeding-strategy.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("vendor seeding execution doc", () => {
  it("exists with phases, checklists, and sign-off gates", () => {
    const doc = readFileSync(EXECUTION_PATH, "utf8");
    expect(doc).toContain("# Vendor seeding execution plan — OS Kitchen");
    expect(doc).toContain("vendor-seeding-execution-v1");
    expect(doc).toContain("## E0 — Platform prep");
    expect(doc).toContain("## E1 — Core three vendors");
    expect(doc).toContain("## E2 — Breadth vendors");
    expect(doc).toContain("E1 sign-off");
    expect(doc).toContain("vendor-seeding-strategy.md");
    expect(doc).toContain("stripe-connect-vendor-test-plan.md");
    expect(doc).toContain("e2e/marketplace-checkout.spec.ts");
  });

  it("aligns with strategy roster and NO-GO baseline", () => {
    const doc = readFileSync(EXECUTION_PATH, "utf8");
    const strategy = readFileSync(STRATEGY_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("EcoPack");
    expect(doc).toContain("CleanPro");
    expect(doc).toContain("ChefTools");
    expect(strategy).toContain("EcoPack Supplies");
    expect(doc).toContain("sales-limitation-sheet.md");
    expect(doc).toContain("never");
    expect(doc).toContain("national vendor network");
  });
});
