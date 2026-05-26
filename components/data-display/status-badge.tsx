import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "secondary",
  CANCELLED: "outline",
  FAILED: "destructive",
  ERROR: "destructive",
  CONFIRMED: "default",
  PREPARING: "default",
  READY: "default",
  PENDING: "outline",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const variant = tone[status] ?? "outline";
  const label = status.replace(/_/g, " ").toLowerCase();
  return (
    <Badge variant={variant} className={cn("rounded-full capitalize", className)}>
      {label}
    </Badge>
  );
}
