import { Badge } from "@/components/ui/badge";
import { formatMaintenanceModeProgressLabel } from "@/lib/commercial/maintenance-mode-ui-era24";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceStatusBadges({ slice, isCompact }: MaintenancePanelContext) {
  if (isCompact) {
    return <p className="text-sm font-medium">{formatMaintenanceModeProgressLabel(slice)}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="rounded-full font-mono text-[10px]">path complete</Badge>
      <Badge variant="outline" className="rounded-full font-mono text-[10px]">{slice.maintenanceModeMilestone.replaceAll("_", " ")}</Badge>
      <Badge variant="outline" className="rounded-full text-[10px]">era24 maintenance mode</Badge>
      {slice.pureOperationalModeEra25Active ? (
        <Badge variant="default" className="rounded-full font-mono text-[10px]">era25 pure ops</Badge>
      ) : slice.sustainedOpsConvergenceReady ? (
        <Badge variant="secondary" className="rounded-full font-mono text-[10px]">era25 sustained ops</Badge>
      ) : null}
      {slice.improvementLoopOverdue + slice.productEvolutionOverdue > 0 ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">{slice.improvementLoopOverdue + slice.productEvolutionOverdue} upstream overdue</Badge>
      ) : null}
      {!slice.maintenanceModeIntegrityPassed ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">Maintenance mode blocked</Badge>
      ) : null}
      {!slice.productEvolutionIntegrityPassed ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">Product evolution integrity FAIL</Badge>
      ) : null}
    </div>
  );
}
