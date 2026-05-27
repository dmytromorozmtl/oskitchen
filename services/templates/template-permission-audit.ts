import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { TemplateCapability } from "@/lib/templates/template-types";

export async function logTemplatePermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    templateCapability?: TemplateCapability;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "templates.permission_denied",
    entityType: "Template",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      templateCapability: input.templateCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
