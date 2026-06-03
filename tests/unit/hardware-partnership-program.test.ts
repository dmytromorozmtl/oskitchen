import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/hardware-partnership-program.md");
const COMPANION_PATH = join(process.cwd(), "docs/hardware-partner-program.md");
const TERMINAL_DOC_PATH = join(process.cwd(), "docs/stripe-terminal-hardware.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("hardware partnership program doc", () => {
  it("exists with certified devices and partner pricing", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Hardware Partnership Program — OS Kitchen");
    expect(doc).toContain("hardware-partnership-program-v1");
    expect(doc).toContain("## Certified device catalog");
    expect(doc).toContain("Stripe Reader M2");
    expect(doc).toContain("WisePOS E");
    expect(doc).toContain("Verifone P400");
    expect(doc).toContain("## Partner pricing model");
    expect(doc).toContain("Restaurant bundle pricing");
    expect(doc).toContain("Partner referral economics");
  });

  it("links companion program and stripe terminal doc", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const companion = readFileSync(COMPANION_PATH, "utf8");
    const terminal = readFileSync(TERMINAL_DOC_PATH, "utf8");
    expect(doc).toContain("hardware-partner-program.md");
    expect(companion).toContain("hardware-partner-program");
    expect(terminal).toContain("stripe-terminal-hardware-service.ts");
  });

  it("reflects honest NO-GO baseline", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as { decision: string };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("0 signed hardware partners");
    expect(doc).toContain("Forbidden");
  });
});
