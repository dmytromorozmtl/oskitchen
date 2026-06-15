import type { PermissionKey } from "./permissions";

export function hasPermission(
  granted: ReadonlySet<PermissionKey>,
  required: PermissionKey,
): boolean {
  return granted.has(required);
}
