import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const STRATEGY_PATH = join(process.cwd(), "docs/restaurant-partnerships-strategy.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("restaurant partnerships strategy doc", () => {
  it("exists with taxonomy, phases, and outreach playbook", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    expect(doc).toContain("# Restaurant industry partnerships strategy — OS Kitchen");
    expect(doc).toContain("restaurant-partnerships-strategy-v1");
    expect(doc).toContain("## Partnership taxonomy");
    expect(doc).toContain("Design partner");
    expect(doc).toContain("## Phased execution");
    expect(doc).toContain("loi-design-partner-template.md");
    expect(doc).toContain("vendor-seeding-strategy.md");
    expect(doc).toContain("CUSTOMER_ADVISORY_BOARD.md");
  });

  it("reflects NO-GO baseline and partner honesty gates", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 signed operator LOIs");
    expect(doc).toContain("Do **not** name");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("BETA");
  });
});
