/**
 * Internal design tokens — prefer Tailwind utilities in UI; use these for programmatic styling
 * or documentation alignment across modules.
 */
export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadow = {
  card: "0 1px 2px rgb(0 0 0 / 0.05)",
  lifted: "0 4px 14px rgb(0 0 0 / 0.08)",
} as const;

export const layout = {
  /** Default max width for dashboard content inside PageShell */
  contentMaxClass: "max-w-6xl",
  sidebarWidthPx: 256,
} as const;
