import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const badgeBaseClass =
  "rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide";

/** Honest maturity label for BETA integrations and surfaces — not certified LIVE. */
export function BetaBadge({
  className,
  title = "BETA — partner credentials and staging smoke required before LIVE claim",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge
      variant="secondary"
      title={title}
      className={cn(
        badgeBaseClass,
        "border border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
        className,
      )}
    >
      BETA
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
    <Badge
      variant="secondary"
      title={title}
      className={cn(
        badgeBaseClass,
        "border border-violet-500/40 bg-violet-500/10 text-violet-950 dark:text-violet-100",
        className,
      )}
    >
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
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        badgeBaseClass,
        "border-dashed border-muted-foreground/50 bg-muted/30 text-muted-foreground",
        className,
      )}
    >
      Placeholder
    </Badge>
  );
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
        badgeBaseClass,
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
    case "Preview":
      return <PreviewBadge />;
    case "Placeholder":
      return <PlaceholderBadge />;
    case "Internal":
      return <InternalBadge />;
    default:
      return null;
  }
}
