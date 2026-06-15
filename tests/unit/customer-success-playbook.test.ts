import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAYBOOK_PATH = join(process.cwd(), "docs/customer-success-playbook.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("customer success playbook doc", () => {
  it("exists with lifecycle and gate references", () => {
    const doc = readFileSync(PLAYBOOK_PATH, "utf8");
    expect(doc).toContain("# Customer Success Playbook — OS Kitchen");
    expect(doc).toContain("customer-success-playbook-v1");
    expect(doc).toContain("## Customer lifecycle map");
    expect(doc).toContain("Gate A");
    expect(doc).toContain("Gate B");
    expect(doc).toContain("Gate C");
    expect(doc).toContain("pilot-execution-checklist.md");
    expect(doc).toContain("incident-response-process.md");
  });

  it("reflects pre-customer NO-GO baseline and honesty rules", () => {
    const doc = readFileSync(PLAYBOOK_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 active pilots");
    expect(doc).toContain("does **not** upgrade");
    expect(doc).toContain("sales-limitation-sheet.md");
    expect(doc).toContain("no 24/7");
  });
});
