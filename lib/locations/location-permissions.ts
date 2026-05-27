/**
 * Workspace-level Locations RBAC is still pending; we keep the contract
 * narrow so we can graduate without changing UI.
 */
export type LocationPermission =
  | "location.read"
  | "location.create"
  | "location.update"
  | "location.archive"
  | "location.assign"
  | "location.manage_hours"
  | "location.manage_fulfillment"
  | "location.manage_inventory"
  | "location.manage_orders"
  | "location.view_reports";

export type LocationActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
  /** When set, this user can only see / mutate these location ids. Empty / undefined = all. */
  allowedLocationIds?: readonly string[] | null;
};

export function isSuperAdmin(scope: LocationActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canDoLocation(scope: LocationActorScope, permission: LocationPermission): boolean {
  if (isSuperAdmin(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  switch (permission) {
    case "location.read":
    case "location.view_reports":
      return Boolean(role);
    case "location.update":
    case "location.manage_hours":
    case "location.manage_fulfillment":
    case "location.manage_inventory":
    case "location.manage_orders":
    case "location.assign":
      return ["manager", "dispatcher", "admin"].includes(role);
    case "location.create":
    case "location.archive":
      return ["admin"].includes(role);
  }
}

/** Returns either a list of allowed locationIds or null = no scoping. */
export function visibleLocationIds(scope: LocationActorScope): readonly string[] | null {
  if (isSuperAdmin(scope) || scope.isOwner) return null;
  return scope.allowedLocationIds ?? [];
}
