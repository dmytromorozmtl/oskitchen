import Link from "next/link";

import { IngredientDemandSettingsForm } from "@/components/dashboard/ingredient-demand-settings-form";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadIngredientDemandSettingsForUser } from "@/lib/ingredient-demand/settings";

export default async function IngredientDemandSettingsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const settings = await loadIngredientDemandSettingsForUser(dataUserId);

  return (
    <PlanGate userId={dataUserId} feature="inventory" title="Ingredient demand settings">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Demand settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Global waste buffer, batch rounding, and which demand sources participate in calculations.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/inventory/demand">Back to demand</Link>
          </Button>
        </div>
        <IngredientDemandSettingsForm initial={settings} />
      </div>
    </PlanGate>
  );
}
