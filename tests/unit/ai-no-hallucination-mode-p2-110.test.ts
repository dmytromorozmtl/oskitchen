import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiNoHallucinationModeP2_110,
  formatAiNoHallucinationModeP2_110AuditLines,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-audit";
import { AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES } from "@/lib/ai/ai-no-hallucination-mode-p2-110-content";
import {
  AI_NO_HALLUCINATION_DEMO_INPUTS,
  buildNoHallucinationModeDemoReport,
  detectUnsupportedClaim,
  evaluateNoHallucinationClaim,
  isNoHallucinationModeCompliant,
  validateSourceBackedClaim,
  validateTenantDataScope,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-operations";
import {
  AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT,
  AI_NO_HALLUCINATION_MODE_P2_110_CI_WORKFLOW,
  AI_NO_HALLUCINATION_MODE_P2_110_DOC,
  AI_NO_HALLUCINATION_MODE_P2_110_NPM_SCRIPT,
  AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
  AI_NO_HALLUCINATION_MODE_P2_110_ROUTE,
  AI_NO_HALLUCINATION_MODE_P2_110_UNIT_TEST,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";

const ROOT = process.cwd();

describe("AI no hallucination mode (P2-110)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID).toBe("ai-no-hallucination-mode-p2-110-v1");
    expect(AI_NO_HALLUCINATION_MODE_P2_110_ROUTE).toBe("/dashboard/ai/no-hallucination-mode");
    expect(AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT).toBe(3);
    expect(AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES).toHaveLength(3);
  });

  it("passes full AI no hallucination mode audit", () => {
    const summary = auditAiNoHallucinationModeP2_110(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyHonestyLinked).toBe(true);
    expect(summary.legacyGuardrailsLinked).toBe(true);
    expect(summary.legacyCopilotLinked).toBe(true);
    expect(summary.legacyConfidenceLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("detects unsupported claim patterns", () => {
    expect(detectUnsupportedClaim("Guaranteed 100% accurate").blocked).toBe(true);
    expect(detectUnsupportedClaim("Yesterday +12% orders").blocked).toBe(false);
  });

  it("validates source-backed claims", () => {
    const backed = validateSourceBackedClaim({
      claim: "Low stock chicken",
      sourceType: "inventory",
      sourceId: "ing-1",
    });
    expect(backed.backed).toBe(true);
    expect(backed.reference).toBe("inventory:ing-1");

    const missing = validateSourceBackedClaim({ claim: "No source" });
    expect(missing.backed).toBe(false);
  });

  it("validates tenant data scope", () => {
    expect(
      validateTenantDataScope(
        { sourceType: "order", sourceId: "o-1", workspaceId: "ws-a" },
        "ws-a",
      ),
    ).toBe(true);
    expect(
      validateTenantDataScope(
        { sourceType: "order", sourceId: "o-1", workspaceId: "ws-b" },
        "ws-a",
      ),
    ).toBe(false);
  });

  it("evaluates demo claims with mixed verdicts", () => {
    const report = buildNoHallucinationModeDemoReport();
    expect(report.checkCount).toBe(AI_NO_HALLUCINATION_DEMO_INPUTS.length);
    expect(report.passCount).toBeGreaterThan(0);
    expect(report.blockedCount).toBeGreaterThan(0);
    expect(report.needsSourceCount).toBeGreaterThan(0);
    expect(isNoHallucinationModeCompliant(report)).toBe(false);

    const pass = evaluateNoHallucinationClaim({
      id: "test",
      claim: "Orders up 12% yesterday",
      sourceType: "order",
      sourceId: "ord-1",
      workspaceId: "ws-demo-001",
      tenantWorkspaceId: "ws-demo-001",
    });
    expect(pass.verdict).toBe("pass");
    expect(pass.tenantScoped).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_NO_HALLUCINATION_MODE_P2_110_NPM_SCRIPT]).toContain(
      "audit-ai-no-hallucination-mode-p2-110.ts",
    );
    expect(pkg.scripts["test:ci:ai-no-hallucination-mode-p2-110"]).toContain(
      AI_NO_HALLUCINATION_MODE_P2_110_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AI_NO_HALLUCINATION_MODE_P2_110_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_NO_HALLUCINATION_MODE_P2_110_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_NO_HALLUCINATION_MODE_P2_110_DOC))).toBe(true);
    expect(
      formatAiNoHallucinationModeP2_110AuditLines(auditAiNoHallucinationModeP2_110(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
