/**
 * Governance bundles partition policy — Evolution Era 9 Cycle 2.
 *
 * Splits `test:ci:governance-bundles` into parallel CI partitions for faster
 * feedback. The `quality` job still runs the full sequential bundle as canonical gate.
 */

export const GOVERNANCE_BUNDLES_PARTITION_POLICY_ID =
  "era9-governance-bundles-partition-v1" as const;

export const GOVERNANCE_BUNDLES_FULL_SCRIPT = "test:ci:governance-bundles" as const;

export const GOVERNANCE_BUNDLES_PARTITION_CI_JOB_ID = "governance-bundles-partitions" as const;

export const GOVERNANCE_BUNDLES_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const GOVERNANCE_BUNDLES_QUALITY_STEP =
  "npm run test:ci:governance-bundles" as const;

export type GovernanceBundlesPartitionId =
  | "platform"
  | "money-path"
  | "security-rbac"
  | "product-kds";

export type GovernanceBundlesPartition = {
  id: GovernanceBundlesPartitionId;
  script: `test:ci:governance-bundles:partition-${GovernanceBundlesPartitionId}`;
  description: string;
};

export const GOVERNANCE_BUNDLES_PARTITIONS: readonly GovernanceBundlesPartition[] = [
  {
    id: "platform",
    script: "test:ci:governance-bundles:partition-platform",
    description: "Doc canon, public API, nav, integrations, enterprise/GTM, cron hygiene",
  },
  {
    id: "money-path",
    script: "test:ci:governance-bundles:partition-money-path",
    description: "Storefront/POS money path, inventory depletion, cross-channel rewards",
  },
  {
    id: "security-rbac",
    script: "test:ci:governance-bundles:partition-security-rbac",
    description: "Order creation, platform bypass closure, search/audit RBAC certs",
  },
  {
    id: "product-kds",
    script: "test:ci:governance-bundles:partition-product-kds",
    description: "Production calendar move UI, KDS certs, scorecard (last)",
  },
] as const;

/** Composition of partition scripts — must match `test:ci:governance-bundles` in package.json. */
export const GOVERNANCE_BUNDLES_FULL_COMPOSITION = GOVERNANCE_BUNDLES_PARTITIONS.map(
  (p) => `npm run ${p.script}`,
).join(" && ") as string;

export const GOVERNANCE_BUNDLES_PARTITION_CI_SCRIPTS = [
  "test:ci:governance-bundles:partition-platform",
  "test:ci:governance-bundles:partition-money-path",
  "test:ci:governance-bundles:partition-security-rbac",
  "test:ci:governance-bundles:partition-product-kds",
  "test:ci:governance-bundles-partition:cert",
] as const;

export const GOVERNANCE_BUNDLES_PARTITION_UNIT_TESTS = [
  "tests/unit/governance-bundles-partition-policy.test.ts",
  "tests/unit/governance-bundles-partition-ci-live.test.ts",
] as const;

export const GOVERNANCE_BUNDLES_PARTITION_CANONICAL_DOC_PATHS = [
  "docs/devops-release-enterprise-readiness.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
] as const;

export const GOVERNANCE_BUNDLES_PARTITION_CANONICAL_MARKERS = [
  GOVERNANCE_BUNDLES_PARTITION_POLICY_ID,
  GOVERNANCE_BUNDLES_PARTITION_CI_JOB_ID,
  "governance-bundles-partitions",
] as const;

export function governanceBundlesPartitionScript(
  id: GovernanceBundlesPartitionId,
): string {
  const partition = GOVERNANCE_BUNDLES_PARTITIONS.find((p) => p.id === id);
  if (!partition) throw new Error(`Unknown governance partition: ${id}`);
  return partition.script;
}
