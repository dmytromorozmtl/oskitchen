import { PlanGate } from "@/components/plans/plan-gate";
import { IngredientDemandCommandCenter } from "@/components/dashboard/ingredient-demand-command-center";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDemandCommandCenterPayload } from "@/services/purchasing/load-ingredient-demand";

export default async function InventoryDemandPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const initial = await loadDemandCommandCenterPayload(dataUserId);

  return (
    <PlanGate userId={dataUserId} feature="inventory" title="Ingredient demand">
      <div className="mx-auto max-w-6xl">
        <IngredientDemandCommandCenter initial={initial} />
      </div>
    </PlanGate>
  );
}
