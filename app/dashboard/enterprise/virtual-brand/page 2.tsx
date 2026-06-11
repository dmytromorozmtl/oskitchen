import type { Metadata } from "next";

import { VirtualBrandManagerPanel } from "@/components/enterprise/virtual-brand-manager-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadVirtualBrandManagerDashboard } from "@/services/enterprise/virtual-brand-service";

export const metadata: Metadata = {
  title: "Virtual Brand Manager — Enterprise",
  description: "Create a virtual brand in five minutes with templates, menu clone, and storefront provisioning.",
};

export const dynamic = "force-dynamic";

export default async function VirtualBrandManagerPage({
  searchParams,
}: {
  searchParams?: Promise<{ template?: string }>;
}) {
  const { workspaceId } = await getTenantActor();
  const template = (await searchParams)?.template;

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Virtual Brand Manager requires a workspace</CardTitle>
          <CardDescription>
            Complete onboarding to provision ghost, cloud, and delivery-first virtual brands.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadVirtualBrandManagerDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <VirtualBrandManagerPanel dashboard={dashboard} initialTemplate={template} />
    </div>
  );
}
