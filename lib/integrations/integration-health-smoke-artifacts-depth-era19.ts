import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import type {
  IntegrationHealthSmokeArtifactRow,
  IntegrationHealthSmokeDisplayStatus,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import { INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19-policy";
import { INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC } from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_AGGREGATOR_ERA19_POLICY_ID =
  "era19-integration-health-smoke-artifacts-depth-aggregator-v1" as const;

export type IntegrationHealthSmokeChildProofRow = {
  id: string;
  label: string;
  displayStatus: IntegrationHealthSmokeDisplayStatus;
  proofStatus: string | null;
  missingEnvVars: string[];
  smokeScript: string;
};

export type IntegrationHealthSmokeGitHubRunLink = {
  workflowId: string;
  label: string;
  runUrl: string | null;
  outcome: string | null;
};

export type IntegrationHealthSmokeNextAction = {
  rowId: string;
  label: string;
  smokeScript: string;
  reason: string;
  displayStatus: IntegrationHealthSmokeDisplayStatus;
  missingEnvVars: string[];
  opsChecklistDoc: typeof INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC;
};

export type IntegrationHealthSmokeArtifactsDepthSlice = {
  policyId: typeof INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID;
  nextSmokeAction: IntegrationHealthSmokeNextAction | null;
  allMissingEnvVars: string[];
};

const ROW_PRIORITY: Record<string, number> = {
  "p0-staging-proof-unblock": 1,
  "staging-workflows-first-green": 2,
  "channel-live-smoke": 3,
};

function normalizeSmokeArtifactOverall(
  overall: string | null | undefined,
): IntegrationHealthSmokeDisplayStatus {
  if (!overall) return "MISSING";
  if (overall === "PASSED") return "PASSED";
  if (overall === "FAILED") return "FAILED";
  if (overall === "SKIPPED") return "SKIPPED WITH REASON";
  return "MISSING";
}

function rowPriority(rowId: string): number {
  return ROW_PRIORITY[rowId] ?? 99;
}

function childProofRow(input: {
  id: string;
  label: string;
  overall: string | null;
  proofStatus: string | null;
  missingEnvVars: string[];
  smokeScript: string;
}): IntegrationHealthSmokeChildProofRow {
  return {
    id: input.id,
    label: input.label,
    displayStatus: normalizeSmokeArtifactOverall(input.overall),
    proofStatus: input.proofStatus,
    missingEnvVars: input.missingEnvVars,
    smokeScript: input.smokeScript,
  };
}

export function buildP0StagingChildProofRows(
  artifact: P0StagingProofUnblockSummary,
): IntegrationHealthSmokeChildProofRow[] {
  return [
    childProofRow({
      id: "p0-child-sso",
      label: "SSO IdP staging",
      overall: artifact.children.ssoIdpStaging.overall,
      proofStatus: artifact.children.ssoIdpStaging.proofStatus,
      missingEnvVars: artifact.children.ssoIdpStaging.missingEnvVars,
      smokeScript: artifact.children.ssoIdpStaging.smokeScript,
    }),
    childProofRow({
      id: "p0-child-staging-workflows",
      label: "GitHub staging workflows",
      overall: artifact.children.stagingWorkflowsFirstGreen.overall,
      proofStatus: artifact.children.stagingWorkflowsFirstGreen.proofStatus,
      missingEnvVars: artifact.children.stagingWorkflowsFirstGreen.missingEnvVars,
      smokeScript: artifact.children.stagingWorkflowsFirstGreen.smokeScript,
    }),
    childProofRow({
      id: "p0-child-channel-live",
      label: "Woo / Shopify live smoke",
      overall: artifact.children.channelLive.overall,
      proofStatus: artifact.children.channelLive.proofStatus,
      missingEnvVars: artifact.children.channelLive.missingEnvVars,
      smokeScript: artifact.children.channelLive.smokeScript,
    }),
  ];
}

export function buildStagingWorkflowGitHubRunLinks(
  artifact: StagingWorkflowFirstGreenSummary,
): IntegrationHealthSmokeGitHubRunLink[] {
  return artifact.githubRuns.map((run) => ({
    workflowId: run.workflowId,
    label: run.label,
    runUrl: run.runUrl,
    outcome: run.outcome,
  }));
}

export function collectIntegrationHealthSmokeMissingEnvVars(
  rows: readonly IntegrationHealthSmokeArtifactRow[],
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const row of rows) {
    for (const key of row.missingEnvVars) {
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(key);
    }
    for (const child of row.childProofs ?? []) {
      for (const key of child.missingEnvVars) {
        if (seen.has(key)) continue;
        seen.add(key);
        ordered.push(key);
      }
    }
  }

  return ordered;
}

function actionScore(row: IntegrationHealthSmokeArtifactRow): number {
  if (row.displayStatus === "FAILED") return 0;
  if (row.displayStatus === "SKIPPED WITH REASON") return 1;
  if (row.displayStatus === "MISSING") return 2;
  return 99;
}

export function pickIntegrationHealthNextSmokeAction(
  rows: readonly IntegrationHealthSmokeArtifactRow[],
): IntegrationHealthSmokeNextAction | null {
  const candidates = rows
    .filter((row) => row.displayStatus !== "PASSED")
    .sort((a, b) => {
      const scoreDiff = actionScore(a) - actionScore(b);
      if (scoreDiff !== 0) return scoreDiff;
      return rowPriority(a.id) - rowPriority(b.id);
    });

  const top = candidates[0];
  if (!top) return null;

  let reason: string;
  if (top.displayStatus === "FAILED") {
    reason = `${top.label} FAILED — fix the artifact failure before commercial proof claims.`;
  } else if (top.missingEnvVars.length > 0) {
    reason = `SKIPPED WITH REASON — ${top.missingEnvVars.length} env var(s) missing. See ${INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC}.`;
  } else if (top.displayStatus === "MISSING") {
    reason = "Artifact missing on this host — run the smoke script in CI or locally.";
  } else {
    reason = top.detail;
  }

  return {
    rowId: top.id,
    label: top.label,
    smokeScript: top.smokeScript,
    reason,
    displayStatus: top.displayStatus,
    missingEnvVars: top.missingEnvVars,
    opsChecklistDoc: INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC,
  };
}

export function enrichIntegrationHealthSmokeArtifactRows(input: {
  rows: readonly IntegrationHealthSmokeArtifactRow[];
  p0Staging: P0StagingProofUnblockSummary | null;
  stagingWorkflows: StagingWorkflowFirstGreenSummary | null;
}): IntegrationHealthSmokeArtifactRow[] {
  return input.rows.map((row) => {
    if (row.id === "p0-staging-proof-unblock" && input.p0Staging) {
      return {
        ...row,
        childProofs: buildP0StagingChildProofRows(input.p0Staging),
      };
    }
    if (row.id === "staging-workflows-first-green" && input.stagingWorkflows) {
      return {
        ...row,
        githubRuns: buildStagingWorkflowGitHubRunLinks(input.stagingWorkflows),
      };
    }
    return row;
  });
}

export function buildIntegrationHealthSmokeArtifactsDepthSlice(input: {
  rows: readonly IntegrationHealthSmokeArtifactRow[];
}): IntegrationHealthSmokeArtifactsDepthSlice {
  return {
    policyId: INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID,
    nextSmokeAction: pickIntegrationHealthNextSmokeAction(input.rows),
    allMissingEnvVars: collectIntegrationHealthSmokeMissingEnvVars(input.rows),
  };
}
