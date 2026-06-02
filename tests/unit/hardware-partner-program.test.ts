import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PROGRAM_PATH = join(process.cwd(), "docs/hardware-partner-program.md");
const PARTNERSHIPS_PATH = join(process.cwd(), "docs/restaurant-partnerships-strategy.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("hardware partner program doc", () => {
  it("exists with tiers, categories, and validation checklist", () => {
    const doc = readFileSync(PROGRAM_PATH, "utf8");
    expect(doc).toContain("# Hardware partner program — OS Kitchen");
    expect(doc).toContain("hardware-partner-program-v1");
    expect(doc).toContain("## Partner tiers");
    expect(doc).toContain("L1 Validated");
    expect(doc).toContain("## Hardware categories & platform truth");
    expect(doc).toContain("Stripe Terminal");
    expect(doc).toContain("KITCHEN_CAMERA_SYNTHETIC");
    expect(doc).toContain("## Validation checklist (L1)");
    expect(doc).toContain("kitchen-camera-honest-positioning.md");
    expect(doc).toContain("POS_ARCHITECTURE.md");
  });

  it("reflects NO-GO baseline and honest hardware posture", () => {
    const doc = readFileSync(PROGRAM_PATH, "utf8");
    const partnerships = readFileSync(PARTNERSHIPS_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("0 signed hardware partners");
    expect(doc).toContain("BYO device");
    expect(doc).toContain("software-first");
    expect(doc).toContain("Toast Go equivalent");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(partnerships).toContain("hardware-partner-program.md");
  });
});
