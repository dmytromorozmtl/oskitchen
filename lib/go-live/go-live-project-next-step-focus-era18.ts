import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import { rankSeverity } from "@/lib/go-live/blocker-engine";
import {
  GO_LIVE_APPROVALS_ANCHOR,
  GO_LIVE_VALIDATION_ANCHOR,
} from "@/lib/go-live/go-live-project-next-step-focus-era18-policy";
import {
  buildGoLiveChecklistFocusSnapshot,
  pickGoLiveChecklistAttentionItems,
  resolveGoLiveBlockerRowNextAction,
  resolveGoLiveChecklistRowNextAction,
  type GoLiveChecklistItemFocus,
  type GoLiveFocusSnapshot,
} from "@/lib/go-live/go-live-focus-era18";
import type { ImplementationPilotReadinessAttentionItem } from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";

export type GoLiveProjectNextStepKind =
  | "blocker"
  | "pilot"
  | "checklist"
  | "approval"
  | "ready";

export type GoLiveProjectNextStepHero = {
  kind: GoLiveProjectNextStepKind;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  tone: "urgent" | "normal" | "success";
  readinessScore: number;
};

type RankedCandidate = GoLiveProjectNextStepHero & { rank: number };

function blockerRank(severity: LaunchBlocker["severity"]): number {
  if (severity === "CRITICAL") return 1;
  if (severity === "HIGH_RISK") return 2;
  if (severity === "WARNING") return 7;
  return 9;
}

function pilotRank(item: ImplementationPilotReadinessAttentionItem): number {
  if (item.tone === "urgent" && item.category === "channel") return 3;
  if (item.tone === "urgent" && item.category === "sso") return 4;
  if (item.tone === "urgent") return 5;
  return 8;
}

export function resolveGoLiveProjectNextStepHero(input: {
  blockers: readonly LaunchBlocker[];
  focus: GoLiveFocusSnapshot;
  checklistItems: readonly GoLiveChecklistItemFocus[];
  pilotReadinessItems: readonly ImplementationPilotReadinessAttentionItem[];
  channelPilotLiveProofSlices?: readonly ChannelPilotLiveProofSlice[];
}): GoLiveProjectNextStepHero | null {
  const candidates: RankedCandidate[] = [];
  const readinessScore = input.focus.readinessScore;

  const sortedBlockers = [...input.blockers].sort(
    (a, b) => rankSeverity(b.severity) - rankSeverity(a.severity),
  );

  for (const blocker of sortedBlockers) {
    if (blocker.severity === "INFO") continue;
    const action = resolveGoLiveBlockerRowNextAction(blocker, {
      channelPilotLiveProofSlices: input.channelPilotLiveProofSlices,
    });
    if (!action) continue;

    candidates.push({
      rank: blockerRank(blocker.severity),
      kind: "blocker",
      title: blocker.title,
      detail: blocker.resolution,
      href: action.href,
      ctaLabel: action.label,
      tone: action.tone === "urgent" ? "urgent" : "normal",
      readinessScore,
    });
  }

  for (const item of input.pilotReadinessItems.slice(0, 3)) {
    candidates.push({
      rank: pilotRank(item),
      kind: "pilot",
      title: item.title,
      detail: item.detail,
      href: item.href,
      ctaLabel: item.category === "sso" ? "Open SSO setup" : "Open channel setup",
      tone: item.tone === "urgent" ? "urgent" : "normal",
      readinessScore,
    });
  }

  const checklistFocus = buildGoLiveChecklistFocusSnapshot(input.checklistItems);
  const checklistAttention = pickGoLiveChecklistAttentionItems(
    input.checklistItems,
    checklistFocus,
  );

  for (const item of checklistAttention.slice(0, 2)) {
    const checklistItem = input.checklistItems.find((row) => item.href.includes(row.id));
    const rowAction = checklistItem
      ? resolveGoLiveChecklistRowNextAction(checklistItem)
      : null;

    candidates.push({
      rank: item.id === "blocked-items" ? 4 : item.id === "overdue-items" ? 5 : 6,
      kind: "checklist",
      title: item.title,
      detail: item.detail,
      href: rowAction?.href ?? item.href,
      ctaLabel: rowAction?.label ?? "Open checklist item",
      tone: item.tone === "urgent" ? "urgent" : "normal",
      readinessScore,
    });
  }

  if (
    input.focus.approvalsPending > 0 &&
    input.focus.criticalBlockerCount === 0 &&
    input.focus.highRiskBlockerCount === 0
  ) {
    candidates.push({
      rank: 6,
      kind: "approval",
      title: `${input.focus.approvalsPending} launch approval${input.focus.approvalsPending === 1 ? "" : "s"} pending`,
      detail: "Required sign-offs must complete before launch unlocks.",
      href: GO_LIVE_APPROVALS_ANCHOR,
      ctaLabel: "Collect approvals",
      tone: "urgent",
      readinessScore,
    });
  }

  const best = candidates.sort((a, b) => a.rank - b.rank)[0];
  if (best) {
    const { rank: _rank, ...hero } = best;
    return hero;
  }

  if (input.focus.canApprove) {
    return {
      kind: "ready",
      title: "Validation passed — ready for approvals",
      detail: `${readinessScore}% readiness with no critical blockers. Collect required sign-offs to unlock launch.`,
      href: GO_LIVE_APPROVALS_ANCHOR,
      ctaLabel: "Start approvals",
      tone: "success",
      readinessScore,
    };
  }

  if (
    input.focus.criticalBlockerCount === 0 &&
    input.focus.highRiskBlockerCount === 0 &&
    input.pilotReadinessItems.length === 0 &&
    checklistFocus.requiredOpenCount === 0
  ) {
    return {
      kind: "ready",
      title: "Launch pipeline on track",
      detail: `${readinessScore}% readiness — review validation and run a simulation before cutover.`,
      href: GO_LIVE_VALIDATION_ANCHOR,
      ctaLabel: "Review validation",
      tone: "success",
      readinessScore,
    };
  }

  return null;
}
