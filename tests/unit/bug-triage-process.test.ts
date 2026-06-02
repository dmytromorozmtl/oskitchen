import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PROCESS_PATH = join(process.cwd(), "docs/bug-triage-process.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("bug triage process doc", () => {
  it("exists with priority matrix and workflow", () => {
    const doc = readFileSync(PROCESS_PATH, "utf8");
    expect(doc).toContain("# Bug triage process — OS Kitchen");
    expect(doc).toContain("bug-triage-process-v1");
    expect(doc).toContain("## Priority definitions");
    expect(doc).toContain("P0");
    expect(doc).toContain("P4");
    expect(doc).toContain("## Triage workflow");
    expect(doc).toContain("incident-response-process.md");
    expect(doc).toContain("integration-escalation-matrix.md");
    expect(doc).toContain("SUPPORT_INBOX.md");
  });

  it("distinguishes bugs from incidents and reflects NO-GO baseline", () => {
    const doc = readFileSync(PROCESS_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 active pilots");
    expect(doc).toContain("Bug vs incident escalation");
    expect(doc).toContain("sales-limitation-sheet.md");
    expect(doc).toContain("BETA");
    expect(doc).toContain("no contracted bug-fix SLA");
  });
});
