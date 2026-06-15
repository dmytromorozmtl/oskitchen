/**
 * Platform-level env readiness for BETA integrations (G2 gate helper).
 * Checks INTEGRATION_REGISTRY requiredEnv — does not expose secret values.
 */

import {
  BETA_INTEGRATION_IDS,
  INTEGRATION_REGISTRY,
  type IntegrationRegistryEntry,
} from "@/lib/integrations/integration-registry";

export type BetaIntegrationEnvReadinessStatus =
  | "ready"
  | "optional"
  | "missing";

export type BetaIntegrationEnvReadinessCard = {
  id: string;
  name: string;
  setupRoute: string;
  status: BetaIntegrationEnvReadinessStatus;
  requiredEnv: readonly string[];
  missingEnv: readonly string[];
  configuredCount: number;
  requiredCount: number;
};

export type BetaIntegrationEnvReadinessSummary = {
  total: number;
  readyCount: number;
  optionalCount: number;
  missingCount: number;
  overall: "ready" | "degraded" | "blocked";
};

function isEnvVarSet(env: NodeJS.ProcessEnv, key: string): boolean {
  const value = env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function evaluateBetaIntegrationEnvReadiness(
  entry: IntegrationRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): BetaIntegrationEnvReadinessCard {
  const requiredEnv = entry.requiredEnv;
  const missingEnv = requiredEnv.filter((key) => !isEnvVarSet(env, key));
  const requiredCount = requiredEnv.length;
  const configuredCount = requiredCount - missingEnv.length;

  let status: BetaIntegrationEnvReadinessStatus;
  if (requiredCount === 0) {
    status = "optional";
  } else if (missingEnv.length === 0) {
    status = "ready";
  } else {
    status = "missing";
  }

  return {
    id: entry.id,
    name: entry.name,
    setupRoute: entry.setupRoute,
    status,
    requiredEnv,
    missingEnv,
    configuredCount,
    requiredCount,
  };
}

export function listBetaIntegrationEnvReadinessCards(
  env: NodeJS.ProcessEnv = process.env,
): BetaIntegrationEnvReadinessCard[] {
  const byId = new Map(INTEGRATION_REGISTRY.map((entry) => [entry.id, entry]));
  return BETA_INTEGRATION_IDS.map((id) => {
    const entry = byId.get(id);
    if (!entry) {
      return {
        id,
        name: id,
        setupRoute: `/dashboard/integrations/${id}`,
        status: "missing" as const,
        requiredEnv: [],
        missingEnv: ["<registry entry>"],
        configuredCount: 0,
        requiredCount: 0,
      };
    }
    return evaluateBetaIntegrationEnvReadiness(entry, env);
  });
}

export function summarizeBetaIntegrationEnvReadiness(
  cards: readonly BetaIntegrationEnvReadinessCard[],
): BetaIntegrationEnvReadinessSummary {
  let readyCount = 0;
  let optionalCount = 0;
  let missingCount = 0;

  for (const card of cards) {
    if (card.status === "ready") readyCount += 1;
    else if (card.status === "optional") optionalCount += 1;
    else missingCount += 1;
  }

  const overall =
    missingCount === cards.length
      ? "blocked"
      : missingCount > 0
        ? "degraded"
        : "ready";

  return {
    total: cards.length,
    readyCount,
    optionalCount,
    missingCount,
    overall,
  };
}
