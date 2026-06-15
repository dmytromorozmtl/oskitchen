import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoiPipeline,
  formatLoiPipelineAuditLines,
} from "@/lib/pm/loi-pipeline-p3-126-audit";
import {
  loadLoiPipelineShortlist,
  validateLoiPipelineShortlist,
} from "@/lib/pm/loi-pipeline-p3-126-operations";
import {
  LOI_PIPELINE_CI_WORKFLOW,
  LOI_PIPELINE_DOC,
  LOI_PIPELINE_NPM_SCRIPT,
  LOI_PIPELINE_POLICY_ID,
  LOI_PIPELINE_REQUIRED_ICP_SEGMENTS,
  LOI_PIPELINE_SHORTLIST_ARTIFACT,
  LOI_PIPELINE_SHORTLIST_SLOT_COUNT,
  LOI_PIPELINE_STAGES,
  LOI_PIPELINE_TARGET_SIGNED_LOI_COUNT,
  LOI_PIPELINE_UNIT_TEST,
} from "@/lib/pm/loi-pipeline-p3-126-policy";

const ROOT = process.cwd();

describe("LOI pipeline (P3-126)", () => {
  it("locks policy id and five-slot shortlist", () => {
    expect(LOI_PIPELINE_POLICY_ID).toBe("loi-pipeline-p3-126-v1");
    expect(LOI_PIPELINE_SHORTLIST_SLOT_COUNT).toBe(5);
    expect(LOI_PIPELINE_TARGET_SIGNED_LOI_COUNT).toBe(3);
    expect(LOI_PIPELINE_STAGES).toContain("discovery_completed");
    expect(LOI_PIPELINE_STAGES).toContain("loi_signed");
  });

  it("validates shortlist artifact structure", () => {
    const shortlist = loadLoiPipelineShortlist(ROOT);
    const validation = validateLoiPipelineShortlist(shortlist);
    expect(validation.valid).toBe(true);
    expect(validation.slotCountCorrect).toBe(true);
    expect(validation.requiredSegmentsCovered).toBe(true);

    const segments = new Set(shortlist.slots.map((slot) => slot.segment));
    for (const segment of LOI_PIPELINE_REQUIRED_ICP_SEGMENTS) {
      expect(segments.has(segment)).toBe(true);
    }
  });

  it("passes full LOI pipeline audit", () => {
    const summary = auditLoiPipeline(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.shortlistValid).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.discoveryCallWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, LOI_PIPELINE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, LOI_PIPELINE_SHORTLIST_ARTIFACT))).toBe(true);
    expect(existsSync(join(ROOT, LOI_PIPELINE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOI_PIPELINE_NPM_SCRIPT]).toContain("audit-loi-pipeline-p3-126.ts");
    expect(pkg.scripts?.["test:ci:loi-pipeline-p3-126"]).toContain(LOI_PIPELINE_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, LOI_PIPELINE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:loi-pipeline-p3-126");
  });

  it("formats audit lines", () => {
    const summary = auditLoiPipeline(ROOT);
    const lines = formatLoiPipelineAuditLines(summary);
    expect(lines.some((line) => line.includes(LOI_PIPELINE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
