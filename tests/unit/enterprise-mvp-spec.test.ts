import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SPEC_PATH = join(process.cwd(), "docs/enterprise-mvp-spec.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("enterprise MVP spec doc", () => {
  it("exists with pillars, waves, and DoD", () => {
    const doc = readFileSync(SPEC_PATH, "utf8");
    expect(doc).toContain("# Enterprise MVP spec — OS Kitchen");
    expect(doc).toContain("enterprise-mvp-spec-v1");
    expect(doc).toContain("## Enterprise MVP pillars");
    expect(doc).toContain("## Implementation waves");
    expect(doc).toContain("## Definition of done");
    expect(doc).toContain("enterprise-procurement-pack.md");
    expect(doc).toContain("integration-escalation-matrix.md");
    expect(doc).toContain("pilot-acceptance-criteria.md");
  });

  it("reflects NO-GO baseline and forbidden enterprise claims", () => {
    const doc = readFileSync(SPEC_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 signed LOI");
    expect(doc).toContain("17 LIVE partner integrations");
    expect(doc).toContain("SOC 2 Type II attestation");
    expect(doc).toContain("Do **not** contract");
    expect(doc).toContain("sales-limitation-sheet.md");
    expect(doc).toContain("Uber Direct");
    expect(doc).toContain("PLACEHOLDER");
  });
});
