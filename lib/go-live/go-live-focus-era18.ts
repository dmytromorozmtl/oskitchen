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

export type GoLiveChecklistItemFocus = {
  id: string;
  title: string;
  status: string;
  required: boolean;
  actionRoute?: string | null;
  dueAt?: string | null;
};

export type GoLiveChecklistFocusSnapshot = {
  requiredOpenCount: number;
  blockedCount: number;
  overdueCount: number;
  inProgressCount: number;
};

export type GoLiveChecklistRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const CHECKLIST_TERMINAL_STATUSES = new Set(["DONE", "WAIVED"]);

function parseChecklistDueAt(dueAt: string | null | undefined): Date | null {
  if (!dueAt?.trim()) return null;
  const parsed = new Date(`${dueAt.trim()}T23:59:59.999Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isGoLiveChecklistItemOpen(status: string): boolean {
  return !CHECKLIST_TERMINAL_STATUSES.has(status);
}

export function isGoLiveChecklistItemOverdue(
  dueAt: string | null | undefined,
  status: string,
  now = Date.now(),
): boolean {
  if (!isGoLiveChecklistItemOpen(status)) return false;
  const due = parseChecklistDueAt(dueAt);
  return due !== null && due.getTime() < now;
}

export function goLiveChecklistItemAnchor(itemId: string): string {
  return `#go-live-checklist-${itemId}`;
}

export function buildGoLiveChecklistFocusSnapshot(
  items: readonly GoLiveChecklistItemFocus[],
  now = Date.now(),
): GoLiveChecklistFocusSnapshot {
  let requiredOpenCount = 0;
  let blockedCount = 0;
  let overdueCount = 0;
  let inProgressCount = 0;

  for (const item of items) {
    if (!isGoLiveChecklistItemOpen(item.status)) continue;

    if (item.required) requiredOpenCount += 1;
    if (item.status === "BLOCKED") blockedCount += 1;
    if (item.status === "IN_PROGRESS") inProgressCount += 1;
    if (isGoLiveChecklistItemOverdue(item.dueAt, item.status, now)) overdueCount += 1;
  }

  return {
    requiredOpenCount,
    blockedCount,
    overdueCount,
    inProgressCount,
  };
}

export function summarizeGoLiveChecklistFocus(
  focus: GoLiveChecklistFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    (focus.requiredOpenCount > 0 ? 1 : 0) +
    (focus.blockedCount > 0 ? 1 : 0) +
    (focus.overdueCount > 0 ? 1 : 0);

  return {
    totalSignals,
    hasUrgent:
      focus.requiredOpenCount > 0 ||
      focus.blockedCount > 0 ||
      focus.overdueCount > 0,
  };
}

function firstRequiredOpenItem(
  items: readonly GoLiveChecklistItemFocus[],
): GoLiveChecklistItemFocus | null {
  return items.find((item) => item.required && isGoLiveChecklistItemOpen(item.status)) ?? null;
}

function firstBlockedItem(
  items: readonly GoLiveChecklistItemFocus[],
): GoLiveChecklistItemFocus | null {
  return items.find((item) => item.status === "BLOCKED") ?? null;
}

function firstOverdueItem(
  items: readonly GoLiveChecklistItemFocus[],
  now = Date.now(),
): GoLiveChecklistItemFocus | null {
  return (
    items.find((item) => isGoLiveChecklistItemOverdue(item.dueAt, item.status, now)) ?? null
  );
}

/** Launch checklist — required gaps, blocked items, and overdue tasks first. */
export function pickGoLiveChecklistAttentionItems(
  items: readonly GoLiveChecklistItemFocus[],
  focus: GoLiveChecklistFocusSnapshot,
  now = Date.now(),
): GoLiveAttentionItem[] {
  const attention: GoLiveAttentionItem[] = [];

  if (focus.requiredOpenCount > 0) {
    const required = firstRequiredOpenItem(items);
    attention.push({
      id: "required-open",
      title: `${focus.requiredOpenCount} required checklist item${focus.requiredOpenCount === 1 ? "" : "s"} open`,
      detail: required
        ? `${required.title} must be DONE before launch approvals unlock.`
        : "Complete required launch checklist items before requesting approvals.",
      href: required ? goLiveChecklistItemAnchor(required.id) : "#go-live-checklist",
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.blockedCount > 0) {
    const blocked = firstBlockedItem(items);
    attention.push({
      id: "blocked-items",
      title: `${focus.blockedCount} blocked checklist item${focus.blockedCount === 1 ? "" : "s"}`,
      detail: blocked
        ? `${blocked.title} is blocked — resolve dependency or open the linked module.`
        : "Unblock checklist items so the launch pipeline can advance.",
      href: blocked ? goLiveChecklistItemAnchor(blocked.id) : "#go-live-checklist",
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.overdueCount > 0) {
    const overdue = firstOverdueItem(items, now);
    attention.push({
      id: "overdue-items",
      title: `${focus.overdueCount} overdue checklist item${focus.overdueCount === 1 ? "" : "s"}`,
      detail: overdue
        ? `${overdue.title} is past due — complete or reassign before launch ETA slips.`
        : "Checklist due dates have passed — reprioritize open tasks.",
      href: overdue ? goLiveChecklistItemAnchor(overdue.id) : "#go-live-checklist",
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.inProgressCount > 0 && focus.requiredOpenCount === 0 && attention.length < 4) {
    attention.push({
      id: "in-progress",
      title: `${focus.inProgressCount} checklist item${focus.inProgressCount === 1 ? "" : "s"} in progress`,
      detail: "Mark items DONE once module setup is verified on staging.",
      href: "#go-live-checklist",
      priority: 1,
      tone: "normal",
    });
  }

  return attention.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

/** Row-level next action for launch checklist items. */
export function resolveGoLiveChecklistRowNextAction(
  item: GoLiveChecklistItemFocus,
  now = Date.now(),
): GoLiveChecklistRowNextAction | null {
  if (!isGoLiveChecklistItemOpen(item.status)) return null;
  if (!item.actionRoute?.trim()) return null;

  const href = item.actionRoute.trim();
  const overdue = isGoLiveChecklistItemOverdue(item.dueAt, item.status, now);

  if (overdue) {
    return { label: "Complete — overdue", href, tone: "urgent" };
  }

  if (item.status === "BLOCKED") {
    return { label: "Unblock — open module", href, tone: "urgent" };
  }

  if (item.status === "NEEDS_REVIEW") {
    return { label: "Review sign-off", href, tone: "urgent" };
  }

  if (item.status === "IN_PROGRESS") {
    return { label: "Continue setup", href, tone: "normal" };
  }

  if (item.required) {
    return { label: "Start required setup", href, tone: "urgent" };
  }

  return { label: "Open module", href, tone: "normal" };
}

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
