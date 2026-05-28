import type { IntegrationHealthChannelCard } from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthChannelCardsModel } from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthSmokeArtifactsModel } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_OPS_CHECKLIST_DOC,
  INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS,
} from "@/lib/integrations/integration-health-recovery-era19-policy";

export const INTEGRATION_HEALTH_RECOVERY_AGGREGATOR_ERA19_POLICY_ID =
  "era19-integration-health-recovery-aggregator-v1" as const;

export type IntegrationHealthRecoverySeverity = "urgent" | "normal" | "info";

export type IntegrationHealthRecoveryStep = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: IntegrationHealthRecoverySeverity;
  category: string;
  source: string;
};

export type IntegrationHealthRecoveryQuickLink =
  (typeof INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS)[number];

export type IntegrationHealthRecoveryModel = {
  policyId: typeof INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID;
  loadedAt: string;
  headline: string;
  hasUrgentSteps: boolean;
  steps: IntegrationHealthRecoveryStep[];
  quickLinks: readonly IntegrationHealthRecoveryQuickLink[];
  opsChecklistDoc: typeof INTEGRATION_HEALTH_RECOVERY_OPS_CHECKLIST_DOC;
};

const MAX_RECOVERY_STEPS = 8;

function severityRank(severity: IntegrationHealthRecoverySeverity): number {
  switch (severity) {
    case "urgent":
      return 0;
    case "normal":
      return 1;
    default:
      return 2;
  }
}

function pushUniqueStep(
  steps: IntegrationHealthRecoveryStep[],
  seen: Set<string>,
  step: IntegrationHealthRecoveryStep,
): void {
  const key = `${step.id}:${step.href}`;
  if (seen.has(key)) return;
  seen.add(key);
  steps.push(step);
}

function stepFromChannelCard(card: IntegrationHealthChannelCard): IntegrationHealthRecoveryStep | null {
  if (card.stateTone === "down") {
    return {
      id: `channel-down-${card.id}`,
      title: `Fix ${card.label} — ${card.currentState}`,
      detail:
        card.lastError ??
        card.supportGuidance ??
        "Connection or delivery is blocked — resolve before pilot scale.",
      href: card.nextAction?.href ?? "/dashboard/sales-channels/health",
      severity: "urgent",
      category: "channel_connection",
      source: card.id,
    };
  }

  if (card.smokeStatus === "FAILED") {
    return {
      id: `smoke-failed-${card.id}`,
      title: `${card.label} engineering smoke failed`,
      detail:
        card.smokeDetail ??
        "Review credentials, mapping, and connection tests before re-running smoke.",
      href:
        card.id === "woocommerce" || card.id === "shopify"
          ? "/dashboard/product-mapping"
          : card.nextAction?.href ?? "/dashboard/sales-channels/health",
      severity: "urgent",
      category: "smoke_proof",
      source: card.id,
    };
  }

  if (card.stateTone === "degraded" && card.nextAction) {
    return {
      id: `channel-degraded-${card.id}`,
      title: `Complete ${card.label} setup`,
      detail: card.currentState,
      href: card.nextAction.href,
      severity: card.nextAction.tone === "urgent" ? "urgent" : "normal",
      category: "channel_setup",
      source: card.id,
    };
  }

  if (card.smokeStatus === "SKIPPED WITH REASON" && card.missingEnvVars.length > 0) {
    return {
      id: `smoke-skipped-${card.id}`,
      title: `${card.label} smoke awaiting prerequisites`,
      detail: `Missing env: ${card.missingEnvVars.join(", ")} — SKIPPED WITH REASON is honest, not PASS.`,
      href: card.nextAction?.href ?? "/dashboard/launch-wizard",
      severity: "normal",
      category: "smoke_prerequisites",
      source: card.id,
    };
  }

  return null;
}

function stepsFromSmokeArtifacts(
  model: IntegrationHealthSmokeArtifactsModel,
): IntegrationHealthRecoveryStep[] {
  const steps: IntegrationHealthRecoveryStep[] = [];

  for (const row of model.rows) {
    if (row.displayStatus === "FAILED") {
      steps.push({
        id: `artifact-failed-${row.id}`,
        title: `${row.label} — FAILED`,
        detail: row.detail,
        href: row.nextAction?.href ?? "/dashboard/launch-wizard",
        severity: "urgent",
        category: "smoke_proof",
        source: row.id,
      });
      continue;
    }

    if (
      row.id === "p0-staging-proof-unblock" &&
      (row.displayStatus === "SKIPPED WITH REASON" || row.proofStatus === "awaiting_ops_credentials")
    ) {
      steps.push({
        id: "p0-ops-credentials",
        title: "Supply P0 staging ops credentials",
        detail:
          row.missingEnvVars.length > 0
            ? `Awaiting ${row.missingEnvVars.length} env var(s): ${row.missingEnvVars.slice(0, 4).join(", ")}${row.missingEnvVars.length > 4 ? "…" : ""}.`
            : row.detail,
        href: "/dashboard/launch-wizard",
        severity: "normal",
        category: "p0_credentials",
        source: row.id,
      });
      continue;
    }

    if (row.id === "channel-live-smoke" && row.displayStatus === "SKIPPED WITH REASON") {
      steps.push({
        id: "channel-live-prerequisites",
        title: "Configure channel live smoke prerequisites",
        detail: row.detail,
        href: "/dashboard/sales-channels/health",
        severity: "normal",
        category: "smoke_prerequisites",
        source: row.id,
      });
    }
  }

  return steps;
}

export function sortIntegrationHealthRecoverySteps(
  steps: readonly IntegrationHealthRecoveryStep[],
): IntegrationHealthRecoveryStep[] {
  return [...steps].sort((a, b) => {
    const rank = severityRank(a.severity) - severityRank(b.severity);
    if (rank !== 0) return rank;
    return a.title.localeCompare(b.title);
  });
}

export function summarizeIntegrationHealthRecovery(
  steps: readonly IntegrationHealthRecoveryStep[],
): { headline: string; hasUrgentSteps: boolean } {
  const hasUrgentSteps = steps.some((step) => step.severity === "urgent");

  if (steps.length === 0) {
    return {
      headline:
        "No urgent integration recovery steps — use quick links below for routine setup and verification.",
      hasUrgentSteps: false,
    };
  }

  if (hasUrgentSteps) {
    return {
      headline: `${steps.length} prioritized recovery step(s) — address urgent items before pilot scale or LIVE claims.`,
      hasUrgentSteps: true,
    };
  }

  return {
    headline: `${steps.length} setup step(s) remain — complete before engineering smoke and commercial GO.`,
    hasUrgentSteps: false,
  };
}

export function buildIntegrationHealthRecoverySteps(input: {
  channelCards: IntegrationHealthChannelCardsModel;
  smokeArtifacts: IntegrationHealthSmokeArtifactsModel;
}): IntegrationHealthRecoveryStep[] {
  const steps: IntegrationHealthRecoveryStep[] = [];
  const seen = new Set<string>();

  const webhookCard = input.channelCards.cards.find((card) => card.id === "webhooks");
  if (webhookCard && webhookCard.stateTone === "down") {
    pushUniqueStep(steps, seen, {
      id: "webhook-backlog",
      title: "Clear webhook delivery backlog",
      detail: webhookCard.currentState,
      href: "/dashboard/sales-channels/webhooks",
      severity: "urgent",
      category: "webhook_backlog",
      source: "webhooks",
    });
    pushUniqueStep(steps, seen, {
      id: "webhook-error-recovery",
      title: "Review error recovery for failed webhooks",
      detail:
        "Use safe replay actions only when signing secrets are verified — never replay invalid signatures.",
      href: "/dashboard/error-recovery",
      severity: "normal",
      category: "error_recovery",
      source: "webhooks",
    });
  }

  for (const card of input.channelCards.cards) {
    const step = stepFromChannelCard(card);
    if (step) pushUniqueStep(steps, seen, step);
  }

  for (const step of stepsFromSmokeArtifacts(input.smokeArtifacts)) {
    pushUniqueStep(steps, seen, step);
  }

  return sortIntegrationHealthRecoverySteps(steps).slice(0, MAX_RECOVERY_STEPS);
}

export function buildIntegrationHealthRecoveryModel(input: {
  channelCards: IntegrationHealthChannelCardsModel;
  smokeArtifacts: IntegrationHealthSmokeArtifactsModel;
  loadedAt?: string;
}): IntegrationHealthRecoveryModel {
  const steps = buildIntegrationHealthRecoverySteps(input);
  const summary = summarizeIntegrationHealthRecovery(steps);

  return {
    policyId: INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID,
    loadedAt: input.loadedAt ?? new Date().toISOString(),
    headline: summary.headline,
    hasUrgentSteps: summary.hasUrgentSteps,
    steps,
    quickLinks: INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS,
    opsChecklistDoc: INTEGRATION_HEALTH_RECOVERY_OPS_CHECKLIST_DOC,
  };
}
