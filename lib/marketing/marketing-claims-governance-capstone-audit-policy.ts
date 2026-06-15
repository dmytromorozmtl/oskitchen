import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
  MARKETING_CLAIMS_REGISTRY_PATH,
} from "@/lib/governance/marketing-claims-governance-policy";
import { auditMarketingFullStabilization } from "@/lib/marketing/marketing-full-stabilization-audit-policy";
import {
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID,
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-claims-governance-capstone-patterns";

/**
 * MKT-40 — capstone audit for sales-safe claims registry + CI governance + MKT-39 marketing stabilization.
 */

export const MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID =
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID;

export type MarketingClaimsGovernanceCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type MarketingClaimsGovernanceCapstoneAuditReport = {
  policyId: typeof MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: MarketingClaimsGovernanceCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditClaimsRegistryDoc(root: string): boolean {
  const source = readSurface(root, "docs/sales-safe-claims-registry.md");
  return (
    source.includes("sales-safe-claims-registry-v1") &&
    source.includes("Verdict vocabulary") &&
    source.includes(MARKETING_CLAIMS_REGISTRY_PATH) &&
    source.includes("marketing-claims-governance-policy")
  );
}

const CLAIMS_REGISTRY_ALLOWED_STATUSES = ["verified", "illustrative", "deprecated"] as const;

function auditClaimsRegistryJson(root: string): boolean {
  const raw = readSurface(root, MARKETING_CLAIMS_REGISTRY_PATH);
  const entries = JSON.parse(raw) as unknown[];
  if (!Array.isArray(entries) || entries.length < 5) return false;
  const validRows = entries.every((row) => {
    if (typeof row !== "object" || row === null || !("claim" in row) || !("status" in row)) {
      return false;
    }
    const status = (row as { status: string }).status;
    return CLAIMS_REGISTRY_ALLOWED_STATUSES.includes(
      status as (typeof CLAIMS_REGISTRY_ALLOWED_STATUSES)[number],
    );
  });
  const verifiedCount = entries.filter(
    (row) =>
      typeof row === "object" &&
      row !== null &&
      (row as { status: string }).status === "verified",
  ).length;
  return validRows && verifiedCount >= 3;
}

function auditGovernancePolicyModule(root: string): boolean {
  const source = readSurface(root, "lib/governance/marketing-claims-governance-policy.ts");
  return (
    source.includes(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID) &&
    source.includes("MARKETING_CLAIMS_FORBIDDEN_PHRASES") &&
    source.includes("verify-claims")
  );
}

function auditVerifyClaimsCi(root: string): boolean {
  const source = readSurface(root, ".github/workflows/verify-claims.yml");
  return source.includes("verify-claims") && source.includes("pull_request");
}

function auditForbiddenTrainingLinkage(root: string): boolean {
  const source = readSurface(root, "docs/forbidden-claims-training.md");
  return (
    source.includes("sales-safe-claims-registry") &&
    source.includes("verify-claims") &&
    source.includes("quarterly certification quiz")
  );
}

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root: string) => { policyId: string; passed: boolean }
> = {
  "claims-registry-doc": (root) => ({
    policyId: "sales-safe-claims-registry-mkt40-v1",
    passed: auditClaimsRegistryDoc(root),
  }),
  "claims-registry-json": (root) => ({
    policyId: "claims-registry-json-mkt40-v1",
    passed: auditClaimsRegistryJson(root),
  }),
  "governance-policy": (root) => ({
    policyId: MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
    passed: auditGovernancePolicyModule(root),
  }),
  "verify-claims-ci": (root) => ({
    policyId: "verify-claims-ci-mkt40-v1",
    passed: auditVerifyClaimsCi(root),
  }),
  "forbidden-training": (root) => ({
    policyId: "forbidden-claims-training-mkt40-v1",
    passed: auditForbiddenTrainingLinkage(root),
  }),
  "MKT-39": (root) => {
    const report = auditMarketingFullStabilization(root);
    return {
      policyId: report.policyId,
      passed: report.passed,
    };
  },
};

export function auditMarketingClaimsGovernanceCapstone(
  root = process.cwd(),
): MarketingClaimsGovernanceCapstoneAuditReport {
  const subAudits = MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
