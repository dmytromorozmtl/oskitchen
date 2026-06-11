import { ProductCategory } from "@prisma/client";
import { subDays } from "date-fns";

import { AvtConfidenceCard } from "@/components/costing/avt-confidence-card";
import { AvtBreakdownPanel } from "@/components/costing/avt-breakdown-panel";
import { AvtReportTable } from "@/components/costing/avt-report-table";
import { RecipeCoverageCard } from "@/components/costing/recipe-coverage-card";
import { VarianceAlertBanner } from "@/components/costing/variance-alert-banner";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { checkCostingVariances } from "@/services/costing/costing-alert-service";
import { loadAvtReport } from "@/services/costing/avt-report-service";

export default async function AvtReportPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dataUserId } = await getTenantActor();
  const sp = (await searchParams) ?? {};
  const fromRaw = typeof sp.from === "string" ? sp.from : undefined;
  const toRaw = typeof sp.to === "string" ? sp.to : undefined;
  const from = fromRaw ? new Date(fromRaw) : subDays(new Date(), 30);
  const to = toRaw ? new Date(toRaw) : new Date();
  const brandId = typeof sp.brandId === "string" ? sp.brandId : null;
  const locationId = typeof sp.locationId === "string" ? sp.locationId : null;
  const catStr = typeof sp.category === "string" ? sp.category : null;
  const category =
    catStr && (Object.values(ProductCategory) as string[]).includes(catStr) ? (catStr as ProductCategory) : null;
  const confidence = typeof sp.confidence === "string" ? (sp.confidence as "HIGH" | "MEDIUM" | "LOW") : null;

  const [payload, varianceAlerts] = await Promise.all([
    loadAvtReport(dataUserId, { from, to, brandId, locationId, category, confidence }),
    checkCostingVariances(dataUserId),
  ]);

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Actual vs theoretical">
      <div className="space-y-6">
        <VarianceAlertBanner alerts={varianceAlerts} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Actual vs theoretical (foundation)</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{payload.honestyBanner}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AvtConfidenceCard payload={payload} />
          <RecipeCoverageCard payload={payload} />
        </div>
        <AvtReportTable payload={payload} />
        {payload.rows[0] ? (
          <AvtBreakdownPanel
            userId={dataUserId}
            productId={payload.rows[0].productId}
            productName={payload.rows[0].title}
          />
        ) : null}
      </div>
    </PlanGate>
  );
}
