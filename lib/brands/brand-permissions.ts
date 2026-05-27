/**
 * Future: replace with workspace role + brand assignment matrix.
 * Today: owners manage brands; persisted SUPER_ADMIN platformBypass bypasses checks.
 */
export type BrandActorScope = {
  isWorkspaceOwner: boolean;
  email?: string | null;
  platformBypass?: boolean;
  /** When staff brand-scoping ships, pass assigned brand ids here. */
  assignedBrandIds?: readonly string[] | null;
};

export function canViewAllBrands(scope: BrandActorScope): boolean {
  if (scope.platformBypass) return true;
  return scope.isWorkspaceOwner;
}

export function canManageBrands(scope: BrandActorScope): boolean {
  return canViewAllBrands(scope);
}

export function canManageSingleBrand(
  scope: BrandActorScope & { brandId: string },
): boolean {
  if (scope.platformBypass) return true;
  if (scope.isWorkspaceOwner) return true;
  if (scope.assignedBrandIds?.includes(scope.brandId)) return true;
  return false;
}
