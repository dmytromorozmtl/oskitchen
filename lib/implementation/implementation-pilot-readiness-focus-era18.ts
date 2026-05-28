import {
  buildGoLiveFocusSnapshot,
  pickGoLiveAttentionItems,
} from "@/lib/go-live/go-live-focus-era18";
import { GO_LIVE_SSO_PILOT_BLOCKER_KEY } from "@/lib/go-live/go-live-sso-pilot-focus-era18-policy";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import type { ValidationReport } from "@/lib/go-live/launch-validator";
import { buildPilotIntegrationLiveProofRows } from "@/lib/integrations/pilot-integration-health-live-proof-era18";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import {
  buildGettingStartedPilotSsoFocus,
  pickGettingStartedPilotSsoAttentionItems,
  type GettingStartedPilotSsoFocus,
} from "@/lib/onboarding/getting-started-pilot-sso-era18";
import {
  IMPLEMENTATION_GO_LIVE_ROUTE,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18-policy";

export type ImplementationPilotReadinessGoLiveSlice = {
  projectId: string | null;
  validation: ValidationReport | null;
  approvalsPending: number;
};

export type ImplementationPilotReadinessModel = {
  channelLiveProofSlices: readonly ChannelPilotLiveProofSlice[];
  pilotSso: GettingStartedPilotSsoFocus;
  goLive: ImplementationPilotReadinessGoLiveSlice;
};

export type ImplementationPilotReadinessAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
  category: "sso" | "channel" | "go-live";
};

export function summarizeImplementationPilotReadiness(
  items: readonly ImplementationPilotReadinessAttentionItem[],
): { totalSignals: number; hasUrgent: boolean } {
  return {
    totalSignals: items.length,
    hasUrgent: items.some((item) => item.tone === "urgent"),
  };
}

function goLiveProjectHref(projectId: string | null, fallbackAnchor?: string): string {
  if (projectId) {
    return `/dashboard/go-live/projects/${projectId}${fallbackAnchor ?? ""}`;
  }
  return IMPLEMENTATION_GO_LIVE_ROUTE;
}

function mapGoLiveBlockersToAttentionItems(
  goLive: ImplementationPilotReadinessGoLiveSlice,
  skipKeys: ReadonlySet<string>,
): ImplementationPilotReadinessAttentionItem[] {
  if (!goLive.validation) return [];

  const focus = buildGoLiveFocusSnapshot(goLive.validation, goLive.approvalsPending);
  const picked = pickGoLiveAttentionItems(goLive.validation.blockers, focus);

  return picked
    .filter((item) => !skipKeys.has(item.id))
    .map((item) => ({
      id: `go-live-${item.id}`,
      title: item.title,
      detail: item.detail,
      href: item.href.startsWith("/")
        ? item.href
        : item.href.startsWith("#")
          ? goLiveProjectHref(goLive.projectId, item.href)
          : goLiveProjectHref(goLive.projectId),
      priority: item.tone === "urgent" ? item.priority + 10 : item.priority,
      tone: item.tone,
      category: "go-live" as const,
    }));
}

/** Implementation hub — pilot channel, SSO, and launch validation gaps first. */
export function pickImplementationPilotReadinessAttentionItems(
  model: ImplementationPilotReadinessModel,
): ImplementationPilotReadinessAttentionItem[] {
  const items: ImplementationPilotReadinessAttentionItem[] = [];
  const skipGoLiveKeys = new Set<string>();

  for (const item of pickGettingStartedPilotSsoAttentionItems(model.pilotSso)) {
    items.push({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      priority: item.priority,
      tone: item.tone,
      category: "sso",
    });
    skipGoLiveKeys.add(GO_LIVE_SSO_PILOT_BLOCKER_KEY);
  }

  for (const row of buildPilotIntegrationLiveProofRows(model.channelLiveProofSlices)) {
    items.push({
      id: row.id,
      title: `${row.label} — ${row.statusLabel}`,
      detail: row.detail,
      href: row.href,
      priority: row.tone === "urgent" ? 3 : row.id.endsWith("-awaiting-live-smoke") ? 12 : 8,
      tone: row.tone,
      category: "channel",
    });
  }

  items.push(...mapGoLiveBlockersToAttentionItems(model.goLive, skipGoLiveKeys));

  if (
    model.goLive.projectId &&
    model.goLive.validation &&
    model.goLive.validation.blockers.some(
      (blocker: LaunchBlocker) =>
        blocker.severity === "CRITICAL" || blocker.severity === "HIGH_RISK",
    ) &&
    !items.some((item) => item.category === "go-live")
  ) {
    items.push({
      id: "go-live-open-project",
      title: "Launch validation blockers open",
      detail: "Review go-live launch validation before pilot cutover.",
      href: goLiveProjectHref(model.goLive.projectId),
      priority: 11,
      tone: "urgent",
      category: "go-live",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function buildImplementationPilotSsoFocusFromView(input: {
  entitlementEnabled: boolean;
  configured: boolean;
  active: boolean;
  workspaceId: string | null;
}): GettingStartedPilotSsoFocus {
  return buildGettingStartedPilotSsoFocus({
    items: [],
    allDone: false,
    showChecklist: false,
    accountAgeDays: 0,
    pilotChannel: { connectedCount: 0, errorCount: 0 },
    pilotChannelLiveProof: { slices: [] },
    pilotSso: input,
  });
}
