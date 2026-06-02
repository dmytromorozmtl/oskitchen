import { UniversalMenuDashboard } from "@/components/dashboard/universal-menu-dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadUniversalMenuDashboard } from "@/services/menu/universal-menu-engine";

export const dynamic = "force-dynamic";

export default async function UniversalMenuPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Universal Menu requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to manage cross-channel menus.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadUniversalMenuDashboard(workspaceId);

  return <UniversalMenuDashboard {...payload} />;
}
