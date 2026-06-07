import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditBusFactorMitigationWiring } from "@/lib/ops/bus-factor-mitigation-audit";
import {
  BUS_FACTOR_ADR_FILES,
  BUS_FACTOR_ENGINEERING_ONBOARDING_DOC,
  BUS_FACTOR_MITIGATION_ABSOLUTE_FINAL_POLICY_ID,
  BUS_FACTOR_MITIGATION_CI_SCRIPTS,
  BUS_FACTOR_MITIGATION_DOC_PATH,
  BUS_FACTOR_MITIGATION_UNIT_TEST,
  BUS_FACTOR_SCORECARD_TARGETS,
  BUS_FACTOR_VIDEO_WALKTHROUGH_DOC,
} from "@/lib/ops/bus-factor-mitigation-absolute-final-policy";

const ROOT = process.cwd();

describe("bus factor mitigation (Absolute Final Task 67)", () => {
  it("locks absolute final policy with onboarding + ADR + video paths", () => {
    expect(BUS_FACTOR_MITIGATION_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "bus-factor-mitigation-absolute-final-v1",
    );
    expect(BUS_FACTOR_ADR_FILES.length).toBeGreaterThanOrEqual(
      BUS_FACTOR_SCORECARD_TARGETS.minAdrCount,
    );
    expect(BUS_FACTOR_ENGINEERING_ONBOARDING_DOC).toBe("docs/engineering-onboarding.md");
    expect(BUS_FACTOR_VIDEO_WALKTHROUGH_DOC).toBe("docs/engineering-video-walkthrough.md");
  });

  it("documents bus factor 1 honesty in mitigation plan", () => {
    const doc = readFileSync(join(ROOT, BUS_FACTOR_MITIGATION_DOC_PATH), "utf8");
    expect(doc).toContain("bus factor **1**");
    expect(doc).toContain("engineering-onboarding.md");
    expect(doc).toContain("engineering-video-walkthrough.md");
    expect(doc).toContain("docs/adr/");
  });

  it("passes wiring audit for onboarding, video, and ADRs", () => {
    const audit = auditBusFactorMitigationWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.adrCount).toBe(6);
  });

  it("includes ADR 0006 knowledge transfer decision", () => {
    const adr = readFileSync(join(ROOT, "docs/adr/0006-engineering-knowledge-transfer.md"), "utf8");
    expect(adr).toContain("bus factor 1");
    expect(adr).toContain("engineering-onboarding.md");
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of BUS_FACTOR_MITIGATION_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(BUS_FACTOR_MITIGATION_UNIT_TEST).toBe(
      "tests/unit/bus-factor-mitigation-absolute-final.test.ts",
    );
  });
});
