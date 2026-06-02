import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const OKR_PATH = join(process.cwd(), "docs/q3-2026-okrs.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");
const SERIES_A_PATH = join(process.cwd(), "docs/series-a-narrative.md");

describe("q3 2026 okrs doc", () => {
  it("exists with objectives and scoring guide", () => {
    const doc = readFileSync(OKR_PATH, "utf8");
    expect(doc).toContain("# Q3 2026 OKRs — OS Kitchen");
    expect(doc).toContain("q3-2026-okrs-v1");
    expect(doc).toContain("July 1 – September 30, 2026");
    expect(doc).toContain("## O1");
    expect(doc).toContain("## O2");
    expect(doc).toContain("## Scoring guide");
    expect(doc).toContain("pilot-acceptance-criteria.md");
  });

  it("reflects NO-GO baseline and Series A M1/M2 alignment", () => {
    const doc = readFileSync(OKR_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
      loiSignedDate: string | null;
    };
    const seriesA = readFileSync(SERIES_A_PATH, "utf8");
    expect(pilot.decision).toBe("NO-GO");
    expect(pilot.loiSignedDate).toBeNull();
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("Signed LOI / design partners");
    expect(doc).toContain("| **0** |");
    expect(doc).toContain("P0 staging smokes");
    expect(seriesA).toContain("M1");
    expect(seriesA).toContain("M2");
    expect(doc).toContain("M1 First LOI");
    expect(doc).toContain("M2 P0 smokes PASS");
  });
});
