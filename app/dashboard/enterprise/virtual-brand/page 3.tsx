import type { Metadata } from "next";

import { VirtualBrandManagerPanel } from "@/components/enterprise/virtual-brand-manager-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadVirtualBrandManagerDashboard } from "@/services/enterprise/virtual-brand-service";

export const metadata: Metadata = {
  title: "Virtual Brand Manager — Enterprise",
  description: "Provision and manage virtual brand lanes across your portfolio.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseVirtualBrandPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Virtual Brand Manager requires a workspace</CardTitle>
          <CardDescription>Provision virtual brands and compare lane performance.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadVirtualBrandManagerDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <VirtualBrandManagerPanel dashboard={dashboard} />
    </div>
  );
}
