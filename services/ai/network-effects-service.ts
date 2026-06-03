import { listBenchmarkCohorts } from "@/lib/ai/benchmark-cohort-seeds";
import { buildNetworkEffectsDashboard } from "@/lib/ai/network-effects-builders";
import type { NetworkEffectsDashboard } from "@/lib/ai/network-effects-types";
import { readBenchmarkPool } from "@/lib/ai/benchmark-network-pool-storage";
import { contributeData, getNetworkStatus } from "@/services/ai/benchmark-network";

export type { NetworkEffectsDashboard } from "@/lib/ai/network-effects-types";

export async function loadNetworkEffectsDashboard(workspaceId: string): Promise<NetworkEffectsDashboard> {
  const [status, pool] = await Promise.all([getNetworkStatus(workspaceId), readBenchmarkPool()]);
  const seedCohorts = listBenchmarkCohorts();

  return buildNetworkEffectsDashboard({
    workspaceId,
    status,
    seedCohorts,
    pool,
  });
}

export async function contributeToNetworkEffects(workspaceId: string): Promise<NetworkEffectsDashboard> {
  await contributeData(workspaceId);
  return loadNetworkEffectsDashboard(workspaceId);
}
