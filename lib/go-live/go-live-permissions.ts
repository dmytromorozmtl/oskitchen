export type GoLiveActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
};

export type GoLiveCapability =
  | "go-live.view"
  | "go-live.create"
  | "go-live.edit"
  | "go-live.checklist.update"
  | "go-live.simulate"
  | "go-live.approve"
  | "go-live.unlock"
  | "go-live.launch"
  | "go-live.rollback"
  | "go-live.incident.create"
  | "go-live.incident.resolve"
  | "go-live.audit";

const GRANTS: Record<GoLiveCapability, string[]> = {
  "go-live.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
    "integration_manager", "implementation_manager", "support_admin",
    "operations_lead",
  ],
  "go-live.create": ["admin", "manager", "implementation_manager"],
  "go-live.edit": ["admin", "manager", "implementation_manager", "operations_lead"],
  "go-live.checklist.update": [
    "admin", "manager", "implementation_manager", "operations_lead", "kitchen_lead",
    "integration_manager", "support_admin", "accountant",
  ],
  "go-live.simulate": ["admin", "manager", "implementation_manager", "operations_lead"],
  "go-live.approve": ["admin", "manager", "operations_lead"],
  "go-live.unlock": ["admin"],
  "go-live.launch": ["admin", "manager"],
  "go-live.rollback": ["admin", "manager", "operations_lead"],
  "go-live.incident.create": [
    "admin", "manager", "operations_lead", "kitchen_lead", "support_admin",
    "integration_manager", "implementation_manager", "dispatcher",
  ],
  "go-live.incident.resolve": ["admin", "manager", "operations_lead", "support_admin"],
  "go-live.audit": ["admin", "manager", "accountant", "operations_lead"],
};

export function isSuperAdminGoLive(scope: GoLiveActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canUseGoLive(scope: GoLiveActorScope, cap: GoLiveCapability): boolean {
  if (isSuperAdminGoLive(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
