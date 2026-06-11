import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIntegrationHealthMarketing,
  formatIntegrationHealthMarketingAuditLines,
} from "@/lib/marketing/integration-health-marketing-audit";
import {
  INTEGRATION_HEALTH_MARKETING_AUDIT_SCRIPT,
  INTEGRATION_HEALTH_MARKETING_CI_WORKFLOW,
  INTEGRATION_HEALTH_MARKETING_DOC,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID,
  INTEGRATION_HEALTH_MARKETING_NPM_SCRIPT,
  INTEGRATION_HEALTH_MARKETING_POLICY_ID,
  INTEGRATION_HEALTH_MARKETING_ROUTE,
  INTEGRATION_HEALTH_MARKETING_UNIT_TEST,
} from "@/lib/marketing/integration-health-marketing-policy";
import { INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS } from "@/lib/marketing/integration-health-marketing-content";

const ROOT = process.cwd();

describe("Integration Health marketing (P1-73)", () => {
  it("locks policy id and three-step explainer concept", () => {
    expect(INTEGRATION_HEALTH_MARKETING_POLICY_ID).toBe(
      "integration-health-marketing-p1-73-v1",
    );
    expect(INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE).toContain(
      "operational truth before rush hour",
    );
    expect(INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS).toHaveLength(3);
    expect(INTEGRATION_HEALTH_MARKETING_ROUTE).toBe("/integration-health-center");
  });

  it("passes full Integration Health marketing audit", () => {
    const summary = auditIntegrationHealthMarketing(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.explainerWired).toBe(true);
    expect(summary.landingWired).toBe(true);
    expect(summary.homeMoatWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships explainer section with test id and step markers", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/integration-health-marketing-explainer-section.tsx"),
      "utf8",
    );
    expect(source).toContain("IntegrationHealthMarketingExplainerSection");
    expect(source).toContain("INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID");
    expect(source).toContain("integration-health-explainer-step-${step.id}");
    expect(INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID).toBe(
      "integration-health-marketing-explainer",
    );
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_MARKETING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_MARKETING_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_MARKETING_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INTEGRATION_HEALTH_MARKETING_NPM_SCRIPT]).toContain(
      "audit-integration-health-marketing.ts",
    );
    expect(pkg.scripts?.["test:ci:integration-health-marketing"]).toContain(
      INTEGRATION_HEALTH_MARKETING_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INTEGRATION_HEALTH_MARKETING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:integration-health-marketing");
  });

  it("formats audit lines", () => {
    const summary = auditIntegrationHealthMarketing(ROOT);
    const lines = formatIntegrationHealthMarketingAuditLines(summary);
    expect(lines.some((line) => line.includes(INTEGRATION_HEALTH_MARKETING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
