import type { PermissionKey } from "@/lib/permissions/permissions";
import type { GoLiveCapability } from "@/lib/go-live/go-live-permissions";

const VIEW_CAPABILITIES = new Set<GoLiveCapability>(["go-live.view"]);
const UNLOCK_CAPABILITIES = new Set<GoLiveCapability>(["go-live.unlock"]);

/** Map a go-live capability to the canonical workspace permission for server gates. */
export function workspacePermissionForGoLiveCapability(
  capability: GoLiveCapability,
): PermissionKey {
  if (VIEW_CAPABILITIES.has(capability)) {
    return "workspace.view";
  }
  if (UNLOCK_CAPABILITIES.has(capability)) {
    return "go-live.unlock";
  }
  return "go-live.manage";
}
