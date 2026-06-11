import type { Metadata } from "next";

import { MultiBrandEnterprisePanel } from "@/components/enterprise/multi-brand-enterprise-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseMultiBrandDashboard } from "@/services/enterprise/multi-brand-service";

export const metadata: Metadata = {
  title: "Multi-Brand Command Center — Enterprise",
  description: "Brand lanes A–D with revenue per brand across your virtual brand portfolio.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseMultiBrandPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Multi-Brand Command Center requires a workspace</CardTitle>
          <CardDescription>
            Configure brands to compare revenue across Brand A, B, C, and D lanes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadEnterpriseMultiBrandDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <MultiBrandEnterprisePanel dashboard={dashboard} />
    </div>
  );
}
