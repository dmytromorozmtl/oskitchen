/** Lightweight gate helpers — keep free of ui-era25 / ops validate imports (build-time TDZ). */

export function shouldSuppressEra25ProductConvergenceSurfaces(input: {
  pureOperationalModeEra25Active: boolean;
  era25ConvergenceGovernanceTerminusFreezeComplete?: boolean;
}): boolean {
  return (
    input.pureOperationalModeEra25Active ||
    input.era25ConvergenceGovernanceTerminusFreezeComplete === true
  );
}

export function shouldSuppressEra21CommercialPilotGatePanels(input: {
  pureOperationalModeEra25Active: boolean;
}): boolean {
  return input.pureOperationalModeEra25Active;
}
