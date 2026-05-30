import {
  formatCommercialPilotOpsDecisionLabel,
  pickCommercialPilotOpsAttentionItems,
  resolveCommercialPilotOpsDecision,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE,
} from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import {
  INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import type { IntegrationHealthChannelCardsModel } from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthSmokeArtifactsModel } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  buildIntegrationHealthSupportAdminVaultOpsSlice,
  type IntegrationHealthSupportAdminVaultOpsSlice,
} from "@/lib/integrations/integration-health-support-admin-commercial-ops-era28";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const INTEGRATION_HEALTH_SUPPORT_ADMIN_ERA19_POLICY_ID =
  "era19-integration-health-support-admin-v1" as const;

export const INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR = "#support-admin-triage" as const;

export type IntegrationHealthSupportAdminMode = "platform" | "support";

export type IntegrationHealthSupportAdminTriageRow = {
  id: string;
  category: "commercial" | "connection" | "webhook" | "channel" | "sso" | "smoke";
  label: string;
  detail: string;
  tone: "urgent" | "normal";
  href: string;
};

export type IntegrationHealthSupportAdminPlatformLink = {
  id: string;
  label: string;
  href: string;
  detail: string;
};

export type IntegrationHealthSupportAdminModel = {
  policyId: typeof INTEGRATION_HEALTH_SUPPORT_ADMIN_ERA19_POLICY_ID;
  loadedAt: string;
  visible: boolean;
  mode: IntegrationHealthSupportAdminMode;
  headline: string;
  tenantContext: {
    workspaceId: string | null;
    businessName: string | null;
    connectionCount: number;
    errorConnectionCount: number;
    failedWebhookCount: number;
  };
  commercialDecisionLabel: string;
  p0ProofStatusLabel: string | null;
  p0MissingEnvVarCount: number;
  smokeSummary: {
    passed: number;
    failed: number;
    skipped: number;
    missing: number;
  };
  triageRows: IntegrationHealthSupportAdminTriageRow[];
  platformLinks: IntegrationHealthSupportAdminPlatformLink[];
  opsChecklistDoc: string;
  vaultOpsSlice: IntegrationHealthSupportAdminVaultOpsSlice | null;
};

export function resolveIntegrationHealthSupportAdminVisibility(input: {
  platformBypass: boolean;
  canTriageSupport: boolean;
}): boolean {
  return input.platformBypass || input.canTriageSupport;
}

export function resolveIntegrationHealthSupportAdminMode(input: {
  platformBypass: boolean;
}): IntegrationHealthSupportAdminMode {
  return input.platformBypass ? "platform" : "support";
}

export function mapCommercialAttentionForSupportAdmin(
  items: ReturnType<typeof pickCommercialPilotOpsAttentionItems>,
  mode: IntegrationHealthSupportAdminMode,
): IntegrationHealthSupportAdminTriageRow[] {
  return items.map((item) => ({
    id: item.id,
    category: "commercial",
    label: item.title,
    detail: item.detail,
    tone: item.tone,
    href:
      mode === "platform"
        ? item.href
        : item.id.includes("p0")
          ? "/dashboard/integration-health#engineering-smoke-artifacts"
          : LAUNCH_WIZARD_ROUTE,
  }));
}

export function buildIntegrationHealthSupportAdminTriageRows(input: {
  mode: IntegrationHealthSupportAdminMode;
  commercialOps: CommercialPilotOpsStatusModel | null;
  channelCards: IntegrationHealthChannelCardsModel;
  smokeArtifacts: IntegrationHealthSmokeArtifactsModel;
  failedWebhookCount: number;
}): IntegrationHealthSupportAdminTriageRow[] {
  const rows: IntegrationHealthSupportAdminTriageRow[] = [];

  if (input.commercialOps) {
    rows.push(
      ...mapCommercialAttentionForSupportAdmin(
        pickCommercialPilotOpsAttentionItems(input.commercialOps),
        input.mode,
      ),
    );
  }

  for (const card of input.channelCards.cards) {
    if (card.stateTone !== "down" && card.stateTone !== "degraded") continue;
    rows.push({
      id: `channel-${card.id}`,
      category: "channel",
      label: `${card.label} — ${card.currentState}`,
      detail: card.lastError ?? card.supportGuidance,
      tone: card.stateTone === "down" ? "urgent" : "normal",
      href: card.nextAction?.href ?? "/dashboard/integration-health#integration-channel-readiness",
    });
  }

  if (input.failedWebhookCount > 0 && !rows.some((row) => row.id === "channel-webhooks")) {
    rows.push({
      id: "webhook-failures",
      category: "webhook",
      label: "Unprocessed webhooks",
      detail: `${input.failedWebhookCount} webhook event(s) need review — channel orders may stall.`,
      tone: "urgent",
      href: "/dashboard/sales-channels/webhooks",
    });
  }

  for (const smokeRow of input.smokeArtifacts.rows) {
    if (smokeRow.displayStatus === "PASSED") continue;
    rows.push({
      id: `smoke-${smokeRow.id}`,
      category: "smoke",
      label: `${smokeRow.label} — ${smokeRow.displayStatus}`,
      detail: smokeRow.detail,
      tone: smokeRow.displayStatus === "FAILED" ? "urgent" : "normal",
      href: smokeRow.nextAction?.href ?? "/dashboard/integration-health#engineering-smoke-artifacts",
    });
  }

  const seen = new Set<string>();
  return rows
    .filter((row) => {
      const key = `${row.id}:${row.href}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export function buildIntegrationHealthSupportAdminPlatformLinks(
  mode: IntegrationHealthSupportAdminMode,
): IntegrationHealthSupportAdminPlatformLink[] {
  if (mode !== "platform") return [];

  return [
    {
      id: "platform-implementations",
      label: "Platform implementations",
      href: COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE,
      detail: "Cross-workspace pilot GO/NO-GO and P0 staging proof panels.",
    },
    {
      id: "platform-go-live",
      label: "Platform go-live",
      href: "/platform/go-live",
      detail: "Review blocked launch projects across tenants.",
    },
    {
      id: "platform-support-inbox",
      label: "Support inbox",
      href: "/dashboard/support/inbox",
      detail: "Open tenant support tickets tied to integration incidents.",
    },
  ];
}

export function summarizeIntegrationHealthSmokeForSupportAdmin(
  model: IntegrationHealthSmokeArtifactsModel,
): IntegrationHealthSupportAdminModel["smokeSummary"] {
  return model.rows.reduce(
    (acc, row) => {
      if (row.displayStatus === "PASSED") acc.passed += 1;
      else if (row.displayStatus === "FAILED") acc.failed += 1;
      else if (row.displayStatus === "SKIPPED WITH REASON") acc.skipped += 1;
      else acc.missing += 1;
      return acc;
    },
    { passed: 0, failed: 0, skipped: 0, missing: 0 },
  );
}

export function buildIntegrationHealthSupportAdminModel(input: {
  visible: boolean;
  mode: IntegrationHealthSupportAdminMode;
  workspaceId: string | null;
  businessName: string | null;
  connectionCount: number;
  errorConnectionCount: number;
  failedWebhookCount: number;
  commercialOps: CommercialPilotOpsStatusModel | null;
  channelCards: IntegrationHealthChannelCardsModel;
  smokeArtifacts: IntegrationHealthSmokeArtifactsModel;
}): IntegrationHealthSupportAdminModel {
  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : "UNKNOWN";
  const p0 = input.commercialOps?.p0Staging.summary ?? null;
  const triageRows = input.visible
    ? buildIntegrationHealthSupportAdminTriageRows({
        mode: input.mode,
        commercialOps: input.commercialOps,
        channelCards: input.channelCards,
        smokeArtifacts: input.smokeArtifacts,
        failedWebhookCount: input.failedWebhookCount,
      })
    : [];
  const smokeSummary = summarizeIntegrationHealthSmokeForSupportAdmin(input.smokeArtifacts);
  const vaultOpsSlice = input.visible
    ? buildIntegrationHealthSupportAdminVaultOpsSlice(input.commercialOps)
    : null;

  let headline: string;
  if (!input.visible) {
    headline = "Support admin triage is hidden for standard workspace operators.";
  } else if (vaultOpsSlice?.vaultPhaseLabel && vaultOpsSlice.vaultMissingCount > 0) {
    headline = vaultOpsSlice.headline;
  } else if (triageRows.length === 0) {
    headline = "No urgent integration or commercial proof signals for this workspace.";
  } else {
    headline = `${triageRows.length} triage signal(s) — tenant-scoped integration and commercial proof context.`;
  }

  return {
    policyId: INTEGRATION_HEALTH_SUPPORT_ADMIN_ERA19_POLICY_ID,
    loadedAt: new Date().toISOString(),
    visible: input.visible,
    mode: input.mode,
    headline,
    tenantContext: {
      workspaceId: input.workspaceId,
      businessName: input.businessName,
      connectionCount: input.connectionCount,
      errorConnectionCount: input.errorConnectionCount,
      failedWebhookCount: input.failedWebhookCount,
    },
    commercialDecisionLabel: formatCommercialPilotOpsDecisionLabel(decision),
    p0ProofStatusLabel: p0 ? p0.p0ProofStatus.replaceAll("_", " ") : null,
    p0MissingEnvVarCount: p0?.allMissingEnvVars.length ?? 0,
    smokeSummary,
    triageRows,
    platformLinks: buildIntegrationHealthSupportAdminPlatformLinks(input.mode),
    opsChecklistDoc: INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC,
    vaultOpsSlice,
  };
}
