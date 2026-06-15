import type { BetaIntegrationsGovernanceContract } from "@/lib/integrations/beta-integrations-governance-e2e-policy";

export function summarizeBetaIntegrationsGovernanceResult(input: {
  betaEnvPanelVisible: boolean;
  liveDodPanelVisible: boolean;
  betaEnvRowCount: number;
  liveDodRowCount: number;
  expectedCount: number;
}): BetaIntegrationsGovernanceContract {
  return { ...input };
}

export function betaIntegrationsGovernanceSucceeded(
  summary: BetaIntegrationsGovernanceContract,
): boolean {
  return summary.betaEnvPanelVisible && summary.liveDodPanelVisible && summary.betaEnvRowCount > 0;
}
