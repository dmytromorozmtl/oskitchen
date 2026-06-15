import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { workspacePermissionForPlaybookCapability } from "@/lib/playbooks/playbook-permission-keys";

import type { PlaybookActorScope, PlaybookCapability } from "@/lib/playbooks/playbook-types";

export type { PlaybookCapability } from "@/lib/playbooks/playbook-types";

const GRANTS: Record<PlaybookCapability, string[]> = {
  "playbooks.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
  ],
  "playbooks.run": ["manager", "admin", "kitchen_lead", "sales"],
  "playbooks.complete_step": [
    "manager", "admin", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales",
  ],
  "playbooks.block_step": [
    "manager", "admin", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales",
  ],
  "playbooks.generate_tasks": ["manager", "admin", "kitchen_lead"],
  "playbooks.create_custom": ["manager", "admin"],
  "playbooks.edit": ["manager", "admin"],
  "playbooks.archive": ["manager", "admin"],
  "playbooks.read.reports": ["manager", "admin", "accountant"],
};

export function isSuperAdminPlaybooks(scope: PlaybookActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canUsePlaybooks(
  scope: PlaybookActorScope,
  cap: PlaybookCapability,
): boolean {
  if (isSuperAdminPlaybooks(scope)) return true;
  if (scope.isOwner) return true;

  const canonical = workspacePermissionForPlaybookCapability(cap);
  if (scope.granted && hasPermission(scope.granted, canonical)) {
    return true;
  }

  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
