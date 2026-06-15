import dynamic from "next/dynamic";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";
import { MaintenanceCommercialPilotAbsoluteEndPanel } from "@/components/dashboard/maintenance/platform/maintenance-commercial-pilot-absolute-end-panel";
import { MaintenanceEngineeringPathTerminusPanel } from "@/components/dashboard/maintenance/platform/maintenance-engineering-path-terminus-panel";
import { MaintenancePostTerminusSteadyStatePanel } from "@/components/dashboard/maintenance/platform/maintenance-post-terminus-steady-state-panel";

const MaintenanceLinearPathPanel = dynamic(
  () =>
    import("@/components/dashboard/maintenance/platform/maintenance-linear-path-panel").then(
      (m) => m.MaintenanceLinearPathPanel,
    ),
  { loading: () => null },
);

export function MaintenancePlatformSections(ctx: MaintenancePanelContext) {
  if (ctx.isCompact || !ctx.isPlatform) return null;
  return (
    <>
      <MaintenanceEngineeringPathTerminusPanel {...ctx} />
      <MaintenancePostTerminusSteadyStatePanel {...ctx} />
      <MaintenanceCommercialPilotAbsoluteEndPanel {...ctx} />
      <MaintenanceLinearPathPanel {...ctx} />
    </>
  );
}
