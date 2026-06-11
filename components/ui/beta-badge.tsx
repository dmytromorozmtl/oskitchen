import { Badge } from "@/components/ui/badge";
import {
  BETA_BADGE_DEFAULT_TITLE,
  BETA_BADGE_LABEL,
  BETA_BADGE_VARIANT,
  COMING_SOON_BADGE_DEFAULT_TITLE,
  COMING_SOON_BADGE_LABEL,
  COMING_SOON_BADGE_VARIANT,
  MATURITY_BADGE_BASE_CLASS,
  NEW_BADGE_DEFAULT_TITLE,
  NEW_BADGE_LABEL,
  NEW_BADGE_VARIANT,
} from "@/lib/design/beta-preview-badge-system-policy";
import { cn } from "@/lib/utils";

/** Certified LIVE integration — OAuth, webhooks, and KDS path verified in CI. */
export function LiveBadge({
  className,
  title = "LIVE — production integration with webhook → KDS and status sync",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge
      variant="secondary"
      title={title}
      className={cn(
        MATURITY_BADGE_BASE_CLASS,
        "border border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
        className,
      )}
    >
      LIVE
    </Badge>
  );
}

/** BETA — amber maturity label (P1-69). */
export function BetaBadge({
  className,
  title = BETA_BADGE_DEFAULT_TITLE,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge variant={BETA_BADGE_VARIANT} title={title} className={cn(MATURITY_BADGE_BASE_CLASS, className)}>
      {BETA_BADGE_LABEL}
    </Badge>
  );
}

/** COMING SOON — gray maturity label (P1-69). */
export function ComingSoonBadge({
  className,
  title = COMING_SOON_BADGE_DEFAULT_TITLE,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge
      variant={COMING_SOON_BADGE_VARIANT}
      title={title}
      className={cn(MATURITY_BADGE_BASE_CLASS, className)}
    >
      {COMING_SOON_BADGE_LABEL}
    </Badge>
  );
}

/** NEW — teal maturity label (P1-69). */
export function NewBadge({
  className,
  title = NEW_BADGE_DEFAULT_TITLE,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge variant={NEW_BADGE_VARIANT} title={title} className={cn(MATURITY_BADGE_BASE_CLASS, className)}>
      {NEW_BADGE_LABEL}
    </Badge>
  );
}

/** Nav and module preview — visible with “Show all modules”; not production-ready. */
export function PreviewBadge({
  className,
  title = "Preview — capabilities may change before general availability",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge variant="preview" title={title} className={cn(MATURITY_BADGE_BASE_CLASS, className)}>
      Preview
    </Badge>
  );
}

/** Placeholder routes — UI shell without operational backend. */
export function PlaceholderBadge({
  className,
  title = "Placeholder — do not promise to customers until capability matrix shows BETA or LIVE",
}: {
  className?: string;
  title?: string;
}) {
  return <ComingSoonBadge className={className} title={title} />;
}

/** Internal / GTM-only surfaces — hidden from default pilot nav. */
export function InternalBadge({
  className,
  title = "Internal — platform or CS tooling; not a customer-facing promise",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        MATURITY_BADGE_BASE_CLASS,
        "border border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
        className,
      )}
    >
      Internal
    </Badge>
  );
}

/** Sidebar nav maturity labels from `navMaturityBadgeForHref`. */
export function NavMaturityBadge({ label }: { label: string | null }) {
  switch (label) {
    case "Beta":
      return <BetaBadge />;
    case "Preview":
      return <PreviewBadge />;
    case "Placeholder":
      return <ComingSoonBadge />;
    case "New":
      return <NewBadge />;
    case "Internal":
      return <InternalBadge />;
    default:
      return null;
  }
}
