import { Badge } from "@/components/ui/badge";
import type { CapabilityStatus } from "@/lib/capabilities/capability-status";
import { capabilityStatusLabel } from "@/lib/capabilities/capability-copy";

const variant: Record<
  CapabilityStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LIVE: "default",
  BETA: "secondary",
  SETUP_READY: "secondary",
  PARTNER_ACCESS_REQUIRED: "outline",
  PARTIAL: "destructive",
  DEV_ONLY: "outline",
  DESIGN_READY: "outline",
  ROADMAP: "outline",
  NOT_AVAILABLE: "outline",
};

export function CapabilityBadge({ status }: { status: CapabilityStatus }) {
  return (
    <Badge variant={variant[status]} className="rounded-full text-[10px] font-normal">
      {capabilityStatusLabel(status)}
    </Badge>
  );
}
