import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditFreePilotTierProgramWiring } from "@/lib/commercial/free-pilot-tier-program-audit";
import {
  FREE_PILOT_TIER_CI_SCRIPTS,
  FREE_PILOT_TIER_MAX_SLOTS,
  FREE_PILOT_TIER_PROGRAM_ABSOLUTE_FINAL_POLICY_ID,
  FREE_PILOT_TIER_PROGRAM_DOC,
  FREE_PILOT_TIER_REQUIRED_SECTIONS,
  FREE_PILOT_TIER_TERM_DAYS,
  FREE_PILOT_TIER_UNIT_TEST,
} from "@/lib/commercial/free-pilot-tier-program-absolute-final-policy";

const ROOT = process.cwd();

describe("Free pilot tier program (Absolute Final Task 71)", () => {
  it("locks absolute final policy with five slots and 90-day term", () => {
    expect(FREE_PILOT_TIER_PROGRAM_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "free-pilot-tier-program-absolute-final-v1",
    );
    expect(FREE_PILOT_TIER_PROGRAM_DOC).toBe("docs/free-pilot-tier-program.md");
    expect(FREE_PILOT_TIER_MAX_SLOTS).toBe(5);
    expect(FREE_PILOT_TIER_TERM_DAYS).toBe(90);
    expect(FREE_PILOT_TIER_REQUIRED_SECTIONS).toHaveLength(8);
  });

  it("documents eligibility, obligations, and conversion", () => {
    const doc = readFileSync(join(ROOT, FREE_PILOT_TIER_PROGRAM_DOC), "utf8");
    expect(doc).toContain("free-pilot-tier-program-absolute-final-v1");
    expect(doc).toContain("## Program summary");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("Honesty rule");
    expect(doc).toContain("not free forever");
    expect(doc).toContain("4 remaining");
  });

  it("passes wiring audit", () => {
    const audit = auditFreePilotTierProgramWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.sectionCount).toBe(FREE_PILOT_TIER_REQUIRED_SECTIONS.length);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of FREE_PILOT_TIER_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(FREE_PILOT_TIER_UNIT_TEST).toBe(
      "tests/unit/free-pilot-tier-program-absolute-final.test.ts",
    );
  });
});
