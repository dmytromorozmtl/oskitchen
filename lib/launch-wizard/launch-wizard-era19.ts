import type { CommercialPilotOpsDecision } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PilotGoNoGoCustomerStatus } from "@/lib/commercial/pilot-gono-go-summary";
import {
  LAUNCH_WIZARD_ROUTE,
  LAUNCH_WIZARD_STEP_DEFINITIONS,
  launchWizardStepDefinition,
  type LaunchWizardStepId,
  type LaunchWizardStepOwnerRole,
} from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const LAUNCH_WIZARD_AGGREGATOR_ERA19_POLICY_ID =
  "era19-launch-wizard-aggregator-v1" as const;

export type LaunchWizardStepStatus = "complete" | "in_progress" | "blocked" | "not_started";

export type LaunchWizardStep = {
  id: LaunchWizardStepId;
  title: string;
  summary: string;
  status: LaunchWizardStepStatus;
  missingItems: string[];
  ctaLabel: string;
  href: string;
  ownerRole: LaunchWizardStepOwnerRole;
  evidenceSource: string;
  order: number;
};

export type LaunchWizardSignals = {
  businessProfile: {
    businessName: string | null;
    businessType: string | null;
    settingsCompleted: boolean;
  };
  menuCatalog: {
    menuCount: number;
    productCount: number;
    firstMenuCreated: boolean;
    firstProductCreated: boolean;
  };
  storefront: {
    publishedCount: number;
  };
  pos: {
    firstUse: boolean;
  };
  production: {
    firstProductionCompleted: boolean;
    productionPlanCount: number;
  };
  integrations: {
    connectedCount: number;
    errorCount: number;
    pilotChannelsReady: boolean;
    liveProofIncompleteCount: number;
  };
  goLive: {
    projectId: string | null;
    criticalBlockerCount: number;
    simulationPassed: boolean;
    approvalsPending: number;
  };
  pilotReadiness: {
    workspaceAttentionCount: number;
    hasUrgent: boolean;
    commercialDecision: CommercialPilotOpsDecision | null;
    p0Blocked: boolean;
    customerExecutionStatus: PilotGoNoGoCustomerStatus | null;
    ssoProofBlocked: boolean;
    channelLiveProofBlocked: boolean;
  };
};

export type LaunchWizardProgress = {
  completedCount: number;
  totalCount: number;
  percent: number;
  blockedCount: number;
};

function step(
  id: LaunchWizardStepId,
  input: Omit<LaunchWizardStep, "id" | "title" | "summary" | "ownerRole" | "evidenceSource" | "order"> &
    Partial<Pick<LaunchWizardStep, "href">>,
): LaunchWizardStep {
  const def = launchWizardStepDefinition(id);
  const order = LAUNCH_WIZARD_STEP_DEFINITIONS.findIndex((row) => row.id === id) + 1;
  return {
    id,
    title: def.title,
    summary: def.summary,
    ownerRole: def.ownerRole,
    evidenceSource: def.evidenceSource,
    order,
    href: input.href ?? def.workflowHref,
    status: input.status,
    missingItems: input.missingItems,
    ctaLabel: input.ctaLabel,
  };
}

export function buildLaunchWizardBusinessProfileStep(
  signals: LaunchWizardSignals["businessProfile"],
): LaunchWizardStep {
  const missing: string[] = [];
  if (!signals.businessName?.trim()) missing.push("Business name");
  if (!signals.businessType) missing.push("Business type");
  if (!signals.settingsCompleted) missing.push("Core settings saved");

  const complete =
    Boolean(signals.businessName?.trim()) &&
    Boolean(signals.businessType) &&
    signals.settingsCompleted;

  return step("business-profile", {
    status: complete ? "complete" : missing.length < 3 ? "in_progress" : "not_started",
    missingItems: complete ? [] : missing,
    ctaLabel: complete ? "Review settings" : "Complete profile",
  });
}

export function buildLaunchWizardMenuCatalogStep(
  signals: LaunchWizardSignals["menuCatalog"],
): LaunchWizardStep {
  const missing: string[] = [];
  if (signals.menuCount === 0 && !signals.firstMenuCreated) {
    missing.push("Create at least one menu");
  }
  if (signals.productCount === 0 && !signals.firstProductCreated) {
    missing.push("Add sellable products");
  }

  const complete =
    (signals.menuCount > 0 || signals.firstMenuCreated) &&
    (signals.productCount > 0 || signals.firstProductCreated);

  return step("menu-catalog", {
    status: complete ? "complete" : missing.length === 1 ? "in_progress" : "not_started",
    missingItems: complete ? [] : missing,
    ctaLabel: complete ? "Manage menus" : "Create menu",
    href: signals.menuCount > 0 ? "/dashboard/menus" : "/dashboard/menus/new",
  });
}

export function buildLaunchWizardStorefrontStep(
  signals: LaunchWizardSignals["storefront"],
): LaunchWizardStep {
  const complete = signals.publishedCount > 0;
  return step("storefront", {
    status: complete ? "complete" : "not_started",
    missingItems: complete ? [] : ["Publish storefront for online ordering"],
    ctaLabel: complete ? "Open storefront" : "Publish storefront",
  });
}

export function buildLaunchWizardPosStep(signals: LaunchWizardSignals["pos"]): LaunchWizardStep {
  const complete = signals.firstUse;
  return step("pos", {
    status: complete ? "complete" : "not_started",
    missingItems: complete ? [] : ["Run at least one POS checkout"],
    ctaLabel: complete ? "Open POS" : "Try POS terminal",
  });
}

export function buildLaunchWizardProductionStep(
  signals: LaunchWizardSignals["production"],
): LaunchWizardStep {
  const complete = signals.firstProductionCompleted || signals.productionPlanCount > 0;
  const inProgress = !complete && signals.productionPlanCount > 0;

  return step("kds-production", {
    status: complete ? "complete" : inProgress ? "in_progress" : "not_started",
    missingItems: complete
      ? []
      : ["Complete a production task or schedule batches on the calendar"],
    ctaLabel: complete ? "Open production" : "Set up production",
    href: signals.productionPlanCount > 0 ? "/dashboard/production/calendar" : "/dashboard/production",
  });
}

export function buildLaunchWizardIntegrationsStep(
  signals: LaunchWizardSignals["integrations"],
): LaunchWizardStep {
  const missing: string[] = [];
  if (signals.connectedCount === 0) {
    missing.push("Connect Woo or Shopify sales channel");
  }
  if (signals.liveProofIncompleteCount > 0) {
    missing.push("Finish in-app channel pilot wizard steps");
  }
  if (signals.errorCount > 0) {
    missing.push(`Resolve ${signals.errorCount} integration error(s)`);
  }

  const blocked = signals.errorCount > 0;
  const complete =
    signals.connectedCount > 0 &&
    signals.pilotChannelsReady &&
    signals.errorCount === 0;

  let status: LaunchWizardStepStatus = "not_started";
  if (complete) status = "complete";
  else if (blocked) status = "blocked";
  else if (signals.connectedCount > 0 || signals.liveProofIncompleteCount > 0) {
    status = "in_progress";
  }

  return step("integrations", {
    status,
    missingItems: complete ? [] : missing,
    ctaLabel: blocked ? "Fix integrations" : complete ? "Review health" : "Connect channel",
  });
}

export function buildLaunchWizardGoLiveProofStep(
  signals: LaunchWizardSignals["goLive"],
): LaunchWizardStep {
  const missing: string[] = [];
  if (!signals.projectId) missing.push("Create a go-live launch project");
  if (signals.criticalBlockerCount > 0) {
    missing.push(`${signals.criticalBlockerCount} critical launch blocker(s)`);
  }
  if (signals.approvalsPending > 0) {
    missing.push(`${signals.approvalsPending} approval(s) pending`);
  }
  if (!signals.simulationPassed) {
    missing.push("Run and pass a launch simulation");
  }

  const blocked = signals.criticalBlockerCount > 0;
  const complete =
    Boolean(signals.projectId) &&
    signals.criticalBlockerCount === 0 &&
    signals.simulationPassed &&
    signals.approvalsPending === 0;

  let status: LaunchWizardStepStatus = "not_started";
  if (complete) status = "complete";
  else if (blocked) status = "blocked";
  else if (signals.projectId) status = "in_progress";

  return step("go-live-proof", {
    status,
    missingItems: complete ? [] : missing,
    ctaLabel: signals.projectId ? "Open launch project" : "Create launch project",
    href: signals.projectId
      ? `/dashboard/go-live/projects/${signals.projectId}`
      : "/dashboard/go-live",
  });
}

export function buildLaunchWizardPilotReadinessStep(
  signals: LaunchWizardSignals["pilotReadiness"],
): LaunchWizardStep {
  const missing: string[] = [];
  if (signals.workspaceAttentionCount > 0) {
    missing.push(`${signals.workspaceAttentionCount} workspace pilot gap(s)`);
  }
  if (signals.commercialDecision === "NO-GO") {
    missing.push("Commercial GO/NO-GO is NO-GO — resolve evidence gates");
  }
  if (signals.commercialDecision === "UNKNOWN") {
    missing.push("Run smoke:pilot-gono-go for commercial decision artifact");
  }
  if (signals.customerExecutionStatus === "skipped_missing_customer") {
    missing.push("Paid pilot customer not recorded in GO/NO-GO artifact");
  }
  if (signals.p0Blocked) {
    missing.push("P0 staging proof blocked — ops credentials required");
  }
  if (signals.ssoProofBlocked) {
    missing.push("SSO IdP staging proof incomplete");
  }
  if (signals.channelLiveProofBlocked) {
    missing.push("Woo/Shopify engineering live smoke not passed");
  }

  const blocked =
    signals.hasUrgent ||
    signals.commercialDecision === "NO-GO" ||
    signals.p0Blocked ||
    signals.ssoProofBlocked ||
    signals.channelLiveProofBlocked ||
    signals.customerExecutionStatus === "skipped_missing_customer";
  const complete =
    signals.workspaceAttentionCount === 0 &&
    signals.commercialDecision === "GO" &&
    !signals.p0Blocked &&
    !signals.ssoProofBlocked &&
    !signals.channelLiveProofBlocked &&
    signals.customerExecutionStatus === "recorded";

  let status: LaunchWizardStepStatus = "not_started";
  if (complete) status = "complete";
  else if (blocked) status = "blocked";
  else if (
    signals.workspaceAttentionCount > 0 ||
    signals.commercialDecision === "UNKNOWN" ||
    signals.customerExecutionStatus === "skipped_missing_customer"
  ) {
    status = "in_progress";
  }

  return step("pilot-readiness", {
    status,
    missingItems: complete ? [] : missing,
    ctaLabel: blocked ? "Review commercial blockers" : "Open launch wizard",
    href: LAUNCH_WIZARD_ROUTE,
  });
}

export function buildLaunchWizardSteps(signals: LaunchWizardSignals): LaunchWizardStep[] {
  return [
    buildLaunchWizardBusinessProfileStep(signals.businessProfile),
    buildLaunchWizardMenuCatalogStep(signals.menuCatalog),
    buildLaunchWizardStorefrontStep(signals.storefront),
    buildLaunchWizardPosStep(signals.pos),
    buildLaunchWizardProductionStep(signals.production),
    buildLaunchWizardIntegrationsStep(signals.integrations),
    buildLaunchWizardGoLiveProofStep(signals.goLive),
    buildLaunchWizardPilotReadinessStep(signals.pilotReadiness),
  ];
}

export function summarizeLaunchWizardProgress(steps: readonly LaunchWizardStep[]): LaunchWizardProgress {
  const completedCount = steps.filter((row) => row.status === "complete").length;
  const blockedCount = steps.filter((row) => row.status === "blocked").length;
  return {
    completedCount,
    totalCount: steps.length,
    percent: steps.length === 0 ? 0 : Math.round((completedCount / steps.length) * 100),
    blockedCount,
  };
}

const STATUS_PRIORITY: Record<LaunchWizardStepStatus, number> = {
  blocked: 0,
  not_started: 1,
  in_progress: 2,
  complete: 3,
};

/** First incomplete step by wizard order — blocked and not-started before in-progress. */
export function pickLaunchWizardNextStep(
  steps: readonly LaunchWizardStep[],
): LaunchWizardStep | null {
  const incomplete = steps.filter((row) => row.status !== "complete");
  if (incomplete.length === 0) return null;

  return [...incomplete].sort((a, b) => {
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.order - b.order;
  })[0]!;
}

export function launchWizardHeadline(progress: LaunchWizardProgress): string {
  if (progress.completedCount === progress.totalCount) {
    return "All launch steps complete — confirm commercial GO/NO-GO before paid pilot cutover.";
  }
  if (progress.blockedCount > 0) {
    return `${progress.blockedCount} blocked step(s) — resolve before scaling pilot traffic.`;
  }
  return `${progress.completedCount}/${progress.totalCount} steps complete — finish setup to reach first order faster.`;
}
