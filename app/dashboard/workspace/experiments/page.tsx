import Link from "next/link";

import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getWorkspaceExperimentRollup } from "@/services/storefront/workspace-experiment-rollup-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WorkspaceExperimentsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId: dataUserId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { workspaceId: true },
  });

  if (!sf?.workspaceId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace experiments</CardTitle>
            <CardDescription>Link this storefront to a workspace to see agency rollup.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const rollup = await getWorkspaceExperimentRollup(sf.workspaceId, 7);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Workspace experiments</h1>
        <p className="mt-2 text-muted-foreground">
          Agency rollup — SRM, GA4 parity, edge SLO across all storefronts in the workspace.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Store rollup (7d)</CardTitle>
          <CardDescription>{rollup.length} active storefront(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Store</th>
                <th className="py-2 pr-4">Experiment</th>
                <th className="py-2 pr-4">Decision</th>
                <th className="py-2 pr-4">Lift</th>
                <th className="py-2 pr-4">SRM</th>
                <th className="py-2 pr-4">GA4 parity</th>
                <th className="py-2 pr-4">Edge SLO</th>
              </tr>
            </thead>
            <tbody>
              {rollup.map((row) => (
                <tr key={row.storefrontId} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">{row.storeSlug}</td>
                  <td className="py-2 pr-4">{row.experimentEnabled ? "On" : "Off"}</td>
                  <td className="py-2 pr-4">{row.decision}</td>
                  <td className="py-2 pr-4">
                    {row.liftPp > 0 ? "+" : ""}
                    {row.liftPp} pp
                  </td>
                  <td className="py-2 pr-4">{row.srmWarn ? "⚠" : "OK"}</td>
                  <td className="py-2 pr-4">{row.parityStatus}</td>
                  <td className="py-2 pr-4">{row.edgeSloOk ? "OK" : "SLO miss"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/storefront/settings/experiments">Per-store experiment settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
