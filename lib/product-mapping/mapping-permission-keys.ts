import type { PermissionKey } from "@/lib/permissions/permissions";
import type { ProductMappingCapability } from "@/lib/product-mapping/mapping-permissions";

const READ_CAPABILITIES = new Set<ProductMappingCapability>([
  "mapping.view",
  "mapping.audit",
]);

/** Map product-mapping capabilities to canonical workspace permission keys. */
export function workspacePermissionForMappingCapability(
  capability: ProductMappingCapability,
): PermissionKey {
  if (READ_CAPABILITIES.has(capability)) {
    return "integrations.read";
  }
  return "integrations.manage";
}
