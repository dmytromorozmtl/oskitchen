import type { PackingVerifyAttentionTab } from "@/lib/packing-verification/packing-verify-focus-era18-policy";

export type PackingVerifyOpenSessionFocus = {
  id: string;
  status: string;
  itemCount: number;
  customerName: string | null;
  startedAt: string;
};

export type PackingVerifyScanFocus = {
  success: boolean;
};

export type PackingVerifyItemFocus = {
  id: string;
  title: string;
  status: string;
  allergenCheckStatus: string | null;
  labelCheckStatus: string | null;
  expectedQuantity: number;
  verifiedQuantity: number;
};

export type PackingVerifyFocusSnapshot = {
  openSessionCount: number;
  failedScanCount: number;
  pendingItemCount: number;
  allergenPendingCount: number;
  labelPendingCount: number;
  issueItemCount: number;
};

export type PackingVerifyAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tab?: PackingVerifyAttentionTab;
  priority: number;
  tone: "urgent" | "normal";
};

export type PackingVerifySessionRowNextAction = {
  label: string;
  kind: "resume";
  sessionId: string;
  tone: "urgent" | "normal";
};

export type PackingVerifyItemRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const ISSUE_STATUSES = new Set(["MISSING", "WRONG_ITEM", "DAMAGED", "EXTRA"]);

export function packingVerifyItemAnchor(itemId: string): string {
  return `#packing-verify-item-${itemId}`;
}

export function packingVerifyOpenSessionsAnchor(): string {
  return "#packing-verify-open-sessions";
}

export function packingVerifyScanAnchor(): string {
  return "#packing-verify-scan";
}

export function isPackingVerifyIssueStatus(status: string): boolean {
  return ISSUE_STATUSES.has(status);
}

export function buildPackingVerifyFocusSnapshot(
  openSessions: readonly PackingVerifyOpenSessionFocus[],
  recentScans: readonly PackingVerifyScanFocus[],
  sessionItems: readonly PackingVerifyItemFocus[] = [],
): PackingVerifyFocusSnapshot {
  let pendingItemCount = 0;
  let allergenPendingCount = 0;
  let labelPendingCount = 0;
  let issueItemCount = 0;

  for (const item of sessionItems) {
    if (item.status === "PENDING") pendingItemCount += 1;
    if (item.allergenCheckStatus === "PENDING") allergenPendingCount += 1;
    if (item.labelCheckStatus === "PENDING") labelPendingCount += 1;
    if (isPackingVerifyIssueStatus(item.status)) issueItemCount += 1;
  }

  return {
    openSessionCount: openSessions.length,
    failedScanCount: recentScans.filter((scan) => !scan.success).length,
    pendingItemCount,
    allergenPendingCount,
    labelPendingCount,
    issueItemCount,
  };
}

export function summarizePackingVerifyFocus(
  focus: PackingVerifyFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    (focus.issueItemCount > 0 ? 1 : 0) +
    (focus.allergenPendingCount > 0 ? 1 : 0) +
    (focus.openSessionCount > 0 ? 1 : 0) +
    (focus.failedScanCount > 0 ? 1 : 0) +
    (focus.pendingItemCount > 0 ? 1 : 0);

  const hasUrgent =
    focus.issueItemCount > 0 ||
    focus.allergenPendingCount > 0 ||
    focus.failedScanCount > 0 ||
    focus.openSessionCount > 0;

  return { totalSignals, hasUrgent };
}

function firstIssueItem(items: readonly PackingVerifyItemFocus[]): PackingVerifyItemFocus | null {
  return items.find((item) => isPackingVerifyIssueStatus(item.status)) ?? null;
}

function firstAllergenPendingItem(items: readonly PackingVerifyItemFocus[]): PackingVerifyItemFocus | null {
  return items.find((item) => item.allergenCheckStatus === "PENDING") ?? null;
}

function firstPendingItem(items: readonly PackingVerifyItemFocus[]): PackingVerifyItemFocus | null {
  return items.find((item) => item.status === "PENDING") ?? null;
}

function oldestOpenSession(
  sessions: readonly PackingVerifyOpenSessionFocus[],
): PackingVerifyOpenSessionFocus | null {
  if (sessions.length === 0) return null;
  return [...sessions].sort(
    (left, right) => new Date(left.startedAt).getTime() - new Date(right.startedAt).getTime(),
  )[0] ?? null;
}

/** Packing verify — flagged lines, allergen checks, and open sessions first. */
export function pickPackingVerifyAttentionItems(
  openSessions: readonly PackingVerifyOpenSessionFocus[],
  focus: PackingVerifyFocusSnapshot,
  sessionItems: readonly PackingVerifyItemFocus[] = [],
): PackingVerifyAttentionItem[] {
  const items: PackingVerifyAttentionItem[] = [];

  if (focus.issueItemCount > 0) {
    const issue = firstIssueItem(sessionItems);
    items.push({
      id: "issue-lines",
      title: `${focus.issueItemCount} flagged verify line${focus.issueItemCount === 1 ? "" : "s"}`,
      detail: issue
        ? `${issue.title} is ${issue.status.replace(/_/g, " ").toLowerCase()} — resolve before pass.`
        : "Review flagged QC lines before completing the session.",
      href: issue ? packingVerifyItemAnchor(issue.id) : "#packing-verify-issues",
      tab: "active",
      priority: 5,
      tone: "urgent",
    });
  }

  if (focus.allergenPendingCount > 0) {
    const allergen = firstAllergenPendingItem(sessionItems);
    items.push({
      id: "allergen-pending",
      title: `${focus.allergenPendingCount} allergen check${focus.allergenPendingCount === 1 ? "" : "s"} pending`,
      detail: allergen
        ? `${allergen.title} needs allergen confirmation before handoff.`
        : "Confirm allergen checks on active verify lines.",
      href: allergen ? packingVerifyItemAnchor(allergen.id) : packingVerifyOpenSessionsAnchor(),
      tab: "active",
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.openSessionCount > 0) {
    const session = oldestOpenSession(openSessions);
    items.push({
      id: "open-sessions",
      title: `${focus.openSessionCount} open verify session${focus.openSessionCount === 1 ? "" : "s"}`,
      detail: session
        ? `${session.customerName ?? "Order"} · ${session.itemCount} line${session.itemCount === 1 ? "" : "s"} — resume before starting a new scan.`
        : "Resume open QC sessions before starting new scans.",
      href: packingVerifyOpenSessionsAnchor(),
      tab: "active",
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.failedScanCount > 0) {
    items.push({
      id: "failed-scans",
      title: `${focus.failedScanCount} recent scan failure${focus.failedScanCount === 1 ? "" : "s"}`,
      detail: "Retry token lookup or use manual customer search before pack-out continues.",
      href: packingVerifyScanAnchor(),
      tab: "scan",
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.pendingItemCount > 0 && items.length < 4) {
    const pending = firstPendingItem(sessionItems);
    items.push({
      id: "pending-lines",
      title: `${focus.pendingItemCount} line${focus.pendingItemCount === 1 ? "" : "s"} awaiting verify`,
      detail: pending
        ? `${pending.title} — verify quantity or mark issue before pass.`
        : "Complete pending verify lines in the active session.",
      href: pending ? packingVerifyItemAnchor(pending.id) : packingVerifyOpenSessionsAnchor(),
      tab: "active",
      priority: 1,
      tone: focus.issueItemCount > 0 ? "normal" : "urgent",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function shouldShowPackingVerifyAttentionStrip(
  focus: PackingVerifyFocusSnapshot,
): boolean {
  return (
    focus.openSessionCount > 0 ||
    focus.failedScanCount > 0 ||
    focus.pendingItemCount > 0 ||
    focus.allergenPendingCount > 0 ||
    focus.issueItemCount > 0
  );
}

export function resolvePackingVerifySessionRowNextAction(
  session: PackingVerifyOpenSessionFocus,
): PackingVerifySessionRowNextAction {
  return {
    label: "Resume verify",
    kind: "resume",
    sessionId: session.id,
    tone: session.itemCount > 0 ? "urgent" : "normal",
  };
}

/** Row-level next action for active verify session lines. */
export function resolvePackingVerifyItemRowNextAction(
  item: PackingVerifyItemFocus,
): PackingVerifyItemRowNextAction | null {
  const href = packingVerifyItemAnchor(item.id);

  if (isPackingVerifyIssueStatus(item.status)) {
    return { label: "Review flagged line", href, tone: "urgent" };
  }

  if (item.allergenCheckStatus === "PENDING") {
    return { label: "Check allergen", href, tone: "urgent" };
  }

  if (item.labelCheckStatus === "PENDING") {
    return { label: "Check label", href, tone: "urgent" };
  }

  if (item.status === "PENDING" && item.verifiedQuantity < item.expectedQuantity) {
    return { label: "Verify line", href, tone: "normal" };
  }

  return null;
}
