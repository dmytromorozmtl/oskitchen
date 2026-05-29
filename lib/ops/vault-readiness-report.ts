/**
 * Vault readiness report — honest ops vault status for P0 staging proof unblock.
 * Policy: era29-vault-readiness-v1 (extends era21-p0-ops-vault-v1)
 */

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG,
  P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  resolveP0VaultDay0Milestone,
  type P0VaultDay0Milestone,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import {
  buildP0OpsVaultPhaseStatuses,
  resolveNextIncompleteP0OpsVaultPhase,
  type P0OpsVaultPhaseStatus,
} from "@/lib/commercial/p0-ops-vault-phases-era21";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export const VAULT_READINESS_REPORT_ARTIFACT = "artifacts/vault-readiness-report.json" as const;

export type VaultReadinessSecretRow = {
  key: string;
  description: string;
  childSmokes: readonly string[];
  configureIn: string;
  docPath: string;
  owner: string;
  verifyCommand: string;
  present: boolean;
};

export type VaultReadinessChildSmokeSnapshot = {
  id: string;
  smokeScript: string;
  artifactPath: string;
  overall: string | null;
  proofStatus: string | null;
  missingEnvVars: string[];
};

export type VaultReadinessReport = {
  version: "vault-readiness-v2";
  generatedAt: string;
  policyId: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID;
  opsChecklistDoc: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC;
  vaultMatrixDoc: "docs/ops-vault-matrix.md";
  vaultReady: boolean;
  presentCount: number;
  totalCount: number;
  missingKeys: string[];
  day0Milestone: P0VaultDay0Milestone;
  day0PartialComplete: boolean;
  p0ProofStatus: string | null;
  p0ArtifactOverall: string | null;
  nextPhase: P0OpsVaultPhaseStatus | null;
  phases: readonly P0OpsVaultPhaseStatus[];
  childSmokes: VaultReadinessChildSmokeSnapshot[];
  recommendedNextSteps: string[];
  secrets: VaultReadinessSecretRow[];
  honestyNote: string;
};

const SECRET_OWNERS: Record<string, string> = {
  E2E_STAGING_BASE_URL: "DevOps",
  E2E_LOGIN_EMAIL: "DevOps",
  E2E_LOGIN_PASSWORD: "DevOps",
  SSO_STAGING_WORKSPACE_ID: "Security / CTO",
  SSO_STAGING_IDP_VENDOR: "Security / CTO",
  SSO_STAGING_ALLOWED_DOMAIN: "Security / CTO",
  SSO_STAGING_TEST_EMAIL: "Security / CTO",
  SSO_STAGING_SUPABASE_PROVIDER_REF: "Security / CTO",
  DATABASE_URL: "DevOps",
  ENCRYPTION_KEY: "DevOps",
  CHANNEL_SMOKE_OWNER_EMAIL: "Integration engineer",
};

function secretDescription(key: string): string {
  switch (key) {
    case "E2E_STAGING_BASE_URL":
      return "Staging KitchenOS base URL for SSO and E2E workflows";
    case "E2E_LOGIN_EMAIL":
      return "Dashboard login email for staging Playwright workflows";
    case "E2E_LOGIN_PASSWORD":
      return "Dashboard login password for staging Playwright workflows";
    case "SSO_STAGING_WORKSPACE_ID":
      return "Pilot workspace UUID for tenant-bound SSO smoke";
    case "SSO_STAGING_IDP_VENDOR":
      return "IdP vendor label (OKTA or ENTRA_ID)";
    case "SSO_STAGING_ALLOWED_DOMAIN":
      return "Allowed email domain for SSO test user";
    case "SSO_STAGING_TEST_EMAIL":
      return "Staff test user in allowed SSO domain";
    case "SSO_STAGING_SUPABASE_PROVIDER_REF":
      return "Supabase Auth SAML provider reference";
    case "DATABASE_URL":
      return "Staging Postgres connection for channel live smoke";
    case "ENCRYPTION_KEY":
      return "App encryption key for integration credential rows";
    case "CHANNEL_SMOKE_OWNER_EMAIL":
      return "Workspace owner email for Woo/Shopify tenant selector";
    default:
      return "P0 staging proof prerequisite";
  }
}

type LooseChildArtifact = {
  overall?: string;
  loginProofStatus?: string;
  firstGreenProofStatus?: string;
  wooLiveProofStatus?: string;
  shopifyLiveProofStatus?: string;
  missingEnvVars?: string[];
};

function readChildProofStatus(artifact: LooseChildArtifact | null): string | null {
  if (!artifact) return null;
  return (
    artifact.loginProofStatus ??
    artifact.firstGreenProofStatus ??
    (artifact.wooLiveProofStatus && artifact.shopifyLiveProofStatus
      ? `${artifact.wooLiveProofStatus}/${artifact.shopifyLiveProofStatus}`
      : artifact.wooLiveProofStatus ?? artifact.shopifyLiveProofStatus ?? null)
  );
}

export function buildVaultReadinessChildSnapshots(input: {
  p0Artifact?: P0StagingProofUnblockSummary | null;
  ssoArtifact?: LooseChildArtifact | null;
  workflowsArtifact?: LooseChildArtifact | null;
  channelArtifact?: LooseChildArtifact | null;
}): VaultReadinessChildSmokeSnapshot[] {
  const fromP0 = input.p0Artifact?.children;
  const sso = input.ssoArtifact ?? null;
  const workflows = input.workflowsArtifact ?? null;
  const channel = input.channelArtifact ?? null;

  return [
    {
      id: "ssoIdpStaging",
      smokeScript: fromP0?.ssoIdpStaging.smokeScript ?? "smoke:enterprise-sso-idp-staging",
      artifactPath:
        fromP0?.ssoIdpStaging.artifactPath ??
        "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: sso?.overall ?? fromP0?.ssoIdpStaging.overall ?? null,
      proofStatus: readChildProofStatus(sso) ?? fromP0?.ssoIdpStaging.proofStatus ?? null,
      missingEnvVars: sso?.missingEnvVars ?? fromP0?.ssoIdpStaging.missingEnvVars ?? [],
    },
    {
      id: "stagingWorkflowsFirstGreen",
      smokeScript:
        fromP0?.stagingWorkflowsFirstGreen.smokeScript ?? "smoke:staging-workflows-first-green",
      artifactPath:
        fromP0?.stagingWorkflowsFirstGreen.artifactPath ??
        "artifacts/staging-workflows-first-green-summary.json",
      overall: workflows?.overall ?? fromP0?.stagingWorkflowsFirstGreen.overall ?? null,
      proofStatus:
        readChildProofStatus(workflows) ?? fromP0?.stagingWorkflowsFirstGreen.proofStatus ?? null,
      missingEnvVars:
        workflows?.missingEnvVars ?? fromP0?.stagingWorkflowsFirstGreen.missingEnvVars ?? [],
    },
    {
      id: "channelLive",
      smokeScript: fromP0?.channelLive.smokeScript ?? "smoke:woo-shopify-live",
      artifactPath:
        fromP0?.channelLive.artifactPath ?? "artifacts/channel-live-smoke-summary.json",
      overall: channel?.overall ?? fromP0?.channelLive.overall ?? null,
      proofStatus: readChildProofStatus(channel) ?? fromP0?.channelLive.proofStatus ?? null,
      missingEnvVars: channel?.missingEnvVars ?? fromP0?.channelLive.missingEnvVars ?? [],
    },
  ];
}

export function buildVaultReadinessReport(input: {
  env?: NodeJS.ProcessEnv;
  p0Artifact?: P0StagingProofUnblockSummary | null;
  ssoArtifact?: LooseChildArtifact | null;
  workflowsArtifact?: LooseChildArtifact | null;
  channelArtifact?: LooseChildArtifact | null;
  generatedAt?: Date;
}): VaultReadinessReport {
  const env = input.env ?? process.env;
  const vault = evaluateP0VaultEnv(env);
  const presentSet = new Set(vault.present);
  const missingKeys = vault.missing;
  const phases = buildP0OpsVaultPhaseStatuses({ missingEnvVars: missingKeys });
  const nextPhase = resolveNextIncompleteP0OpsVaultPhase(phases);
  const day0Milestone = resolveP0VaultDay0Milestone({
    env: vault,
    p0ProofStatus: input.p0Artifact?.p0ProofStatus,
  });

  const secrets: VaultReadinessSecretRow[] = P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map(
    (entry) => ({
      key: entry.key,
      description: secretDescription(entry.key),
      childSmokes: entry.childSmokes,
      configureIn: entry.configureIn,
      docPath: entry.docPath,
      owner: SECRET_OWNERS[entry.key] ?? "VP Operations",
      verifyCommand: `test -n "$${entry.key}"`,
      present: presentSet.has(entry.key),
    }),
  );

  const childSmokes = buildVaultReadinessChildSnapshots(input);

  const recommendedNextSteps: string[] = [];
  if (!vault.allPresent) {
    if (nextPhase) {
      recommendedNextSteps.push(
        `Complete ${nextPhase.label}: missing ${nextPhase.missingKeys.join(", ")}`,
      );
      recommendedNextSteps.push(`Read ${nextPhase.docPath}`);
    }
    recommendedNextSteps.push(
      `Configure missing secrets (${missingKeys.length}/11): ${missingKeys.join(", ")}`,
    );
    recommendedNextSteps.push(`Read ${P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC}`);
    recommendedNextSteps.push("npm run ops:validate-p0-vault-env");
    recommendedNextSteps.push("npm run ops:run-p0-vault-day0-orchestrator -- --write");
  } else {
    recommendedNextSteps.push("npm run smoke:enterprise-sso-idp-staging");
    recommendedNextSteps.push("npm run smoke:staging-workflows-first-green");
    recommendedNextSteps.push("npm run smoke:woo-shopify-live");
    recommendedNextSteps.push("npm run smoke:p0-staging-proof-unblock");
    recommendedNextSteps.push("npm run ops:validate-p0-staging-proof-integrity");
  }
  recommendedNextSteps.push("npm run smoke:pilot-gono-go");

  return {
    version: "vault-readiness-v2",
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    policyId: P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
    opsChecklistDoc: P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
    vaultMatrixDoc: "docs/ops-vault-matrix.md",
    vaultReady: vault.allPresent,
    presentCount: vault.present.length,
    totalCount: vault.present.length + vault.missing.length,
    missingKeys,
    day0Milestone,
    day0PartialComplete: vault.day0PartialComplete,
    p0ProofStatus: input.p0Artifact?.p0ProofStatus ?? null,
    p0ArtifactOverall: input.p0Artifact?.overall ?? null,
    nextPhase,
    phases,
    childSmokes,
    recommendedNextSteps,
    secrets,
    honestyNote:
      "PASS > SKIPPED — this report never fabricates proof_passed. Configure ops vault secrets, then re-run child smokes.",
  };
}

export function formatVaultReadinessReportLines(report: VaultReadinessReport): string[] {
  const lines = [
    `Vault readiness: ${report.vaultReady ? "READY" : "NOT READY"} (${report.presentCount}/${report.totalCount})`,
    `Day 0 milestone: ${report.day0Milestone}`,
    `P0 artifact: ${report.p0ProofStatus ?? "missing"} (${report.p0ArtifactOverall ?? "n/a"})`,
  ];
  if (report.nextPhase) {
    lines.push(`Next phase: ${report.nextPhase.label} — missing ${report.nextPhase.missingKeys.join(", ")}`);
  }
  for (const child of report.childSmokes) {
    lines.push(
      `Child ${child.id}: ${child.overall ?? "missing"} / ${child.proofStatus ?? "n/a"}`,
    );
  }
  return lines;
}
