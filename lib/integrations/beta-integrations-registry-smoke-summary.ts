/**
 * BETA integrations registry smoke summary — Era 17 post-DEV-48 integrity gate.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BETA_INTEGRATION_SCAFFOLD_PATHS,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID,
} from "@/lib/integrations/beta-integrations-registry-smoke-era17-policy";
import {
  BETA_INTEGRATION_IDS,
  INTEGRATION_REGISTRY,
} from "@/lib/integrations/integration-registry";

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_SUMMARY_VERSION =
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID;

export type BetaIntegrationsRegistrySmokeOverall = "PASSED" | "FAILED";

export type BetaIntegrationsRegistrySmokeProofStatus =
  | "scaffold_complete"
  | "scaffold_incomplete";

export type BetaIntegrationScaffoldFailure = {
  integrationId: string;
  missingPaths: string[];
  pageMissingBetaBadge?: boolean;
};

export type BetaIntegrationsRegistrySmokeSummary = {
  version: typeof BETA_INTEGRATIONS_REGISTRY_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: BetaIntegrationsRegistrySmokeOverall;
  proofStatus: BetaIntegrationsRegistrySmokeProofStatus;
  expectedBetaCount: number;
  registryBetaCount: number;
  placeholderCount: number;
  scaffoldFailures: BetaIntegrationScaffoldFailure[];
  certPassed: boolean;
};

function pageHasBetaBadge(root: string, integrationId: string): boolean {
  const pagePath = join(root, `app/dashboard/integrations/${integrationId}/page.tsx`);
  if (!existsSync(pagePath)) return false;
  const source = readFileSync(pagePath, "utf8");
  return source.includes("BetaBadge") && source.includes("@/components/integrations/beta-badge");
}

export function auditBetaIntegrationsRegistryScaffold(root: string): {
  scaffoldFailures: BetaIntegrationScaffoldFailure[];
  registryBetaCount: number;
  placeholderCount: number;
} {
  const scaffoldFailures: BetaIntegrationScaffoldFailure[] = [];
  const registryBetaCount = INTEGRATION_REGISTRY.filter((e) => e.status === "BETA").length;
  const placeholderCount = INTEGRATION_REGISTRY.filter((e) => e.status === "PLACEHOLDER").length;

  for (const id of BETA_INTEGRATION_IDS) {
    const requiredPaths = BETA_INTEGRATION_SCAFFOLD_PATHS[id];
    if (!requiredPaths) {
      scaffoldFailures.push({ integrationId: id, missingPaths: ["<scaffold map entry>"] });
      continue;
    }

    const missingPaths = requiredPaths.filter((rel) => !existsSync(join(root, rel)));
    const pageMissingBetaBadge = !pageHasBetaBadge(root, id);

    if (missingPaths.length > 0 || pageMissingBetaBadge) {
      scaffoldFailures.push({
        integrationId: id,
        missingPaths,
        ...(pageMissingBetaBadge ? { pageMissingBetaBadge: true } : {}),
      });
    }
  }

  return { scaffoldFailures, registryBetaCount, placeholderCount };
}

export function resolveBetaIntegrationsRegistryProofStatus(input: {
  certPassed: boolean;
  scaffoldFailures: readonly BetaIntegrationScaffoldFailure[];
  registryBetaCount: number;
  placeholderCount: number;
}): BetaIntegrationsRegistrySmokeProofStatus {
  if (
    input.certPassed &&
    input.scaffoldFailures.length === 0 &&
    input.registryBetaCount === BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT &&
    input.placeholderCount === 0
  ) {
    return "scaffold_complete";
  }
  return "scaffold_incomplete";
}

export function resolveBetaIntegrationsRegistryOverall(
  proofStatus: BetaIntegrationsRegistrySmokeProofStatus,
): BetaIntegrationsRegistrySmokeOverall {
  return proofStatus === "scaffold_complete" ? "PASSED" : "FAILED";
}

export function buildBetaIntegrationsRegistrySmokeSummary(input: {
  certPassed: boolean;
  scaffoldFailures: readonly BetaIntegrationScaffoldFailure[];
  registryBetaCount: number;
  placeholderCount: number;
  commitSha?: string | null;
  runAt?: Date;
}): BetaIntegrationsRegistrySmokeSummary {
  const proofStatus = resolveBetaIntegrationsRegistryProofStatus(input);

  return {
    version: BETA_INTEGRATIONS_REGISTRY_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveBetaIntegrationsRegistryOverall(proofStatus),
    proofStatus,
    expectedBetaCount: BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
    registryBetaCount: input.registryBetaCount,
    placeholderCount: input.placeholderCount,
    scaffoldFailures: [...input.scaffoldFailures],
    certPassed: input.certPassed,
  };
}

export function formatBetaIntegrationsRegistrySmokeReportLines(
  summary: BetaIntegrationsRegistrySmokeSummary,
): string[] {
  const lines = [
    `overall: ${summary.overall}`,
    `proofStatus: ${summary.proofStatus}`,
    `registryBetaCount: ${summary.registryBetaCount}/${summary.expectedBetaCount}`,
    `placeholderCount: ${summary.placeholderCount}`,
    `certPassed: ${summary.certPassed}`,
    `scaffoldFailures: ${summary.scaffoldFailures.length}`,
  ];
  for (const failure of summary.scaffoldFailures) {
    lines.push(
      `  - ${failure.integrationId}: missing=[${failure.missingPaths.join(", ")}]${
        failure.pageMissingBetaBadge ? " pageMissingBetaBadge" : ""
      }`,
    );
  }
  return lines;
}
