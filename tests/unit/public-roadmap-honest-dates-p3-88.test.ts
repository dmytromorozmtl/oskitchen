import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPublicRoadmapP388,
  formatPublicRoadmapP388AuditLines,
} from "@/lib/marketing/public-roadmap-honest-dates-p3-88-audit";
import { validatePublicRoadmapHonestDates } from "@/lib/marketing/public-roadmap-honest-dates-p3-88-measurement";
import {
  PUBLIC_ROADMAP_P3_88_ARTIFACT,
  PUBLIC_ROADMAP_P3_88_CHECK_NPM_SCRIPT,
  PUBLIC_ROADMAP_P3_88_CI_WORKFLOW,
  PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS,
  PUBLIC_ROADMAP_P3_88_DOC,
  PUBLIC_ROADMAP_P3_88_POLICY_ID,
  PUBLIC_ROADMAP_P3_88_UNIT_TEST,
  PUBLIC_ROADMAP_P3_88_WIRING_PATHS,
} from "@/lib/marketing/public-roadmap-honest-dates-p3-88-policy";
import {
  PUBLIC_ROADMAP_OUT_OF_SCOPE,
  PUBLIC_ROADMAP_QUARTERS,
} from "@/lib/marketing/public-roadmap-content";

const ROOT = process.cwd();

describe("Public roadmap honest dates (P3-88)", () => {
  it("locks policy with confidence levels on all items", () => {
    expect(PUBLIC_ROADMAP_P3_88_POLICY_ID).toBe("public-roadmap-honest-dates-p3-88-v1");
    expect(PUBLIC_ROADMAP_QUARTERS).toHaveLength(3);

    const allItems = [
      ...PUBLIC_ROADMAP_QUARTERS.flatMap((q) => q.items),
      ...PUBLIC_ROADMAP_OUT_OF_SCOPE,
    ];
    for (const item of allItems) {
      expect(PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS).toContain(item.confidence);
    }
  });

  it("validates honest quarter dates and no hardware in quarters", () => {
    const validation = validatePublicRoadmapHonestDates();
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.quarterLabelsHonest).toBe(true);
    expect(validation.noHardwareInQuarters).toBe(true);
    expect(validation.noBannedUndatedPhrases).toBe(true);
  });

  it("passes full P3-88 public roadmap audit", () => {
    const summary = auditPublicRoadmapP388(ROOT);
    expect(summary.contentHonest).toBe(true);
    expect(summary.pageShowsConfidence).toBe(true);
    expect(summary.upstreamLinked).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-88 wiring paths, CI gate, and artifact", () => {
    for (const path of PUBLIC_ROADMAP_P3_88_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PUBLIC_ROADMAP_P3_88_CHECK_NPM_SCRIPT]).toContain(
      PUBLIC_ROADMAP_P3_88_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, PUBLIC_ROADMAP_P3_88_CI_WORKFLOW), "utf8");
    expect(ci).toContain(PUBLIC_ROADMAP_P3_88_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, PUBLIC_ROADMAP_P3_88_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(PUBLIC_ROADMAP_P3_88_POLICY_ID);
    expect(artifact.hardwareInQuarters).toBe(false);

    const doc = readFileSync(join(ROOT, PUBLIC_ROADMAP_P3_88_DOC), "utf8");
    expect(doc).toContain(PUBLIC_ROADMAP_P3_88_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditPublicRoadmapP388(ROOT);
    const lines = formatPublicRoadmapP388AuditLines(summary);
    expect(lines.some((line) => line.includes(PUBLIC_ROADMAP_P3_88_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
