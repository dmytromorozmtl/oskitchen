import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const NARRATIVE_PATH = join(process.cwd(), "docs/series-a-narrative.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("series a narrative doc", () => {
  it("exists with fundraise readiness and honest traction sections", () => {
    const doc = readFileSync(NARRATIVE_PATH, "utf8");
    expect(doc).toContain("# Series A narrative prep — OS Kitchen");
    expect(doc).toContain("series-a-narrative-v1");
    expect(doc).toContain("NOT fundraise-ready");
    expect(doc).toContain("## Milestones to Series A readiness");
    expect(doc).toContain("7 proprietary AI modules");
    expect(doc).toContain("What to say / what not to say");
    expect(doc).toContain("pilot-gono-go-summary.json");
  });

  it("reflects current NO-GO pilot decision", () => {
    const doc = readFileSync(NARRATIVE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
      loiSignedDate: string | null;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(pilot.loiSignedDate).toBeNull();
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 signed LOI");
  });
});
