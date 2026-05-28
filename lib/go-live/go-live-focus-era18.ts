import {
  countBySeverity,
  rankSeverity,
  type LaunchBlocker,
} from "@/lib/go-live/blocker-engine";
import type { ValidationReport } from "@/lib/go-live/launch-validator";

export type GoLiveFocusSnapshot = {
  criticalBlockerCount: number;
  highRiskBlockerCount: number;
  warningBlockerCount: number;
  approvalsPending: number;
  readinessScore: number;
  canApprove: boolean;
};

export type GoLiveAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type GoLiveBlockerRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export function buildGoLiveFocusSnapshot(
  report: ValidationReport,
  approvalsPending: number,
): GoLiveFocusSnapshot {
  const counts = countBySeverity(report.blockers);

  return {
    criticalBlockerCount: counts.CRITICAL,
    highRiskBlockerCount: counts.HIGH_RISK,
    warningBlockerCount: counts.WARNING,
    approvalsPending,
    readinessScore: report.readiness.score,
    canApprove: report.canApprove,
  };
}

export function summarizeGoLiveFocus(
  focus: GoLiveFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    focus.criticalBlockerCount +
    focus.highRiskBlockerCount +
    focus.warningBlockerCount +
    (focus.approvalsPending > 0 ? 1 : 0);

  const hasUrgent = focus.criticalBlockerCount > 0 || focus.highRiskBlockerCount > 0;

  return { totalSignals, hasUrgent };
}

function blockerTone(severity: LaunchBlocker["severity"]): "urgent" | "normal" {
  return severity === "CRITICAL" || severity === "HIGH_RISK" ? "urgent" : "normal";
}

/** Launch blockers — critical and high-risk first, then pending approvals. */
export function pickGoLiveAttentionItems(
  blockers: readonly LaunchBlocker[],
  focus: GoLiveFocusSnapshot,
): GoLiveAttentionItem[] {
  const items: GoLiveAttentionItem[] = [];

  const sorted = [...blockers].sort(
    (a, b) => rankSeverity(b.severity) - rankSeverity(a.severity),
  );

  for (const blocker of sorted) {
    if (items.length >= 4) break;
    if (blocker.severity === "INFO") continue;

    items.push({
      id: blocker.key,
      title: blocker.title,
      detail: blocker.resolution,
      href: blocker.actionRoute ?? `#go-live-blocker-${blocker.key}`,
      priority: rankSeverity(blocker.severity),
      tone: blockerTone(blocker.severity),
    });
  }

  if (focus.approvalsPending > 0 && items.length < 4) {
    items.push({
      id: "approvals-pending",
      title: `${focus.approvalsPending} launch approval${focus.approvalsPending === 1 ? "" : "s"} pending`,
      detail: "Required sign-offs must complete before launch unlocks.",
      href: "#go-live-approvals",
      priority: 1,
      tone: focus.criticalBlockerCount > 0 ? "normal" : "urgent",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

/** Legacy pre-project checklist items for first-time go-live visitors. */
export function pickGoLiveLegacyAttentionItems(
  checks: readonly { label: string; href: string; done: boolean }[],
): GoLiveAttentionItem[] {
  return checks
    .filter((check) => !check.done)
    .slice(0, 4)
    .map((check, index) => ({
      id: `legacy-${check.label.replace(/\s+/g, "-").toLowerCase()}`,
      title: check.label,
      detail: "Complete this pre-flight step or create a launch project for full orchestration.",
      href: check.href,
      priority: 4 - index,
      tone: index === 0 ? "urgent" : "normal",
    }));
}

/** Row-level next action for launch blocker lists. */
export function resolveGoLiveBlockerRowNextAction(
  blocker: LaunchBlocker,
): GoLiveBlockerRowNextAction | null {
  if (!blocker.actionRoute) return null;

  if (blocker.severity === "CRITICAL") {
    return { label: "Fix blocker", href: blocker.actionRoute, tone: "urgent" };
  }

  if (blocker.severity === "HIGH_RISK") {
    return { label: "Resolve risk", href: blocker.actionRoute, tone: "urgent" };
  }

  return { label: "Review item", href: blocker.actionRoute, tone: "normal" };
}
