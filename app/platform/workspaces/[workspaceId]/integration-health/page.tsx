import Link from "next/link";
import { notFound } from "next/navigation";

import { IntegrationHealthReadonly } from "@/components/integrations/integration-health-readonly";
import { PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED } from "@/lib/audit/platform-integration-audit-actions";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { auditLog } from "@/services/audit/audit-service";
import { loadPlatformWorkspaceIntegrationHealth } from "@/services/platform/platform-workspace-integration-health-service";

export default async function PlatformWorkspaceIntegrationHealthPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");

  const data = await loadPlatformWorkspaceIntegrationHealth(workspaceId);
  if (!data) notFound();
  const canReplay = hasPlatformPermission(ctx.permissions, "platform:integrations:repair");

  void auditLog({
    actor: { userId: ctx.userId, email: ctx.email, role: [...ctx.permissions].slice(0, 6).join(",") },
    action: PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED,
    category: "PLATFORM",
    source: "SYSTEM",
    entity: {
      type: "PlatformWorkspaceIntegrationHealth",
      id: workspaceId,
      label: `Read-only integration health · ${data.workspaceName}`,
    },
    metadata: { route: "/platform/workspaces/[workspaceId]/integration-health", workspaceId },
  });

  return (
    <div className="space-y-4">
      <Link href={`/platform/workspaces/${workspaceId}`} className="text-xs text-amber-200/90 hover:underline">
        ← Back to workspace
      </Link>
      <IntegrationHealthReadonly data={data} canReplay={canReplay} />
    </div>
  );
}
