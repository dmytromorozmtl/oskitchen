/**
 * LIVE integration definition-of-done gate tracker (G1–G4).
 * @see docs/live-integration-definition-of-done.md
 */

import { auditBetaIntegrationsRegistryScaffold } from "@/lib/integrations/beta-integrations-registry-smoke-summary";
import {
  evaluateBetaIntegrationEnvReadiness,
  type BetaIntegrationEnvReadinessStatus,
} from "@/lib/integrations/beta-integration-env-readiness";
import {
  BETA_INTEGRATION_IDS,
  getIntegrationById,
  type IntegrationRegistryEntry,
} from "@/lib/integrations/integration-registry";

export const LIVE_INTEGRATION_DOD_POLICY_ID = "live-integration-dod-v1" as const;

export type LiveIntegrationDodGateId = "G1" | "G2" | "G3" | "G4";

export type LiveIntegrationDodGateStatus =
  | "passed"
  | "failed"
  | "not_measured"
  | "not_applicable";

export type LiveIntegrationDodGate = {
  id: LiveIntegrationDodGateId;
  label: string;
  status: LiveIntegrationDodGateStatus;
  detail: string;
};

export type LiveIntegrationDodRow = {
  integrationId: string;
  name: string;
  setupRoute: string;
  registryStatus: IntegrationRegistryEntry["status"];
  gates: readonly LiveIntegrationDodGate[];
  promotionEligible: boolean;
  blockedReason: string | null;
};

export type LiveIntegrationDodSummary = {
  total: number;
  scaffoldReadyCount: number;
  envReadyCount: number;
  promotionEligibleCount: number;
  liveCount: number;
};

function gateStatusFromEnvReadiness(
  status: BetaIntegrationEnvReadinessStatus,
): LiveIntegrationDodGateStatus {
  if (status === "ready" || status === "optional") return "passed";
  return "failed";
}

export function evaluateLiveIntegrationDodRow(
  entry: IntegrationRegistryEntry,
  input: {
    scaffoldOk: boolean;
    env: NodeJS.ProcessEnv;
  },
): LiveIntegrationDodRow {
  const envCard = evaluateBetaIntegrationEnvReadiness(entry, input.env);
  const g1Status: LiveIntegrationDodGateStatus = input.scaffoldOk ? "passed" : "failed";
  const g2Status = gateStatusFromEnvReadiness(envCard.status);

  const gates: LiveIntegrationDodGate[] = [
    {
      id: "G1",
      label: "Smoke / scaffold",
      status: g1Status,
      detail:
        g1Status === "passed"
          ? "Registry scaffold complete — dedicated live smoke still required for LIVE claim."
          : "Missing dashboard page, service, or API route.",
    },
    {
      id: "G2",
      label: "Platform env",
      status: g2Status,
      detail:
        envCard.status === "missing"
          ? `Missing: ${envCard.missingEnv.join(", ") || "required env vars"}`
          : envCard.status === "optional"
            ? "No server env required — workspace credentials still needed."
            : "All required platform env vars present.",
    },
    {
      id: "G3",
      label: "24h uptime",
      status: "not_measured",
      detail: "Requires production tenant with real credentials — not measured in CI.",
    },
    {
      id: "G4",
      label: "Error rate <1%",
      status: "not_measured",
      detail: "Requires 24h production window — not measured in CI.",
    },
  ];

  const g1g2Ready = g1Status === "passed" && g2Status === "passed";
  const promotionEligible = entry.status === "LIVE" || (g1g2Ready && entry.status === "BETA");

  let blockedReason: string | null = null;
  if (entry.status === "LIVE") {
    blockedReason = null;
  } else if (entry.status === "PLACEHOLDER") {
    blockedReason = "PLACEHOLDER — not eligible for LIVE promotion.";
  } else if (g1Status === "failed") {
    blockedReason = "G1 scaffold incomplete.";
  } else if (g2Status === "failed") {
    blockedReason = "G2 platform env missing.";
  } else if (g1g2Ready) {
    blockedReason = "G1+G2 passed — G3/G4 production proof required before LIVE.";
  } else {
    blockedReason = "Gates incomplete.";
  }

  return {
    integrationId: entry.id,
    name: entry.name,
    setupRoute: entry.setupRoute,
    registryStatus: entry.status,
    gates,
    promotionEligible,
    blockedReason: entry.status === "LIVE" ? null : blockedReason,
  };
}

export function listLiveIntegrationDodRows(
  env: NodeJS.ProcessEnv = process.env,
  root = process.cwd(),
): LiveIntegrationDodRow[] {
  const audit = auditBetaIntegrationsRegistryScaffold(root);
  const scaffoldOkById = new Set(
    BETA_INTEGRATION_IDS.filter(
      (id) => !audit.scaffoldFailures.some((failure) => failure.integrationId === id),
    ),
  );

  return BETA_INTEGRATION_IDS.map((id) => {
    const entry = getIntegrationById(id);
    if (!entry) {
      return evaluateLiveIntegrationDodRow(
        {
          id,
          name: id,
          status: "PLACEHOLDER",
          requiredEnv: [],
          setupRoute: `/dashboard/integrations/${id}`,
        },
        { scaffoldOk: false, env },
      );
    }
    return evaluateLiveIntegrationDodRow(entry, {
      scaffoldOk: scaffoldOkById.has(id),
      env,
    });
  });
}

export function summarizeLiveIntegrationDod(
  rows: readonly LiveIntegrationDodRow[],
): LiveIntegrationDodSummary {
  let scaffoldReadyCount = 0;
  let envReadyCount = 0;
  let promotionEligibleCount = 0;
  let liveCount = 0;

  for (const row of rows) {
    if (row.gates.find((g) => g.id === "G1")?.status === "passed") scaffoldReadyCount += 1;
    if (row.gates.find((g) => g.id === "G2")?.status === "passed") envReadyCount += 1;
    if (row.promotionEligible) promotionEligibleCount += 1;
    if (row.registryStatus === "LIVE") liveCount += 1;
  }

  return {
    total: rows.length,
    scaffoldReadyCount,
    envReadyCount,
    promotionEligibleCount,
    liveCount,
  };
}
