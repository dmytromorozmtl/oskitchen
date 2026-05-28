import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_FORBIDDEN_CLAIMS,
  COMMERCIAL_PILOT_RUNBOOK_DOC,
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS,
  COMMERCIAL_PILOT_TIER0_CI_COMMANDS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";

const ROOT = process.cwd();

describe("commercial pilot runbook policy", () => {
  it("locks era7 commercial pilot runbook policy", () => {
    expect(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID).toBe("era7-commercial-pilot-runbooks-v1");
    expect(COMMERCIAL_PILOT_TIER0_CI_COMMANDS.join(" ")).toContain("test:ci:governance-bundles");
  });

  it("runbook contains required sections and avoids forbidden pilot claims", () => {
    const content = readFileSync(join(ROOT, COMMERCIAL_PILOT_RUNBOOK_DOC), "utf8");
    expect(content).toContain(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID);
    for (const section of COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS) {
      expect(content, `missing ${section}`).toContain(`## ${section}`);
    }
    for (const phrase of COMMERCIAL_PILOT_FORBIDDEN_CLAIMS) {
      expect(content, `forbidden: ${phrase}`).not.toContain(phrase);
    }
    expect(content).toContain("feature-maturity-matrix.md");
  });
});
