import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_TONE_CLASSES, type StatusTone } from "@/lib/status/status-colors";

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("rounded-full text-xs font-medium", STATUS_TONE_CLASSES[tone], className)}>
      {label}
    </Badge>
  );
}
