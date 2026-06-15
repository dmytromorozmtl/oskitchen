export type PosCheckoutStatusKind = "success" | "error" | "info";

export type PosCheckoutStatus = {
  kind: PosCheckoutStatusKind;
  text: string;
};

export function posCheckoutStatusClassName(kind: PosCheckoutStatusKind): string {
  if (kind === "error") {
    return "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive";
  }
  if (kind === "success") {
    return "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200";
  }
  return "rounded-xl border border-border/70 bg-muted px-3 py-2 text-sm text-foreground";
}

/** Heuristic for legacy string-only messages during checkout validation. */
export function inferPosCheckoutStatusKind(text: string): PosCheckoutStatusKind {
  const lower = text.toLowerCase();
  if (
    lower.includes("complete") ||
    lower.includes("synced") ||
    lower.includes("captured") ||
    lower.includes("ready — tap card")
  ) {
    return "success";
  }
  if (
    lower.includes("permission") ||
    lower.includes("denied") ||
    lower.includes("reconnect") ||
    lower.includes("invalid") ||
    lower.includes("failed") ||
    lower.includes("before checking out") ||
    lower.includes("add at least")
  ) {
    return "error";
  }
  return "info";
}

export function toPosCheckoutStatus(text: string, kind?: PosCheckoutStatusKind): PosCheckoutStatus {
  return { kind: kind ?? inferPosCheckoutStatusKind(text), text };
}
