import {
  ACTION_MUTATION_OPERATIONS,
  type ActionMutationRisk,
} from "@/lib/permissions/action-mutation-registry";
import {
  DOMAIN_MUTATION_HELPERS,
  ENTERPRISE_MUTATION_REGISTRY_COUNTS,
  isEnterpriseMutationRegistryComplete,
} from "@/lib/permissions/domain-mutation-registry";
import { MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID } from "@/lib/permissions/mutation-registry-linter-era16-policy";
import { scanMutationRegistryCompliance } from "@/lib/permissions/mutation-registry-linter";

export type MutationRegistryDomainSummary = {
  domain: string;
  helperCount: number;
  operationCount: number;
  total: number;
  criticalCount: number;
};

export type MutationRegistryDashboardSnapshot = {
  policyId: string;
  counts: typeof ENTERPRISE_MUTATION_REGISTRY_COUNTS;
  enterpriseTargetMet: boolean;
  linter: {
    scannedFiles: number;
    violations: number;
    governedFiles: number;
  };
  domainSummaries: MutationRegistryDomainSummary[];
  riskBreakdown: Record<ActionMutationRisk, number>;
};

function buildDomainSummaries(): MutationRegistryDomainSummary[] {
  const map = new Map<string, MutationRegistryDomainSummary>();

  for (const helper of DOMAIN_MUTATION_HELPERS) {
    const row = map.get(helper.domain) ?? {
      domain: helper.domain,
      helperCount: 0,
      operationCount: 0,
      total: 0,
      criticalCount: 0,
    };
    row.helperCount += 1;
    row.total += 1;
    map.set(helper.domain, row);
  }

  for (const op of ACTION_MUTATION_OPERATIONS) {
    const row = map.get(op.domain) ?? {
      domain: op.domain,
      helperCount: 0,
      operationCount: 0,
      total: 0,
      criticalCount: 0,
    };
    row.operationCount += 1;
    row.total += 1;
    if (op.risk === "critical") row.criticalCount += 1;
    map.set(op.domain, row);
  }

  return [...map.values()].sort((a, b) => b.total - a.total || a.domain.localeCompare(b.domain));
}

function buildRiskBreakdown(): Record<ActionMutationRisk, number> {
  const breakdown: Record<ActionMutationRisk, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const op of ACTION_MUTATION_OPERATIONS) {
    breakdown[op.risk] += 1;
  }
  return breakdown;
}

export function loadMutationRegistryDashboardSnapshot(): MutationRegistryDashboardSnapshot {
  const scan = scanMutationRegistryCompliance();
  const governedFiles = scan.files.filter((f) => f.governed).length;

  return {
    policyId: MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
    counts: ENTERPRISE_MUTATION_REGISTRY_COUNTS,
    enterpriseTargetMet: isEnterpriseMutationRegistryComplete(),
    linter: {
      scannedFiles: scan.files.length,
      violations: scan.violations.length,
      governedFiles,
    },
    domainSummaries: buildDomainSummaries(),
    riskBreakdown: buildRiskBreakdown(),
  };
}
