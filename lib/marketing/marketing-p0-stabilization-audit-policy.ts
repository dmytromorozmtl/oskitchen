import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P0_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p0-stabilization-patterns";

/**
 * MKT-38 — capstone audit composing MKT-01 through MKT-10 P0 marketing deliverables.
 */

export const MARKETING_P0_STABILIZATION_AUDIT_POLICY_ID =
  MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID;

export type MarketingP0StabilizationSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type MarketingP0StabilizationAuditReport = {
  policyId: typeof MARKETING_P0_STABILIZATION_AUDIT_POLICY_ID;
  subAudits: MarketingP0StabilizationSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditMkt01ForbiddenClaimsTraining(root: string): boolean {
  const source = readSurface(root, "docs/forbidden-claims-training.md");
  return (
    source.includes("quarterly certification quiz") &&
    source.includes("forbidden")
  );
}

function auditMkt02IcpDefinition(root: string): boolean {
  const source = readSurface(root, "docs/icp-definition-final.md");
  return (
    source.includes("Ghost kitchen") &&
    source.includes("Commissary") &&
    source.includes("Meal prep")
  );
}

function auditMkt03LoiOutreach(root: string): boolean {
  const source = readSurface(root, "docs/loi-outreach-email.md");
  return source.includes("10 target criteria") && source.includes("LOI");
}

function auditMkt04PilotPricing(root: string): boolean {
  const source = readSurface(root, "app/pricing/page.tsx");
  return source.includes("PilotPricingSection") && source.includes("Pilot SKUs");
}

function auditMkt05CompetitorComparison(root: string): boolean {
  const source = readSurface(root, "docs/competitor-comparison-honest.md");
  return source.includes("Toast") && source.includes("Square");
}

function auditMkt06IntegrationHealthLanding(root: string): boolean {
  const source = readSurface(root, "app/page.tsx");
  return source.includes("LandingIntegrationHealthMoat");
}

function auditMkt07SoftwareFirstPos(root: string): boolean {
  const source = readSurface(root, "docs/software-first-pos-positioning.md");
  return source.includes("hardware") && source.includes("software-first");
}

function auditMkt08TrustPage(root: string): boolean {
  const source = readSurface(root, "app/trust/page.tsx");
  return (
    source.includes("TrustMaturityLabelsSection") &&
    source.includes("SKIPPED") &&
    source.includes("BETA")
  );
}

function auditMkt09VerifyClaimsCi(root: string): boolean {
  const source = readSurface(root, ".github/workflows/verify-claims.yml");
  return source.includes("verify-claims") && source.includes("pull_request");
}

function auditMkt10SeriesAHold(root: string): boolean {
  const source = readSurface(root, "docs/series-a-hold-notice.md");
  return source.includes("Hold summary") && source.includes("Series A");
}

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root: string) => { policyId: string; surface: string; passed: boolean }
> = {
  "MKT-01": (root) => ({
    policyId: "forbidden-claims-training-mkt01-v1",
    surface: "docs/forbidden-claims-training.md",
    passed: auditMkt01ForbiddenClaimsTraining(root),
  }),
  "MKT-02": (root) => ({
    policyId: "icp-definition-final-mkt02-v1",
    surface: "docs/icp-definition-final.md",
    passed: auditMkt02IcpDefinition(root),
  }),
  "MKT-03": (root) => ({
    policyId: "loi-outreach-email-mkt03-v1",
    surface: "docs/loi-outreach-email.md",
    passed: auditMkt03LoiOutreach(root),
  }),
  "MKT-04": (root) => ({
    policyId: "pilot-pricing-page-mkt04-v1",
    surface: "app/pricing/page.tsx",
    passed: auditMkt04PilotPricing(root),
  }),
  "MKT-05": (root) => ({
    policyId: "competitor-comparison-honest-mkt05-v1",
    surface: "docs/competitor-comparison-honest.md",
    passed: auditMkt05CompetitorComparison(root),
  }),
  "MKT-06": (root) => ({
    policyId: "integration-health-landing-mkt06-v1",
    surface: "app/page.tsx",
    passed: auditMkt06IntegrationHealthLanding(root),
  }),
  "MKT-07": (root) => ({
    policyId: "software-first-pos-mkt07-v1",
    surface: "docs/software-first-pos-positioning.md",
    passed: auditMkt07SoftwareFirstPos(root),
  }),
  "MKT-08": (root) => ({
    policyId: "trust-page-mkt08-v1",
    surface: "app/trust/page.tsx",
    passed: auditMkt08TrustPage(root),
  }),
  "MKT-09": (root) => ({
    policyId: "verify-claims-ci-mkt09-v1",
    surface: ".github/workflows/verify-claims.yml",
    passed: auditMkt09VerifyClaimsCi(root),
  }),
  "MKT-10": (root) => ({
    policyId: "series-a-hold-notice-mkt10-v1",
    surface: "docs/series-a-hold-notice.md",
    passed: auditMkt10SeriesAHold(root),
  }),
};

export function auditMarketingP0Stabilization(
  root = process.cwd(),
): MarketingP0StabilizationAuditReport {
  const subAudits = MARKETING_P0_STABILIZATION_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: report.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_P0_STABILIZATION_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
