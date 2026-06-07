import type { OfflineSyncState } from "@/lib/pos/offline-sync";
import type { OfflineModeUiSeverity } from "@/lib/pos/offline-mode-ui-indicator-policy";

export type OfflineModeUiSnapshot = {
  online: boolean;
  queuedCount: number;
  conflictCount: number;
  syncState: OfflineSyncState;
};

export type OfflineModeUiState = {
  severity: OfflineModeUiSeverity;
  visible: boolean;
  showQueueBadge: boolean;
  showSyncAnimation: boolean;
  queueBadgeCount: number;
  statusLabel: string;
  queueBadgeAriaLabel: string;
};

export function resolveOfflineModeUiSeverity(input: OfflineModeUiSnapshot): OfflineModeUiSeverity {
  if (input.syncState === "syncing") return "syncing";
  if (input.conflictCount > 0 || input.syncState === "error") return "danger";
  if (!input.online || input.queuedCount > 0) return "warning";
  return "idle";
}

export function shouldShowOfflineModeUi(
  input: OfflineModeUiSnapshot,
  showWhenIdle = false,
): boolean {
  return (
    showWhenIdle ||
    !input.online ||
    input.queuedCount > 0 ||
    input.conflictCount > 0 ||
    input.syncState === "syncing"
  );
}

export function buildOfflineModeUiState(
  input: OfflineModeUiSnapshot,
  options?: { showWhenIdle?: boolean; statusLabel?: string },
): OfflineModeUiState {
  const severity = resolveOfflineModeUiSeverity(input);
  const visible = shouldShowOfflineModeUi(input, options?.showWhenIdle ?? false);
  const queueBadgeCount = input.queuedCount + input.conflictCount;
  const showQueueBadge = queueBadgeCount > 0 || !input.online;
  const showSyncAnimation = input.syncState === "syncing";

  const statusLabel =
    options?.statusLabel ??
    (input.syncState === "syncing"
      ? "Syncing offline sales…"
      : input.conflictCount > 0
        ? `${input.conflictCount} offline sale conflict(s) need review`
        : !input.online && input.queuedCount > 0
          ? `Offline — ${input.queuedCount} sale(s) queued for sync`
          : !input.online
            ? "Offline — sales queue when enabled"
            : input.queuedCount > 0
              ? `${input.queuedCount} sale(s) waiting to sync`
              : "Online — offline queue ready");

  const queueBadgeAriaLabel =
    input.conflictCount > 0
      ? `${input.conflictCount} offline sale conflict(s), ${input.queuedCount} queued`
      : !input.online
        ? `Offline, ${input.queuedCount} sale(s) queued`
        : `${input.queuedCount} sale(s) queued for sync`;

  return {
    severity,
    visible,
    showQueueBadge,
    showSyncAnimation,
    queueBadgeCount,
    statusLabel,
    queueBadgeAriaLabel,
  };
}

export function offlineModeStatusBarToneClass(severity: OfflineModeUiSeverity): string {
  switch (severity) {
    case "danger":
      return "border-rose-300/70 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100";
    case "warning":
      return "border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
    case "syncing":
      return "border-sky-300/70 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100";
    default:
      return "border-emerald-300/70 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
  }
}

export function offlineModeQueueBadgeToneClass(severity: OfflineModeUiSeverity): string {
  switch (severity) {
    case "danger":
      return "bg-rose-600 text-white dark:bg-rose-500";
    case "warning":
      return "bg-amber-600 text-white dark:bg-amber-500";
    case "syncing":
      return "bg-sky-600 text-white dark:bg-sky-500";
    default:
      return "bg-emerald-600 text-white dark:bg-emerald-500";
  }
}

export function offlineModeSyncAnimationClass(severity: OfflineModeUiSeverity): string {
  const base = "h-4 w-4 shrink-0 motion-safe:animate-spin";
  if (severity === "syncing") return `${base} text-sky-600 dark:text-sky-400`;
  return base;
}

export function formatOfflineModeQueueBadgeCount(count: number): string {
  if (count <= 0) return "·";
  if (count > 99) return "99+";
  return String(count);
}
