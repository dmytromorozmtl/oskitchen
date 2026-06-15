import { cn } from "@/lib/utils";

export type RoleTileTone = "neutral" | "attention" | "success";

export type RoleNextActionTone = "default" | "urgent";

/** Shared role layout shell — theme tokens only. */
export const dashboardRoleShellClass = cn(
  "mx-auto max-w-6xl space-y-6 bg-transparent text-foreground",
);

/** PageHeader actions on role + leadership routes. */
export const rolePageActionClass = cn(
  "rounded-full border-border/80 bg-background text-foreground hover:bg-muted/60",
);

/** Priority tiles — amber/emerald pairs include explicit dark: variants. */
export function roleTileToneClass(tone: RoleTileTone): string {
  if (tone === "attention") {
    return "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15";
  }
  if (tone === "success") {
    return "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10";
  }
  return "border-border/70 bg-background/80";
}

/** Role accent hero cards — semantic tokens with dark parity. */
export const ROLE_HERO_CARD_CLASS = {
  owner: "border-primary/20 bg-primary/[0.03] dark:border-primary/30 dark:bg-primary/[0.06]",
  manager: "border-blue-500/20 bg-blue-500/[0.03] dark:border-blue-500/30 dark:bg-blue-500/[0.06]",
  chef: "border-orange-500/20 bg-orange-500/[0.03] dark:border-orange-500/30 dark:bg-orange-500/[0.06]",
  cashier:
    "border-emerald-500/20 bg-emerald-500/[0.03] dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]",
  driver:
    "border-violet-500/20 bg-violet-500/[0.03] dark:border-violet-500/30 dark:bg-violet-500/[0.06]",
} as const;

export type RoleAccent = keyof typeof ROLE_HERO_CARD_CLASS;

const ROLE_NEXT_ACTION_DEFAULT_CLASS: Record<RoleAccent, string> = {
  owner: "border-primary/25 bg-primary/[0.04] dark:border-primary/30 dark:bg-primary/[0.08]",
  manager: "border-blue-500/25 bg-blue-500/[0.04] dark:border-blue-500/30 dark:bg-blue-500/[0.08]",
  chef: "border-orange-500/25 bg-orange-500/[0.04] dark:border-orange-500/30 dark:bg-orange-500/[0.08]",
  cashier:
    "border-emerald-500/25 bg-emerald-500/[0.04] dark:border-emerald-500/30 dark:bg-emerald-500/[0.08]",
  driver:
    "border-violet-500/25 bg-violet-500/[0.04] dark:border-violet-500/30 dark:bg-violet-500/[0.08]",
};

/** Next-action hero card on role dashboards. */
export function roleNextActionCardClass(tone: RoleNextActionTone, accent: RoleAccent): string {
  if (tone === "urgent") {
    return "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20";
  }
  return ROLE_NEXT_ACTION_DEFAULT_CLASS[accent];
}
