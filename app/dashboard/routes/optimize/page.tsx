import { DispatchOptimizationPanel } from "@/components/dashboard/routes/dispatch-optimization-panel";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadDeliveryDispatchOptimizationModel } from "@/services/delivery/delivery-dispatch-optimization-service";

export const metadata = {
  title: "Dispatch optimization",
  description: "Optimize stop order and priority scoring for active delivery routes.",
};

export const dynamic = "force-dynamic";

export default async function DispatchOptimizePage() {
  const { userId } = await requireTenantActor();
  const model = await loadDeliveryDispatchOptimizationModel(userId);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold">Dispatch optimization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Re-score pending stops and preview optimized route order.
        </p>
      </div>
      <DispatchOptimizationPanel model={model} />
    </div>
  );
}
