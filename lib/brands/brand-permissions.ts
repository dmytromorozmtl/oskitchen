import { isSuperAdminEmail } from "@/lib/platform-owner";

/**
 * Future: replace with workspace role + brand assignment matrix.
 * Today: owners manage brands; super-admin bypasses all checks.
 */
export function canViewAllBrands(params: {
  isWorkspaceOwner: boolean;
  userEmail: string | null | undefined;
}): boolean {
  if (isSuperAdminEmail(params.userEmail)) return true;
  return params.isWorkspaceOwner;
}

export function canManageBrands(params: {
  isWorkspaceOwner: boolean;
  userEmail: string | null | undefined;
}): boolean {
  return canViewAllBrands(params);
}

export function canManageSingleBrand(params: {
  isWorkspaceOwner: boolean;
  userEmail: string | null | undefined;
  /** When staff brand-scoping ships, pass assigned brand ids here. */
  assignedBrandIds?: readonly string[] | null;
  brandId: string;
}): boolean {
  if (isSuperAdminEmail(params.userEmail)) return true;
  if (params.isWorkspaceOwner) return true;
  if (params.assignedBrandIds?.includes(params.brandId)) return true;
  return false;
}
