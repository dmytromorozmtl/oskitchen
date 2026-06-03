import { FranchiseSuitePanel } from "@/components/enterprise/franchise-suite-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import type { FranchiseRoyaltyPeriod } from "@/lib/enterprise/franchise-types";
import { loadFranchiseSuiteDashboard } from "@/services/enterprise/franchise-service";

export const metadata = {
  title: "Franchise Suite — Enterprise",
  description: "Brand control, royalties, and menu enforcement for franchise networks.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseFranchisePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { workspaceId } = await getTenantActor();
  const { period: periodParam } = await searchParams;
  const period: FranchiseRoyaltyPeriod = periodParam === "quarter" ? "quarter" : "month";

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Franchise suite requires a workspace</CardTitle>
          <CardDescription>Configure franchises to manage royalties and brand compliance.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadFranchiseSuiteDashboard({ workspaceId, period });

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <FranchiseSuitePanel dashboard={dashboard} />
    </div>
  );
}
