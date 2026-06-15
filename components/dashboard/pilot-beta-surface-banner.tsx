import { CapabilityBadge } from "@/components/capabilities/capability-badge";
import type { CapabilityStatus } from "@/lib/capabilities/capability-status";

type PilotBetaSurfaceBannerProps = {
  title: string;
  status?: CapabilityStatus;
  description: string;
};

/** Closed-beta honesty banner for BETA / partner-gated surfaces. */
export function PilotBetaSurfaceBanner({
  title,
  status = "BETA",
  description,
}: PilotBetaSurfaceBannerProps) {
  return (
    <div
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{title}</span>
        <CapabilityBadge status={status} />
      </div>
      <p className="mt-1.5 leading-relaxed">{description}</p>
    </div>
  );
}
