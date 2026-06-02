import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Honest maturity label for registry BETA integrations — not certified LIVE. */
export function BetaBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      title="BETA — partner credentials and staging smoke required before LIVE claim"
      className={cn(
        "rounded-full border border-amber-500/40 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100",
        className,
      )}
    >
      BETA
    </Badge>
  );
}
