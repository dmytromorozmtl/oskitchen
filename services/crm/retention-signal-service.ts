import { suggestRetentionPlaybooks } from "@/services/crm/customer-retention-service";

export { suggestRetentionPlaybooks } from "@/services/crm/customer-retention-service";

export function deriveRetentionSignals(atRiskScore: number | null | undefined) {
  return {
    playbooks: suggestRetentionPlaybooks(atRiskScore),
    churnRiskPlaceholder: atRiskScore ?? null,
  };
}
