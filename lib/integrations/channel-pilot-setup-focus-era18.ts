import type {
  ChannelPilotSetupProgress,
  ChannelPilotSetupStepDef,
  ChannelPilotSetupStepId,
} from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import { channelPilotSetupIncompleteStepCount } from "@/lib/integrations/channel-pilot-setup-wizard-steps";
import {
  CHANNEL_PILOT_CERTIFICATION_ANCHOR,
  CHANNEL_PILOT_CONNECTION_ANCHOR,
  CHANNEL_PILOT_TOOLS_ANCHOR,
  CHANNEL_PILOT_WEBHOOKS_ANCHOR,
  CHANNEL_PILOT_WEBHOOK_LOG_ROUTE,
} from "@/lib/integrations/channel-pilot-setup-focus-era18-policy";

export type ChannelPilotSetupFocusSnapshot = {
  completedCount: number;
  totalCount: number;
  incompleteCount: number;
  currentStepId: ChannelPilotSetupStepId | null;
  pilotReady: boolean;
};

export type ChannelPilotSetupAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type ChannelPilotSetupStepRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const STEP_ORDER: readonly ChannelPilotSetupStepId[] = [
  "save_credentials",
  "test_connection",
  "configure_webhooks",
  "verify_webhook",
  "run_certification",
];

export function channelPilotSetupStepAnchor(stepId: ChannelPilotSetupStepId): string {
  return `#channel-pilot-step-${stepId}`;
}

export function buildChannelPilotSetupFocusSnapshot(
  progress: ChannelPilotSetupProgress,
): ChannelPilotSetupFocusSnapshot {
  return {
    completedCount: progress.completedCount,
    totalCount: progress.totalCount,
    incompleteCount: channelPilotSetupIncompleteStepCount(progress),
    currentStepId: progress.currentStepId,
    pilotReady: progress.pilotReady,
  };
}

export function summarizeChannelPilotSetupFocus(
  snapshot: ChannelPilotSetupFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  if (snapshot.pilotReady) {
    return { totalSignals: 0, hasUrgent: false };
  }

  return {
    totalSignals: snapshot.incompleteCount > 0 ? 1 : 0,
    hasUrgent: snapshot.currentStepId !== null,
  };
}

function stepDef(
  stepDefs: readonly ChannelPilotSetupStepDef[],
  stepId: ChannelPilotSetupStepId,
): ChannelPilotSetupStepDef | null {
  return stepDefs.find((def) => def.id === stepId) ?? null;
}

function stepHref(stepId: ChannelPilotSetupStepId): string {
  switch (stepId) {
    case "save_credentials":
      return CHANNEL_PILOT_CONNECTION_ANCHOR;
    case "test_connection":
      return CHANNEL_PILOT_TOOLS_ANCHOR;
    case "configure_webhooks":
      return CHANNEL_PILOT_WEBHOOKS_ANCHOR;
    case "verify_webhook":
      return CHANNEL_PILOT_WEBHOOK_LOG_ROUTE;
    case "run_certification":
      return CHANNEL_PILOT_CERTIFICATION_ANCHOR;
    default:
      return channelPilotSetupStepAnchor(stepId);
  }
}

/** Woo/Shopify pilot wizard — current step and blockers first. */
export function pickChannelPilotSetupAttentionItems(
  progress: ChannelPilotSetupProgress,
  stepDefs: readonly ChannelPilotSetupStepDef[],
): ChannelPilotSetupAttentionItem[] {
  if (progress.pilotReady) return [];

  const snapshot = buildChannelPilotSetupFocusSnapshot(progress);
  const items: ChannelPilotSetupAttentionItem[] = [];

  if (snapshot.currentStepId) {
    const current = stepDef(stepDefs, snapshot.currentStepId);
    items.push({
      id: "current-step",
      title: `Next: ${current?.title ?? snapshot.currentStepId.replace(/_/g, " ")}`,
      detail:
        current?.description ??
        `${snapshot.incompleteCount} setup step${snapshot.incompleteCount === 1 ? "" : "s"} remain before pilot channel proof.`,
      href: stepHref(snapshot.currentStepId),
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
      detail: def?.description ?? "Complete this step to advance the pilot setup path.",
      href: stepHref(stepId),
      priority: STEP_ORDER.indexOf(stepId),
      tone: "normal",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function shouldShowChannelPilotSetupAttentionStrip(
  snapshot: ChannelPilotSetupFocusSnapshot,
): boolean {
  return !snapshot.pilotReady && snapshot.incompleteCount > 0;
}

/** Row-level next action for pilot setup wizard steps. */
export function resolveChannelPilotSetupStepRowNextAction(
  def: ChannelPilotSetupStepDef,
  complete: boolean,
  isCurrent: boolean,
): ChannelPilotSetupStepRowNextAction | null {
  if (complete) return null;

  const tone: "urgent" | "normal" = isCurrent ? "urgent" : "normal";

  switch (def.id) {
    case "save_credentials":
      return {
        label: isCurrent ? "Save credentials now" : "Open connection form",
        href: CHANNEL_PILOT_CONNECTION_ANCHOR,
        tone,
      };
    case "test_connection":
      return {
        label: isCurrent ? "Run test connection" : "Open connection tools",
        href: CHANNEL_PILOT_TOOLS_ANCHOR,
        tone,
      };
    case "configure_webhooks":
      return {
        label: isCurrent ? "Configure webhooks" : "Review webhook setup",
        href: CHANNEL_PILOT_WEBHOOKS_ANCHOR,
        tone,
      };
    case "verify_webhook":
      return {
        label: isCurrent ? "Verify webhook delivery" : "Open webhook log",
        href: CHANNEL_PILOT_WEBHOOK_LOG_ROUTE,
        tone,
      };
    case "run_certification":
      return {
        label: isCurrent ? "Run certification checks" : "Open certification panel",
        href: CHANNEL_PILOT_CERTIFICATION_ANCHOR,
        tone,
      };
    default:
      if (!def.actionHref) return null;
      return { label: def.actionLabel, href: def.actionHref, tone };
  }
}
