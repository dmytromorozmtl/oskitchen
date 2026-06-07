/**
 * Absolute Final Tasks 116–130 — shared visual polish tokens for P3 features 86–100.
 *
 * @see lib/design/absolute-final-design-full-polish-policy.ts
 * @see components/dashboard/settings/multi-currency-settings-panel.tsx
 */

export const DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-design-polish-tokens-v1" as const;

export const DESIGN_POLISH_CARD_CLASS =
  "rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-shadow hover:shadow-md dark:border-border/60 dark:bg-card/90" as const;

export const DESIGN_POLISH_HERO_BANNER_CLASS =
  "rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm dark:border-primary/30 dark:bg-primary/10" as const;

export const DESIGN_POLISH_ROW_SURFACE_CLASS =
  "rounded-xl border border-border/60 bg-muted/20 transition-colors hover:bg-muted/40 dark:border-border/50 dark:bg-muted/10 dark:hover:bg-muted/20" as const;

export const DESIGN_POLISH_BADGE_ROW_CLASS = "flex flex-wrap gap-2 text-sm" as const;

export const DESIGN_POLISH_FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" as const;

export const DESIGN_POLISH_STRIPE_OK_CLASS = "text-emerald-600 dark:text-emerald-400" as const;

export const DESIGN_POLISH_DARK_MODE_TOKENS = [
  "dark:border-border/60",
  "dark:bg-card/90",
  "dark:text-emerald-400",
  "dark:border-primary/30",
  "dark:bg-primary/10",
  "dark:bg-muted/10",
] as const;

export const DESIGN_POLISH_TOKEN_NAMES = [
  "DESIGN_POLISH_CARD_CLASS",
  "DESIGN_POLISH_HERO_BANNER_CLASS",
  "DESIGN_POLISH_ROW_SURFACE_CLASS",
  "DESIGN_POLISH_BADGE_ROW_CLASS",
] as const;

/** Markdown / internal doc surfaces (tasks 117–118) — mirrors hero + card + dark-mode intent. */
export const DESIGN_POLISH_DOC_MARKER_PREFIX = "design-polish:" as const;

export const DESIGN_POLISH_DOC_HERO_MARKER = "design-polish-hero-banner" as const;

export const DESIGN_POLISH_DOC_STATUS_MARKER = "design-polish-status-card" as const;

export const DESIGN_POLISH_DOC_TIMELINE_MARKER = "design-polish-phase-timeline" as const;

export const DESIGN_POLISH_DOC_DARK_MODE_MARKER = "design-polish-dark-mode-note" as const;

export const DESIGN_POLISH_DOC_REQUIRED_MARKERS = [
  `${DESIGN_POLISH_DOC_MARKER_PREFIX} ${DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}`,
  DESIGN_POLISH_DOC_HERO_MARKER,
  DESIGN_POLISH_DOC_STATUS_MARKER,
  DESIGN_POLISH_DOC_TIMELINE_MARKER,
  DESIGN_POLISH_DOC_DARK_MODE_MARKER,
] as const;

export function docUsesDesignPolishTokens(source: string): boolean {
  return DESIGN_POLISH_DOC_REQUIRED_MARKERS.every((marker) => source.includes(marker));
}
