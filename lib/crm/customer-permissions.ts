export type CrmPermission =
  | "crm.read.list"
  | "crm.read.full_profile"
  | "crm.read.allergies_only"
  | "crm.read.delivery_only"
  | "crm.create"
  | "crm.update"
  | "crm.merge"
  | "crm.export"
  | "crm.archive"
  | "crm.consent.edit"
  | "crm.notes.create_internal"
  | "crm.notes.create_kitchen"
  | "crm.notes.create_delivery";

export type CrmActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
};

export function isSuperAdmin(scope: CrmActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canDoCrm(scope: CrmActorScope, permission: CrmPermission): boolean {
  if (isSuperAdmin(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "crm.read.list":
    case "crm.read.full_profile":
    case "crm.update":
    case "crm.create":
    case "crm.export":
      return ["manager", "admin", "sales"].includes(role);
    case "crm.merge":
    case "crm.archive":
      return ["admin"].includes(role);
    case "crm.consent.edit":
      return ["manager", "admin"].includes(role);
    case "crm.notes.create_internal":
    case "crm.notes.create_kitchen":
    case "crm.notes.create_delivery":
      return ["manager", "admin", "sales"].includes(role);
    case "crm.read.allergies_only":
      // Kitchen / packer / production roles can read allergy info on a customer
      // strictly when attached to an order they're working.
      return ["kitchen", "packer", "production", "manager", "admin"].includes(role);
    case "crm.read.delivery_only":
      return ["driver", "dispatcher", "manager", "admin"].includes(role);
  }
}
