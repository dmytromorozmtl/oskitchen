import { cn } from "@/lib/utils";

/**
 * DES-22 — POS spacing & typography tokens (no raw `[Npx]` in consumer components).
 *
 * @see lib/pos/pos-raw-px-audit-policy.ts
 * @see tailwind.config.ts spacing.pos-tile / pos-tile-speed / pos-table-min
 */

export const POS_PRODUCT_TILE_MIN_CLASS = "min-h-pos-tile" as const;
export const POS_PRODUCT_TILE_SPEED_CLASS = "min-h-pos-tile-speed" as const;
export const POS_TABLE_MIN_WIDTH_CLASS = "min-w-pos-table-min" as const;

/** Compact POS labels — Tailwind text-xs (12px) instead of text-[10–11px]. */
export const posMetaTextClass = cn("text-xs leading-tight");

/** Badge / status chip copy on POS surfaces. */
export const posBadgeTextClass = cn("text-xs");

/** Secondary caption under POS headings. */
export const posSubcaptionTextClass = cn("text-xs text-muted-foreground");

/** Standard product tile padding. */
export const posTilePaddingClass = cn("p-4");

/** Speed-mode dense tile padding. */
export const posTileSpeedPaddingClass = cn("p-3");

export function posProductTileLayoutClass(speedMode: boolean): string {
  return speedMode
    ? cn(POS_PRODUCT_TILE_SPEED_CLASS, posTileSpeedPaddingClass)
    : cn(POS_PRODUCT_TILE_MIN_CLASS, posTilePaddingClass);
}

/** POS modules audited for zero raw arbitrary px (DES-22). */
export const POS_RAW_PX_CLEANUP_MODULES = [
  "components/pos/handheld-ordering-client.tsx",
  "components/pos/tab-panel.tsx",
  "components/pos/quick-order-buttons.tsx",
  "components/dashboard/pos-manager-override-hero.tsx",
  "components/dashboard/pos-shift-close-history-panel.tsx",
  "components/dashboard/pos/pos-shifts-closeout-flow-proof-panel.tsx",
  "components/dashboard/pos/pos-terminal-manager-audit-flow-proof-panel.tsx",
  "components/dashboard/pos/pos-hub-money-path-flow-proof-panel.tsx",
  "lib/pos/touch-targets.ts",
  "lib/pos/pos-cashier-speed-mode-era19.ts",
] as const;
