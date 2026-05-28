import { LaunchWizardView } from "@/components/dashboard/launch-wizard/launch-wizard-view";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";

export const dynamic = "force-dynamic";

export default async function LaunchWizardPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const [{ dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    requireWorkspacePermissionActor(),
  ]);

  if (actor.workspaceRole !== "OWNER" && !hasPermission(actor.granted, "workspace.view")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No access</CardTitle>
          <CardDescription>You do not have permission to view the launch wizard.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const compact = resolvedSearchParams.mode === "compact";
  const model = await loadLaunchWizardModel(dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <LaunchWizardView model={model} compact={compact} />
    </div>
  );
}
