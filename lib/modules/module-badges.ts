import type { ModuleKey } from "@/lib/modules/module-registry";

export type ModuleBadgeVariant = "dot" | "count" | "beta" | "upgrade" | "soon";

export type ModuleBadgeDescriptor = {
  variant: ModuleBadgeVariant;
  /** Count or short text — keep ≤2 characters in sidebar. */
  value?: string | number;
  title: string;
};

/**
 * Lightweight badge hints keyed for future wiring to summary APIs.
 * Sidebar should pass pre-aggregated `counts` from a parent loader — never query here.
 */
export function moduleBadgeForKey(
  key: ModuleKey,
  counts?: Partial<Record<string, number>>,
): ModuleBadgeDescriptor | null {
  if (key === "copilot") {
    return { variant: "beta", title: "Beta feature" };
  }
  const sync = counts?.failed_sync;
  if (key === "integrations" && sync && sync > 0) {
    return { variant: "count", value: sync > 99 ? "99+" : sync, title: "Channel sync issues" };
  }
  const orders = counts?.orders_attention;
  if (key === "order_hub" && orders && orders > 0) {
    return { variant: "count", value: orders > 99 ? "99+" : orders, title: "Orders need attention" };
  }
  return null;
}
