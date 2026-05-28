import {
  SSO_PILOT_ACTIVATION_ANCHOR,
  SSO_PILOT_BILLING_PLANS_ROUTE,
  SSO_PILOT_CONFIGURATION_ANCHOR,
  SSO_PILOT_ENTITLEMENT_ANCHOR,
  SSO_PILOT_LOGIN_ENTRY_ANCHOR,
  SSO_PILOT_STATUS_ANCHOR,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18-policy";
import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import type {
  SsoPilotSetupProgress,
  SsoPilotSetupStepDef,
  SsoPilotSetupStepId,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-wizard-steps";

export type SsoPilotSetupFocusSnapshot = {
  completedCount: number;
  totalCount: number;
  incompleteCount: number;
  currentStepId: SsoPilotSetupStepId | null;
  adminSetupComplete: boolean;
  idpLoginProofPending: boolean;
};

export type SsoPilotSetupAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type SsoPilotSetupStepRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const STEP_ORDER: readonly SsoPilotSetupStepId[] = [
  "sso_entitlement",
  "configure_idp",
  "activate_pilot",
  "idp_login_proof",
];

export function ssoPilotSetupStepAnchor(stepId: SsoPilotSetupStepId): string {
  return `#sso-pilot-step-${stepId}`;
}

export function buildSsoPilotSetupFocusSnapshot(
  progress: SsoPilotSetupProgress,
): SsoPilotSetupFocusSnapshot {
  return {
    completedCount: progress.completedCount,
    totalCount: progress.totalCount,
    incompleteCount: progress.totalCount - progress.completedCount,
    currentStepId: progress.currentStepId,
    adminSetupComplete: progress.adminSetupComplete,
    idpLoginProofPending: progress.adminSetupComplete,
  };
}

export function summarizeSsoPilotSetupFocus(
  snapshot: SsoPilotSetupFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  if (snapshot.incompleteCount === 0) {
    return { totalSignals: 0, hasUrgent: false };
  }

  return {
    totalSignals: 1,
    hasUrgent: snapshot.currentStepId !== null,
  };
}

function stepDef(
  stepDefs: readonly SsoPilotSetupStepDef[],
  stepId: SsoPilotSetupStepId,
): SsoPilotSetupStepDef | null {
  return stepDefs.find((def) => def.id === stepId) ?? null;
}

function stepHref(stepId: SsoPilotSetupStepId, workspaceId?: string): string {
  switch (stepId) {
    case "sso_entitlement":
      return SSO_PILOT_ENTITLEMENT_ANCHOR;
    case "configure_idp":
      return SSO_PILOT_CONFIGURATION_ANCHOR;
    case "activate_pilot":
      return SSO_PILOT_ACTIVATION_ANCHOR;
    case "idp_login_proof":
      return workspaceId ? buildSsoPilotLoginUrl(workspaceId) : SSO_PILOT_LOGIN_ENTRY_ANCHOR;
    default:
      return ssoPilotSetupStepAnchor(stepId);
  }
}

/** Enterprise SSO pilot admin — current step and blockers first. */
export function pickSsoPilotSetupAttentionItems(
  progress: SsoPilotSetupProgress,
  stepDefs: readonly SsoPilotSetupStepDef[],
  workspaceId?: string,
): SsoPilotSetupAttentionItem[] {
  const snapshot = buildSsoPilotSetupFocusSnapshot(progress);
  if (snapshot.incompleteCount === 0) return [];

  const items: SsoPilotSetupAttentionItem[] = [];

  if (snapshot.currentStepId) {
    const current = stepDef(stepDefs, snapshot.currentStepId);
    const detail =
      snapshot.currentStepId === "idp_login_proof"
        ? "Admin setup is complete — run staging IdP login proof before any pilot_ready claim."
        : (current?.description ??
          `${snapshot.incompleteCount} setup step${snapshot.incompleteCount === 1 ? "" : "s"} remain before SSO pilot proof.`);

    items.push({
      id: "current-step",
      title: `Next: ${current?.title ?? snapshot.currentStepId.replace(/_/g, " ")}`,
      detail,
      href: stepHref(snapshot.currentStepId, workspaceId),
      priority: 5,
      tone: "urgent",
    });
  }

  for (const stepId of STEP_ORDER) {
    if (items.length >= 4) break;
    const status = progress.steps.find((step) => step.id === stepId);
    if (status?.complete || stepId === snapshot.currentStepId) continue;

    const def = stepDef(stepDefs, stepId);
    items.push({
      id: `blocked-${stepId}`,
      title: def?.title ?? stepId,
      detail: def?.description ?? "Complete this step to advance the SSO pilot path.",
      href: stepHref(stepId, workspaceId),
      priority: STEP_ORDER.indexOf(stepId),
      tone: "normal",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function shouldShowSsoPilotSetupAttentionStrip(
  snapshot: SsoPilotSetupFocusSnapshot,
): boolean {
  return snapshot.incompleteCount > 0;
}

/** Row-level next action for SSO pilot setup wizard steps. */
export function resolveSsoPilotSetupStepRowNextAction(
  def: SsoPilotSetupStepDef,
  complete: boolean,
  isCurrent: boolean,
  workspaceId?: string,
): SsoPilotSetupStepRowNextAction | null {
  if (complete) return null;

  const tone: "urgent" | "normal" = isCurrent ? "urgent" : "normal";

  switch (def.id) {
    case "sso_entitlement":
      return {
        label: isCurrent ? "Review billing plans" : "Check entitlement status",
        href: isCurrent ? SSO_PILOT_BILLING_PLANS_ROUTE : SSO_PILOT_STATUS_ANCHOR,
        tone,
      };
    case "configure_idp":
      return {
        label: isCurrent ? "Configure IdP now" : "Open IdP configuration",
        href: SSO_PILOT_CONFIGURATION_ANCHOR,
        tone,
      };
    case "activate_pilot":
      return {
        label: isCurrent ? "Activate pilot now" : "Open activation controls",
        href: SSO_PILOT_ACTIVATION_ANCHOR,
        tone,
      };
    case "idp_login_proof":
      if (isCurrent && workspaceId) {
        return {
          label: "Test SSO login entry",
          href: buildSsoPilotLoginUrl(workspaceId),
          tone,
        };
      }
      return {
        label: isCurrent ? "Test SSO login entry" : "Review staff login entry",
        href: SSO_PILOT_LOGIN_ENTRY_ANCHOR,
        tone,
      };
    default:
      return null;
  }
}
