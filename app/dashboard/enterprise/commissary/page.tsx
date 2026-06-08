import type { Metadata } from "next";

import { CommissaryEnterprisePanel } from "@/components/enterprise/commissary-enterprise-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseCommissaryDashboard } from "@/services/enterprise/commissary-service";

export const metadata: Metadata = {
  title: "Commissary OS — Enterprise",
  description: "Production, purchasing, delivery, and distribution command center.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseCommissaryPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Commissary OS requires a workspace</CardTitle>
          <CardDescription>
            Configure commissary production, purchasing, delivery, and distribution lanes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadEnterpriseCommissaryDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <CommissaryEnterprisePanel dashboard={dashboard} />
    </div>
  );
}
