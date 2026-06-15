import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const AUDIT_PATH = join(process.cwd(), "docs/toast-gap-analysis.md");
const TRACKER_PATH = join(process.cwd(), "artifacts/competitor-feature-tracker.json");

describe("toast gap analysis doc", () => {
  it("exists with Toast-specific sections and honesty rules", () => {
    const doc = readFileSync(AUDIT_PATH, "utf8");
    expect(doc).toContain("# Toast gap analysis — OS Kitchen");
    expect(doc).toContain("toast-gap-analysis-v1");
    expect(doc).toContain("## Executive summary");
    expect(doc).toContain("## When Toast wins");
    expect(doc).toContain("## Gap matrix");
    expect(doc).toContain("## Mitigation roadmap");
    expect(doc).toContain("Toast IQ");
    expect(doc).toContain("0 signed LOI");
    expect(doc).toContain("competitor-comparison-honest.md");
  });

  it("aligns with competitor tracker Toast head-to-head", () => {
    const doc = readFileSync(AUDIT_PATH, "utf8");
    const tracker = JSON.parse(readFileSync(TRACKER_PATH, "utf8")) as {
      competitorComparison: { headToHead: { toast: { competitorWins: string[] } } };
    };
    const toastWins = tracker.competitorComparison.headToHead.toast.competitorWins;
    expect(toastWins.length).toBeGreaterThan(0);
    expect(doc).toContain("Toast Go");
    expect(doc).toContain("xtraCHEF");
    for (const win of toastWins.slice(0, 3)) {
      expect(doc.toLowerCase()).toContain(win.split(" ")[0]!.toLowerCase());
    }
  });
});
