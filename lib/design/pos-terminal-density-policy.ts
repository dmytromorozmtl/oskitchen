/**
 * Blueprint P1-61 — POS terminal density (44px targets, contrast, spacing, prominent checkout).
 *
 * @see components/dashboard/pos-terminal-client.tsx
 * @see components/dashboard/pos-terminal/receipt-panel.tsx
 * @see lib/pos/touch-targets.ts
 */

import { cn } from "@/lib/utils";
import {
  POS_WCAG_FLOOR_PX,
  posCheckoutButtonClass,
  posTouchCompactClass,
  posTouchTileClass,
} from "@/lib/pos/touch-targets";

export const POS_TERMINAL_DENSITY_POLICY_ID = "pos-terminal-density-p1-61-v1" as const;

export const POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS = [
  "touch_targets_44px",
  "contrast",
  "spacing",
  "checkout_prominent",
] as const;

export type PosTerminalDensityElement = (typeof POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS)[number];

export const POS_TERMINAL_DENSITY_MIN_TOUCH_PX = POS_WCAG_FLOOR_PX;

export const POS_TERMINAL_DENSITY_TERMINAL_MODULE =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const POS_TERMINAL_DENSITY_RECEIPT_MODULE =
  "components/dashboard/pos-terminal/receipt-panel.tsx" as const;

export const POS_TERMINAL_DENSITY_CART_MODULE =
  "components/dashboard/pos-terminal/cart-panel.tsx" as const;

export const POS_TERMINAL_DENSITY_TOUCH_TARGETS_MODULE = "lib/pos/touch-targets.ts" as const;

/** High-contrast product copy on register tiles. */
export const POS_TERMINAL_DENSITY_PRODUCT_TITLE_CLASS =
  "line-clamp-2 font-semibold leading-snug text-foreground" as const;

export const POS_TERMINAL_DENSITY_PRODUCT_PRICE_CLASS =
  "mt-auto pt-2 font-semibold tabular-nums text-foreground" as const;

export const POS_TERMINAL_DENSITY_AMOUNT_DUE_CLASS =
  "text-lg font-semibold tabular-nums text-foreground" as const;

/** Product grid spacing — gap-3 with scroll padding for sticky checkout. */
export const POS_TERMINAL_DENSITY_PRODUCT_GRID_CLASS =
  "grid flex-1 gap-3 overflow-y-auto pb-24" as const;

export const POS_TERMINAL_DENSITY_PRODUCT_TILE_SURFACE_CLASS =
  "flex flex-col rounded-2xl border border-border/80 bg-card text-left shadow-sm transition hover:border-primary/40 hover:shadow-md" as const;

/** Primary checkout CTA — oversized, high contrast, sticky in speed mode. */
export const POS_TERMINAL_DENSITY_CHECKOUT_BUTTON_CLASS = cn(
  posCheckoutButtonClass,
  "bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
);

export const POS_TERMINAL_DENSITY_CHECKOUT_SPEED_CLASS =
  "min-h-16 h-16 text-xl" as const;

export const POS_TERMINAL_DENSITY_CHECKOUT_WRAPPER_CLASS =
  "sticky bottom-2 z-10 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none" as const;

export const POS_TERMINAL_DENSITY_CHECKOUT_TEST_ID = "pos-complete-sale" as const;

export const POS_TERMINAL_DENSITY_AUDIT_SCRIPT =
  "scripts/audit-pos-terminal-density.ts" as const;

export const POS_TERMINAL_DENSITY_NPM_SCRIPT = "audit:pos-terminal-density" as const;

export const POS_TERMINAL_DENSITY_UNIT_TEST =
  "tests/unit/pos-terminal-density.test.ts" as const;

export const POS_TERMINAL_DENSITY_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export {
  posTouchCompactClass,
  posTouchTileClass,
  POS_WCAG_FLOOR_PX,
};
