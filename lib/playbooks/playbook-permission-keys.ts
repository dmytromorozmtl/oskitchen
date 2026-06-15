import type { PermissionKey } from "@/lib/permissions/permissions";
import type { PlaybookCapability } from "@/lib/playbooks/playbook-types";

const PARTICIPANT_CAPABILITIES = new Set<PlaybookCapability>([
  "playbooks.view",
  "playbooks.run",
  "playbooks.complete_step",
  "playbooks.block_step",
]);

/** Map playbook capabilities to canonical workspace permission keys. */
export function workspacePermissionForPlaybookCapability(
  capability: PlaybookCapability,
): PermissionKey {
  if (capability === "playbooks.read.reports") {
    return "reports.read.operations";
  }
  if (PARTICIPANT_CAPABILITIES.has(capability)) {
    return "playbooks.participate";
  }
  return "playbooks.manage";
}
