/**
 * Launch Wizard — Maintenance mode integrity convergence.
 */
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";

export const LAUNCH_WIZARD_MAINTENANCE_MODE_ERA36_POLICY_ID =
  "era36-launch-wizard-maintenance-mode-v1" as const;

export const LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR = "#launch-wizard-maintenance-mode" as const;

export type LaunchWizardMaintenanceModeSlice = {
  policyId: typeof LAUNCH_WIZARD_MAINTENANCE_MODE_ERA36_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  maintenanceModeIntegrityFailed: boolean;
  productEvolutionIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postProductEvolutionOrchestratorCommand: string;
};

export function buildLaunchWizardMaintenanceModeSlice(
  maintenanceMode: MaintenanceModeUiSlice | null,
): LaunchWizardMaintenanceModeSlice | null {
  if (!maintenanceMode) return null;

  const rhythmCount = maintenanceMode.rhythms.length;
  const attentionCount = maintenanceMode.overdueCount + maintenanceMode.dueSoonCount;

  return {
    policyId: LAUNCH_WIZARD_MAINTENANCE_MODE_ERA36_POLICY_ID,
    visible: true,
    goDecision: maintenanceMode.goDecision,
    customerName: maintenanceMode.customerName,
    maintenanceModeIntegrityFailed: !maintenanceMode.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityFailed: !maintenanceMode.productEvolutionIntegrityPassed,
    progressLabel:
      attentionCount > 0
        ? `${attentionCount}/${rhythmCount} rhythms need attention`
        : `${maintenanceMode.healthyCount}/${rhythmCount} healthy`,
    launchWizardHref: maintenanceMode.launchWizardHref,
    todayHref: maintenanceMode.todayHref,
    platformOpsHref: maintenanceMode.platformOpsHref,
    integrityValidateCommand: maintenanceMode.integrityValidateCommand,
    postProductEvolutionOrchestratorCommand: maintenanceMode.postProductEvolutionOrchestratorCommand,
  };
}

export function launchWizardMaintenanceModeHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR}`;
}
