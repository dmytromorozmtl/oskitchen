/**
 * Marketing claims registry governance — Evolution Era 8 Cycle 1.
 *
 * Tracks sales-facing claim rows in `config/marketing/claims-registry.json`.
 * Complements `era7-marketing-claims-governance-v1` (live marketing copy scan).
 */

export const CLAIMS_REGISTRY_POLICY_ID = "era8-claims-registry-v1" as const;

export const CLAIMS_REGISTRY_PATH = "config/marketing/claims-registry.json" as const;

export const CLAIMS_REGISTRY_ALLOWED_STATUSES = [
  "verified",
  "illustrative",
  "deprecated",
] as const;

export type ClaimsRegistryStatus = (typeof CLAIMS_REGISTRY_ALLOWED_STATUSES)[number];

/** Statuses that fail CI — must be resolved before release governance passes. */
export const CLAIMS_REGISTRY_FORBIDDEN_STATUSES = ["needs-evidence"] as const;

export const CLAIMS_REGISTRY_REQUIRED_FIELDS = [
  "claim",
  "page",
  "evidenceType",
  "evidenceSource",
  "dateVerified",
  "status",
] as const;

export const CLAIMS_REGISTRY_CI_SCRIPTS = [
  "audit:marketing-claims",
  "test:ci:claims-registry",
  "test:ci:claims-registry:cert",
] as const;

export const CLAIMS_REGISTRY_UNIT_TESTS = [
  "tests/unit/claims-registry-policy.test.ts",
  "tests/unit/claims-registry-ci-live.test.ts",
] as const;

export const CLAIMS_REGISTRY_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const CLAIMS_REGISTRY_CANONICAL_MARKERS = [
  CLAIMS_REGISTRY_POLICY_ID,
  "claims-registry.json",
  "audit:marketing-claims",
] as const;

export type ClaimsRegistryRow = {
  claim: string;
  page: string;
  evidenceType: string;
  evidenceSource: string;
  dateVerified: string;
  status: string;
};

export function validateClaimsRegistryRows(rows: ClaimsRegistryRow[]): string[] {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const prefix = `claims-registry[${index}]`;
    for (const field of CLAIMS_REGISTRY_REQUIRED_FIELDS) {
      const value = row[field as keyof ClaimsRegistryRow];
      if (typeof value !== "string" || !value.trim()) {
        errors.push(`${prefix}: missing ${field}`);
      }
    }
    if (
      !CLAIMS_REGISTRY_ALLOWED_STATUSES.includes(row.status as ClaimsRegistryStatus) &&
      !CLAIMS_REGISTRY_FORBIDDEN_STATUSES.includes(
        row.status as (typeof CLAIMS_REGISTRY_FORBIDDEN_STATUSES)[number],
      )
    ) {
      errors.push(`${prefix}: invalid status ${row.status}`);
    }
    if (CLAIMS_REGISTRY_FORBIDDEN_STATUSES.includes(row.status as "needs-evidence")) {
      errors.push(`${prefix}: status needs-evidence is forbidden — use illustrative or verified`);
    }
  });

  return errors;
}

export function countClaimsByStatus(
  rows: ClaimsRegistryRow[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}
