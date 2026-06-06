import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import { formatMaintenanceModeProgressLabel, MAINTENANCE_MODE_PLATFORM_ANCHOR } from "@/lib/commercial/maintenance-mode-ui-era24";
import { cn } from "@/lib/utils";
import type { MaintenanceModePanelVariant } from "@/components/dashboard/maintenance/maintenance-mode-shared";
import { MaintenanceGuardrailsFooter } from "@/components/dashboard/maintenance/maintenance-guardrails-footer";
import { MaintenanceHistoryList } from "@/components/dashboard/maintenance/maintenance-history-list";
import { MaintenanceNotificationPanel } from "@/components/dashboard/maintenance/maintenance-notification-panel";
import { MaintenancePlatformSections } from "@/components/dashboard/maintenance/platform/maintenance-platform-sections";
import { MaintenanceStatusBadges } from "@/components/dashboard/maintenance/maintenance-status-badges";

export function MaintenanceModePanel(props: {
  slice: MaintenanceModeUiSlice;
  variant?: MaintenanceModePanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "Maintenance mode — commercial pilot path complete" } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";
  const ctx = { slice, variant, isPlatform, isCompact };
  const cardClass = isPlatform ? "border-slate-700/80 bg-slate-950/30" : "border-slate-200/80 bg-slate-50/20 dark:border-slate-800/60";

  return (
    <Card id={isPlatform ? MAINTENANCE_MODE_PLATFORM_ANCHOR.slice(1) : undefined} className={cn("scroll-mt-24 shadow-sm", cardClass)} data-testid="maintenance-mode-panel">
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-lg", isPlatform && "text-slate-100")}>
            <ShieldCheck className="h-5 w-5 opacity-70" aria-hidden />
            {title}
          </CardTitle>
          <CardDescription className={isPlatform ? "text-slate-400" : undefined}>
            {formatMaintenanceModeProgressLabel(slice)} — era21→era24 path complete; repeat rhythms forever, no Step 13 gates.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        <MaintenanceStatusBadges {...ctx} />
        <MaintenanceNotificationPanel {...ctx} />
        <MaintenanceHistoryList {...ctx} />
        <MaintenancePlatformSections {...ctx} />
        <MaintenanceGuardrailsFooter {...ctx} />
      </CardContent>
    </Card>
  );
}
