import { LaunchWizardView } from "@/components/dashboard/launch-wizard/launch-wizard-view";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasLaunchWizardPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
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
    loadWorkspacePermissionPageActor(),
  ]);

  if (!hasLaunchWizardPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="launch_wizard" />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const compact = resolvedSearchParams.mode === "compact";
  const model = await loadLaunchWizardModel(dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
      <LaunchWizardView model={model} compact={compact} />
    </div>
  );
}
