import type { Metadata } from "next";

import { CateringOsPanel } from "@/components/catering/catering-os-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCateringOsDashboard } from "@/services/catering/catering-os-service";

export const metadata: Metadata = {
  title: "Catering OS",
  description: "Events, clients, packing, and routes for catering operators.",
};

export const dynamic = "force-dynamic";

export default async function CateringOsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Catering OS requires a workspace</CardTitle>
          <CardDescription>
            Configure catering quotes to manage events, clients, packing, and delivery routes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadCateringOsDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <CateringOsPanel dashboard={dashboard} />
    </div>
  );
}
