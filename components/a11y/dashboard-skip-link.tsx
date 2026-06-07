import { cn } from "@/lib/utils";
import { zFloatingClass } from "@/lib/design/z-index-scale";
import {
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SKIP_LINK_LABEL,
} from "@/lib/accessibility/skip-link-main-landmark-policy";

/** First-focus skip link — jumps past dashboard header chrome to `<main>`. */
export function DashboardSkipLink() {
  return (
    <a
      href={`#${DASHBOARD_MAIN_LANDMARK_ID}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4",
        zFloatingClass,
        "focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring",
      )}
      data-testid="dashboard-skip-link"
    >
      {DASHBOARD_SKIP_LINK_LABEL}
    </a>
  );
}
