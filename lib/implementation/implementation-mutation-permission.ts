import type { PermissionKey } from "@/lib/permissions/permissions";
import type { ImplementationCapability } from "@/lib/implementation/implementation-types";

const VIEW_CAPABILITIES = new Set<ImplementationCapability>([
  "implementation.view",
  "implementation.reports",
]);

/** Map implementation capabilities to canonical workspace permissions for server gates. */
export function workspacePermissionForImplementationCapability(
  capability: ImplementationCapability,
): PermissionKey {
  if (VIEW_CAPABILITIES.has(capability)) {
    return "workspace.view";
  }
  if (capability === "implementation.go_live") {
    return "go-live.manage";
  }
  return "go-live.manage";
}
