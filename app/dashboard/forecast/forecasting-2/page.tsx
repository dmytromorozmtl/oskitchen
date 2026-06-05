import Link from "next/link";

import { Forecasting2Panel } from "@/components/ai/forecasting-2-panel";
import { PlanGate } from "@/components/plans/plan-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadForecasting2Snapshot } from "@/services/ai/forecasting";

export const metadata = {
  title: "Forecasting 2.0",
  description: "90-day demand forecast with weather and holiday adjustments.",
};

export default async function Forecasting2Page() {
  const { dataUserId } = await getTenantActor();
  const snapshot = await loadForecasting2Snapshot(dataUserId);

  return (
    <PlanGate userId={dataUserId} feature="forecasting" title="Forecasting 2.0">
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Forecasting 2.0"
          description="90-day order and revenue projection from trailing history — adjusted for weather proxies and holiday calendar windows."
          actions={
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/forecast">Forecast hub</Link>
            </Button>
          }
        />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Estimate only.</span> Deterministic projection — not a guarantee.
        </p>
        <Forecasting2Panel snapshot={snapshot} />
      </div>
    </PlanGate>
  );
}
