import type { GoLiveBlockerSeverity, GoLiveLaunchStage } from "@prisma/client";

import { detectGoLiveChannelPilotBlockers } from "@/lib/go-live/go-live-channel-pilot-focus-era18";
import { detectGoLiveSsoPilotBlocker } from "@/lib/go-live/go-live-sso-pilot-focus-era18";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

export type LaunchBlocker = {
  key: string;
  severity: GoLiveBlockerSeverity;
  stage: GoLiveLaunchStage;
  title: string;
  impact: string;
  resolution: string;
  actionRoute?: string | null;
  detail?: string;
};

export function detectBlockers(inputs: ReadinessInputs): LaunchBlocker[] {
  const blockers: LaunchBlocker[] = [];

  if (!inputs.hasMenu || inputs.productCount === 0) {
    blockers.push({
      key: "no_active_menu",
      severity: "CRITICAL",
      stage: "CATALOG_SETUP",
      title: "No active menu with products",
      impact: "Customers cannot place orders without a published menu.",
      resolution: "Create at least one menu and add products before launch.",
      actionRoute: "/dashboard/menus",
    });
  }
  if (!inputs.hasBilling) {
    blockers.push({
      key: "no_billing",
      severity: "CRITICAL",
      stage: "FINANCIAL_VALIDATION",
      title: "Billing not configured",
      impact: "Workspace cannot accept payments or charge subscription fees.",
      resolution: "Configure Stripe billing and verify a payment method.",
      actionRoute: "/dashboard/billing",
    });
  }
  if (inputs.connectionsBroken > 0) {
    blockers.push({
      key: "broken_channel",
      severity: "CRITICAL",
      stage: "CHANNEL_INTEGRATIONS",
      title: "Sales channel connection is broken",
      impact: "Order sync from this channel will fail at launch.",
      resolution: "Reconnect the channel or disable it before launch.",
      actionRoute: "/dashboard/sales-channels",
      detail: `${inputs.connectionsBroken} connection(s) in error or needs-auth state.`,
    });
  }
  if ((inputs.externalCertificationRequired ?? false) && (inputs.externalMissingProviderCount ?? 0) > 0) {
    blockers.push({
      key: "external_integrations_uncertified",
      severity: "CRITICAL",
      stage: "CHANNEL_INTEGRATIONS",
      title: "External integrations are not certified",
      impact: "Launch would rely on external channel flows that have not been verified end-to-end.",
      resolution: "Run health checks and verify sync or processed webhook evidence for each live-capable provider in scope.",
      actionRoute: "/dashboard/integrations/health",
      detail: (inputs.externalMissingProviderLabels ?? []).join(", "),
    });
  }
  if (inputs.productionRuns === 0) {
    blockers.push({
      key: "no_production_validation",
      severity: "CRITICAL",
      stage: "PRODUCTION_VALIDATION",
      title: "Production flow not tested",
      impact: "Kitchen flow has never been exercised end-to-end.",
      resolution: "Run a test production batch or use the simulation engine.",
      actionRoute: "/dashboard/production",
    });
  }
  if (inputs.unmappedProductCount > 0 && inputs.connectionsConnected > 0) {
    blockers.push({
      key: "unmapped_products",
      severity: "CRITICAL",
      stage: "CATALOG_SETUP",
      title: "External products are unmapped",
      impact: "Channel orders will land in the Order Hub but cannot be processed.",
      resolution: "Resolve the queue in the Product Mapping Workbench.",
      actionRoute: "/dashboard/product-mapping/unmapped",
      detail: `${inputs.unmappedProductCount} unmapped product(s).`,
    });
  }
  if (inputs.staffActive === 0) {
    blockers.push({
      key: "no_staff_roles",
      severity: "CRITICAL",
      stage: "STAFF_TRAINING",
      title: "No active staff accounts",
      impact: "Kitchen, packing, and dispatch cannot operate.",
      resolution: "Add staff members and assign roles before launch.",
      actionRoute: "/dashboard/staff",
    });
  }
  if (inputs.packingValidatedCount === 0 && inputs.packingTaskCount > 0) {
    blockers.push({
      key: "packing_not_validated",
      severity: "CRITICAL",
      stage: "PACKING_VALIDATION",
      title: "Packing not validated",
      impact: "Packing checklists exist but have not been run successfully.",
      resolution: "Complete one packing verification session.",
      actionRoute: "/dashboard/packing",
    });
  }

  if (!inputs.hasAnalytics) {
    blockers.push({
      key: "analytics_missing",
      severity: "HIGH_RISK",
      stage: "FINANCIAL_VALIDATION",
      title: "Analytics not firing",
      impact: "First-day KPIs will be invisible.",
      resolution: "Verify analytics events are firing from storefront and POS.",
      actionRoute: "/dashboard/analytics",
    });
  }
  if (!inputs.hasBackup) {
    blockers.push({
      key: "no_backup",
      severity: "HIGH_RISK",
      stage: "FINANCIAL_VALIDATION",
      title: "No recent backup export",
      impact: "If a rollback is needed there is no restore point.",
      resolution: "Run a workspace export.",
      actionRoute: "/dashboard/import-export",
    });
  }
  if (inputs.deliveryRoutes === 0 && inputs.connectionsConnected > 0) {
    blockers.push({
      key: "no_routes",
      severity: "HIGH_RISK",
      stage: "DELIVERY_VALIDATION",
      title: "No delivery routes prepared",
      impact: "Delivery orders will route ad-hoc on launch day.",
      resolution: "Create at least one route or disable delivery.",
      actionRoute: "/dashboard/delivery",
    });
  }
  if (inputs.unmappedProductCount > 0 && inputs.connectionsConnected === 0) {
    blockers.push({
      key: "unmapped_no_channel",
      severity: "WARNING",
      stage: "CATALOG_SETUP",
      title: "Unmapped catalog rows present",
      impact: "Will block channel orders if a sales channel is later connected.",
      resolution: "Clear the unmapped queue or archive obsolete rows.",
      actionRoute: "/dashboard/product-mapping/unmapped",
    });
  }
  if (!inputs.webhooksHealthy && inputs.connectionsConnected > 0) {
    blockers.push({
      key: "webhooks_unhealthy",
      severity: "HIGH_RISK",
      stage: "CHANNEL_INTEGRATIONS",
      title: "Webhook endpoints not responding",
      impact: "Live order events will be missed.",
      resolution: "Verify webhook URLs and signature secrets in Sales Channels.",
      actionRoute: "/dashboard/sales-channels",
    });
  }
  if ((inputs.placeholderIntegrationScopeCount ?? 0) > 0) {
    blockers.push({
      key: "placeholder_integrations_in_scope",
      severity: "WARNING",
      stage: "CHANNEL_INTEGRATIONS",
      title: "Placeholder integrations are still in launch scope",
      impact: "Partner-gated or placeholder providers do not count toward launch certification.",
      resolution: "Treat these providers as roadmap items or remove them from launch scope until they are actually live-capable.",
      actionRoute: "/dashboard/integrations",
      detail: (inputs.placeholderIntegrationScopeLabels ?? []).join(", "),
    });
  }
  if (
    (inputs.trainingProgramsActive ?? 0) > 0 &&
    (inputs.trainingAssignmentsTotal ?? 0) > 0 &&
    (inputs.trainingAssignmentsCompleted ?? 0) < (inputs.trainingAssignmentsTotal ?? 0)
  ) {
    const outstanding = (inputs.trainingAssignmentsTotal ?? 0) - (inputs.trainingAssignmentsCompleted ?? 0);
    blockers.push({
      key: "training_outstanding",
      severity: "HIGH_RISK",
      stage: "STAFF_TRAINING",
      title: "Training assignments not completed",
      impact: "Staff have not completed required training before launch.",
      resolution: "Drive remaining assignments to completion in the Training Command Center.",
      actionRoute: "/dashboard/training/assignments",
      detail: `${outstanding} assignment(s) outstanding.`,
    });
  }
  if (
    (inputs.trainingProgramsActive ?? 0) > 0 &&
    (inputs.certificationsActive ?? 0) === 0
  ) {
    blockers.push({
      key: "no_active_certifications",
      severity: "CRITICAL",
      stage: "STAFF_TRAINING",
      title: "No active certifications",
      impact: "Kitchen, packing, and delivery staff are unproven for launch.",
      resolution: "Issue certifications from the Training Command Center.",
      actionRoute: "/dashboard/training/certifications",
    });
  }
  if ((inputs.certificationsExpiringSoon ?? 0) > 0) {
    blockers.push({
      key: "certifications_expiring",
      severity: "WARNING",
      stage: "STAFF_TRAINING",
      title: "Certifications expiring soon",
      impact: "Some staff certifications will lapse within 30 days.",
      resolution: "Schedule retraining or renew certifications.",
      actionRoute: "/dashboard/training/certifications",
      detail: `${inputs.certificationsExpiringSoon} certification(s) within 30 days.`,
    });
  }
  if (inputs.staffHasOwner === false) {
    blockers.push({
      key: "staff_no_owner",
      severity: "CRITICAL",
      stage: "STAFF_TRAINING",
      title: "No owner / admin on staff",
      impact: "Launch responsibility must be assigned to an owner or admin teammate.",
      resolution: "Add a teammate with role type OWNER on the staff roster.",
      actionRoute: "/dashboard/staff/roster",
    });
  }
  if (
    (inputs.deliveryRoutes ?? 0) > 0 &&
    (inputs.staffDrivers ?? 0) === 0
  ) {
    blockers.push({
      key: "staff_no_driver",
      severity: "HIGH_RISK",
      stage: "STAFF_TRAINING",
      title: "Delivery enabled but no driver staff",
      impact: "Routes will fail to dispatch without an assigned driver.",
      resolution: "Add at least one staff member with role type DRIVER.",
      actionRoute: "/dashboard/staff/drivers",
    });
  }
  if ((inputs.staffKitchen ?? 0) === 0 && inputs.productionRuns > 0) {
    blockers.push({
      key: "staff_no_kitchen",
      severity: "HIGH_RISK",
      stage: "STAFF_TRAINING",
      title: "Production planned but no kitchen staff",
      impact: "Production batches exist but no kitchen staff are on the roster.",
      resolution: "Add kitchen lead/prep/line cook teammates.",
      actionRoute: "/dashboard/staff/roster",
    });
  }
  if (inputs.approvalsRequired > inputs.approvalsCount) {
    blockers.push({
      key: "approvals_missing",
      severity: "CRITICAL",
      stage: "FULL_GO_LIVE",
      title: "Required approvals missing",
      impact: "Launch cannot proceed without sign-off.",
      resolution: "Collect the required approvals on the Go-live approvals tab.",
      actionRoute: "/dashboard/go-live/approvals",
      detail: `${inputs.approvalsRequired - inputs.approvalsCount} approval(s) outstanding.`,
    });
  }

  const ssoPilotBlocker = detectGoLiveSsoPilotBlocker(inputs);
  if (ssoPilotBlocker) {
    blockers.push(ssoPilotBlocker);
  }

  blockers.push(...detectGoLiveChannelPilotBlockers(inputs));

  return blockers;
}

const SEVERITY_RANK: Record<GoLiveBlockerSeverity, number> = {
  CRITICAL: 4,
  HIGH_RISK: 3,
  WARNING: 2,
  INFO: 1,
};

export function rankSeverity(severity: GoLiveBlockerSeverity): number {
  return SEVERITY_RANK[severity];
}

export function countBySeverity(
  blockers: LaunchBlocker[],
): Record<GoLiveBlockerSeverity, number> {
  return blockers.reduce(
    (acc, b) => {
      acc[b.severity] = (acc[b.severity] ?? 0) + 1;
      return acc;
    },
    { CRITICAL: 0, HIGH_RISK: 0, WARNING: 0, INFO: 0 } as Record<GoLiveBlockerSeverity, number>,
  );
}

export function hasCriticalBlocker(blockers: LaunchBlocker[]): boolean {
  return blockers.some((b) => b.severity === "CRITICAL");
}
