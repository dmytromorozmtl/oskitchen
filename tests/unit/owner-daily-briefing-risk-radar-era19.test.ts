import { describe, expect, it } from "vitest";

import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildOwnerDailyBriefingRiskRadarSlice,
  buildOwnerDailyBriefingRiskSignals,
  summarizeOwnerDailyBriefingRiskRadar,
} from "@/lib/briefing/owner-daily-briefing-risk-radar-era19";
import { OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-risk-radar-era19-policy";
import {
  filterBriefingRiskSignalsForRolePack,
  shouldShowBriefingRiskRadarLane,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";

const p0Skipped: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["SSO_STAGING_TEST_EMAIL"],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
  },
};

const goNoGoNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: [{ id: "p0", label: "P0 proof", reason: "awaiting credentials" }],
  gates: [],
};

const commercialOps: CommercialPilotOpsStatusModel = {
  loadedAt: "2026-05-28T00:00:00.000Z",
  goNoGo: { artifactPresent: true, summary: goNoGoNoGo },
  p0Staging: { artifactPresent: true, summary: p0Skipped },
};

const baseKpis = {
  ordersToday: 5,
  ordersDueToday: 2,
  activeOrders: 3,
  blockedOrdersApprox: 0,
  posKitchenQueueToday: 0,
  posTransactionsToday: 0,
  productionWorkOpen: 0,
  packingQueueOpen: 0,
  revenueToday: 500,
  errorIntegrations: 0,
  webhooksNeedingAttention: 0,
  failedExternalOrders: 0,
  openSupportTickets: 0,
  overdueTasks: 0,
};

describe("owner daily briefing risk radar era19", () => {
  it("locks era19 risk radar policy id", () => {
    expect(OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-risk-radar-v1",
    );
  });

  it("surfaces P0 and GO/NO-GO commercial signals without faking PASS", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: baseKpis,
      blockers: [],
      integrationOverall: "healthy",
      commercialOps,
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: true,
    });

    expect(signals.some((signal) => signal.id === "risk-p0-staging-proof")).toBe(true);
    expect(signals.some((signal) => signal.id === "risk-commercial-gono-go")).toBe(true);
    expect(signals.some((signal) => signal.title.includes("PASS"))).toBe(false);
    expect(signals.find((signal) => signal.id === "risk-p0-staging-proof")?.honestNote).toContain(
      "SKIPPED",
    );
  });

  it("surfaces live smoke SKIPPED and SSO IdP staging gaps", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: baseKpis,
      blockers: [],
      integrationOverall: "healthy",
      integrationHealth: {
        healthHref: "/dashboard/integration-health",
        overall: "healthy",
        headline: "Healthy",
        healthyCount: 2,
        degradedCount: 0,
        downCount: 0,
        failedWebhookCount: 0,
        liveProofUrgentCount: 0,
        pendingLiveSmokeCount: 1,
        channelSmokeOverall: "SKIPPED",
        channelSmokeProofStatus: "proof_skipped_missing_prerequisites",
        connections: [],
        liveProofRows: [],
        allClear: false,
      },
      commercialOps,
      ssoEntitlementEnabled: true,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: true,
    });

    expect(signals.some((signal) => signal.id === "risk-channel-live-smoke")).toBe(true);
    expect(signals.some((signal) => signal.id === "risk-sso-idp-staging")).toBe(true);
    expect(signals.some((signal) => signal.id === "risk-sso-workspace-setup")).toBe(true);
  });

  it("surfaces operational risks: stuck orders, production, integrations, support, low stock", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: {
        ...baseKpis,
        blockedOrdersApprox: 2,
        openSupportTickets: 4,
        errorIntegrations: 1,
        webhooksNeedingAttention: 1,
      },
      blockers: [],
      integrationOverall: "degraded",
      productionCalendarSummary: { overdue: 3, dueToday: 1 },
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 2,
      ingredientParConfigured: true,
    });

    expect(signals.some((signal) => signal.category === "stuck_orders")).toBe(true);
    expect(signals.some((signal) => signal.category === "overdue_production")).toBe(true);
    const overdueProduction = signals.find((signal) => signal.id === "risk-overdue-production");
    expect(overdueProduction?.href).toContain("#production-calendar-drill");
    expect(signals.some((signal) => signal.category === "integration_failure")).toBe(true);
    expect(signals.some((signal) => signal.category === "support_sla")).toBe(true);
    expect(signals.some((signal) => signal.category === "low_stock")).toBe(true);
  });

  it("prioritizes critical commercial signals before normal inventory signals", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: { ...baseKpis, openSupportTickets: 1 },
      blockers: [],
      integrationOverall: "healthy",
      commercialOps,
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 1,
      ingredientParConfigured: true,
    });

    const p0Index = signals.findIndex((signal) => signal.id === "risk-p0-staging-proof");
    const stockIndex = signals.findIndex((signal) => signal.id === "risk-low-stock");
    expect(p0Index).toBeGreaterThanOrEqual(0);
    expect(stockIndex).toBeGreaterThan(p0Index);
  });

  it("filters commercial signals for manager role pack", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: baseKpis,
      blockers: [],
      integrationOverall: "healthy",
      commercialOps,
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: true,
    });
    const managerSignals = filterBriefingRiskSignalsForRolePack(signals, "manager");

    expect(managerSignals.some((signal) => signal.category === "p0_proof")).toBe(false);
    expect(managerSignals.some((signal) => signal.category === "commercial_gono_go")).toBe(false);
  });

  it("builds aggregate slice with all-clear headline when no signals", () => {
    const slice = buildOwnerDailyBriefingRiskRadarSlice({
      kpis: baseKpis,
      blockers: [],
      integrationOverall: "healthy",
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: true,
    });

    expect(slice.allClear).toBe(true);
    expect(slice.headline).toContain("No active risk signals");
  });

  it("summarizes critical and high counts", () => {
    const signals = buildOwnerDailyBriefingRiskSignals({
      kpis: { ...baseKpis, blockedOrdersApprox: 1 },
      blockers: [
        {
          id: "integrations",
          title: "Integration error",
          detail: "Connection failed.",
          href: "/dashboard/sales-channels/health",
          priority: 1,
        },
      ],
      integrationOverall: "down",
      commercialOps,
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: true,
    });
    const summary = summarizeOwnerDailyBriefingRiskRadar(signals);

    expect(summary.criticalCount).toBeGreaterThan(0);
    expect(summary.headline).toContain("critical");
  });

  it("shows risk radar lane for owner and support admin", () => {
    expect(shouldShowBriefingRiskRadarLane("owner")).toBe(true);
    expect(shouldShowBriefingRiskRadarLane("support_admin")).toBe(true);
    expect(shouldShowBriefingRiskRadarLane("cashier")).toBe(false);
  });
});
