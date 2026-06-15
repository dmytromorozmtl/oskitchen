/**
 * BETA integration env readiness footnote for Today Integration Health strip.
 */

import {
  listBetaIntegrationEnvReadinessCards,
  summarizeBetaIntegrationEnvReadiness,
} from "@/lib/integrations/beta-integration-env-readiness";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

export type PilotIntegrationHealthBetaEnvFootnote = {
  readyCount: number;
  optionalCount: number;
  missingCount: number;
  total: number;
  headline: string;
  detail: string;
  href: string;
};

export function buildPilotIntegrationHealthBetaEnvFootnote(
  env: NodeJS.ProcessEnv = process.env,
): PilotIntegrationHealthBetaEnvFootnote {
  const cards = listBetaIntegrationEnvReadinessCards(env);
  const summary = summarizeBetaIntegrationEnvReadiness(cards);

  const headline =
    summary.overall === "ready"
      ? `${summary.readyCount + summary.optionalCount} BETA integrations platform-ready`
      : summary.missingCount === summary.total
        ? "BETA platform env not configured"
        : `${summary.missingCount} BETA integrations missing platform env`;

  const detail =
    summary.overall === "ready"
      ? "All eighteen BETA registry integrations have required server env vars — tenant credentials still required for live proof."
      : `${summary.readyCount} env-ready · ${summary.optionalCount} no server env · ${summary.missingCount} missing vars — configure vault before G2 claims.`;

  return {
    readyCount: summary.readyCount,
    optionalCount: summary.optionalCount,
    missingCount: summary.missingCount,
    total: summary.total,
    headline,
    detail,
    href: "/dashboard/integrations/health",
  };
}

export function augmentPilotIntegrationHealthStripWithBetaEnv(
  model: PilotIntegrationHealthStripModel,
  env: NodeJS.ProcessEnv = process.env,
): PilotIntegrationHealthStripModel & { betaEnvFootnote: PilotIntegrationHealthBetaEnvFootnote } {
  return {
    ...model,
    betaEnvFootnote: buildPilotIntegrationHealthBetaEnvFootnote(env),
  };
}
