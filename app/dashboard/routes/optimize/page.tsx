import Link from "next/link";

import { DispatchOptimizationPanel } from "@/components/dashboard/routes/dispatch-optimization-panel";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDeliveryDispatchOptimizationModel } from "@/services/delivery/delivery-dispatch-optimization-service";

export default async function RouteOptimizePage({
  searchParams,
}: {
  searchParams: Promise<{ routeId?: string }>;
}) {
  const { routeId } = await searchParams;
  const { userId } = await getTenantActor();
  const model = await loadDeliveryDispatchOptimizationModel(userId, routeId ?? null);

  return (
    <PlanGate userId={userId} feature="delivery_routes" title="Dispatch optimization">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dispatch optimization</h1>
            <p className="text-sm text-muted-foreground">
              Olo-parity stop ordering — delivery window priority, nearest-neighbor routing, optional
              Google Routes API.
            </p>
          </div>
          <Link href="/dashboard/routes" className="text-sm text-primary hover:underline">
            ← Routes
          </Link>
        </div>

        <DispatchOptimizationPanel model={model} />
      </div>
    </PlanGate>
  );
}
