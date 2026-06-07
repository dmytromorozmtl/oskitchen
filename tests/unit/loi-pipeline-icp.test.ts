import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditLoiPipelineIcpDoc,
  LOI_PIPELINE_ICP_DOC,
  LOI_PIPELINE_ICP_DISQUALIFIERS,
  LOI_PIPELINE_ICP_POLICY_ID,
  LOI_PIPELINE_ICP_PRIMARY_SEGMENTS,
  LOI_PIPELINE_ICP_REQUIRED_CRITERIA,
  LOI_PIPELINE_ICP_REQUIRED_HEADINGS,
  LOI_PIPELINE_STAGES,
} from "@/lib/commercial/loi-pipeline-icp-policy";
import { evaluatePilotIcpQualification } from "@/lib/commercial/pilot-icp-contract-era17";

const ROOT = process.cwd();

describe("LOI pipeline and ICP targeting (Task 26)", () => {
  it("locks absolute-final pipeline policy id and doc path", () => {
    expect(LOI_PIPELINE_ICP_POLICY_ID).toBe("loi-pipeline-icp-absolute-final-v1");
    expect(LOI_PIPELINE_ICP_DOC).toBe("docs/loi-signed.md");
    expect(LOI_PIPELINE_STAGES).toHaveLength(7);
    expect(LOI_PIPELINE_ICP_PRIMARY_SEGMENTS).toEqual([
      "Ghost kitchen",
      "Commissary",
      "Meal prep",
    ]);
  });

  it("passes audit on canonical loi-signed human gate doc", () => {
    const source = readFileSync(join(ROOT, LOI_PIPELINE_ICP_DOC), "utf8");
    const audit = auditLoiPipelineIcpDoc(source);
    expect(audit.missingHeadings, audit.missingHeadings.join("; ")).toEqual([]);
    expect(audit.stageCount).toBe(LOI_PIPELINE_STAGES.length);
    expect(audit.segmentCount).toBe(LOI_PIPELINE_ICP_PRIMARY_SEGMENTS.length);
    expect(audit.passed).toBe(true);
  });

  it("includes all required human gate headings", () => {
    const source = readFileSync(join(ROOT, LOI_PIPELINE_ICP_DOC), "utf8");
    for (const heading of LOI_PIPELINE_ICP_REQUIRED_HEADINGS) {
      expect(source).toContain(heading);
    }
    for (const criterion of LOI_PIPELINE_ICP_REQUIRED_CRITERIA) {
      expect(source).toContain(criterion);
    }
    for (const disqualifier of LOI_PIPELINE_ICP_DISQUALIFIERS) {
      expect(source).toContain(disqualifier);
    }
  });

  it("wires ICP evaluator for qualified design partner profile", () => {
    const result = evaluatePilotIcpQualification({
      singleOrSmallMultiUnit: true,
      ownerOperatorEngaged: true,
      needsCoreKitchenOrderPath: true,
      acceptsQualifiedBetaLabels: true,
    });
    expect(result.qualified).toBe(true);
    expect(result.disqualifiers).toEqual([]);
    expect(result.missingCriteria).toEqual([]);
  });

  it("rejects enterprise SSO-first prospects via ICP evaluator", () => {
    const result = evaluatePilotIcpQualification({
      singleOrSmallMultiUnit: true,
      ownerOperatorEngaged: true,
      needsCoreKitchenOrderPath: true,
      acceptsQualifiedBetaLabels: true,
      requiresProductionSso: true,
    });
    expect(result.qualified).toBe(false);
    expect(result.disqualifiers.length).toBeGreaterThan(0);
  });
});
