import { cn } from "@/lib/utils";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceNotificationPanel({ slice, isPlatform }: MaintenancePanelContext) {
  if (!slice.nextAttentionRhythm) return null;
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", isPlatform ? "border-amber-800/60 bg-amber-950/20 text-amber-100" : "border-amber-200/70 bg-amber-50/20")}>
      <p className="font-medium">Next rhythm attention</p>
      <p className="mt-1 text-xs opacity-90">{slice.nextAttentionDetail}</p>
    </div>
  );
}
