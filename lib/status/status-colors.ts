import type { OrderStatus } from "@prisma/client";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const ORDER_TONE: Record<OrderStatus, StatusTone> = {
  PENDING: "neutral",
  CONFIRMED: "info",
  PREPARING: "info",
  READY: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function toneForOrderStatus(status: OrderStatus | string): StatusTone {
  if (status in ORDER_TONE) return ORDER_TONE[status as OrderStatus];
  return "neutral";
}

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-border/70 bg-muted/40 text-foreground",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-50",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
};
