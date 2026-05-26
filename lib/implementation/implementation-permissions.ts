import { isSuperAdminEmail } from "@/lib/platform-owner";

import type {
  ImplementationActorScope,
  ImplementationCapability,
} from "@/lib/implementation/implementation-types";

const GRANTS: Record<ImplementationCapability, string[]> = {
  "implementation.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
  ],
  "implementation.create": ["admin", "manager"],
  "implementation.edit": ["admin", "manager"],
  "implementation.assign": ["admin", "manager"],
  "implementation.complete_checklist": [
    "admin", "manager", "kitchen_lead", "kitchen", "packer", "packing", "driver", "dispatcher", "sales", "accountant",
  ],
  "implementation.generate_tasks": ["admin", "manager"],
  "implementation.run_readiness": ["admin", "manager"],
  "implementation.go_live": ["admin"],
  "implementation.reports": ["admin", "manager", "accountant"],
};

export function isSuperAdminImplementation(scope: ImplementationActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseImplementation(
  scope: ImplementationActorScope,
  cap: ImplementationCapability,
): boolean {
  if (isSuperAdminImplementation(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
