import type { BetaIntegrationsGovernanceCapstoneContract } from "@/lib/integrations/beta-integrations-governance-capstone-e2e-policy";

export function summarizeBetaIntegrationsGovernanceCapstoneResult(
  input: BetaIntegrationsGovernanceCapstoneContract,
): BetaIntegrationsGovernanceCapstoneContract {
  return { ...input };
}

export function betaIntegrationsGovernanceCapstoneSucceeded(
  summary: BetaIntegrationsGovernanceCapstoneContract,
): boolean {
  return summary.todayFootnoteVisible && summary.navigatedToHealth && summary.liveDodRowCount > 0;
}
