import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OperationalSeverity } from "@/lib/status/status-severity";

const SEVERITY_TONE: Record<OperationalSeverity, string> = {
  none: "border-border/70 bg-muted/30 text-muted-foreground",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-50",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50",
  blocker: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function OperationalStateBadge({
  primary,
  severity = "none",
  hint,
  className,
}: {
  primary: string;
  severity?: OperationalSeverity;
  hint?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Badge variant="outline" className={cn("w-fit rounded-full text-xs font-semibold", SEVERITY_TONE[severity])}>
        {primary}
      </Badge>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
