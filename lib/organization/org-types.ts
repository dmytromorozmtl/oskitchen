/** Typed identifiers for multi-tenant hierarchy — mirrors Prisma models `Organization`, `Workspace`, `Brand`, `Location`. */
export type OrganizationId = string;
export type WorkspaceId = string;
export type BrandId = string;
export type LocationId = string;

export type FoodOpsHierarchy = {
  organizationId: OrganizationId | null;
  workspaceId: WorkspaceId | null;
  brands: { id: BrandId; name: string; slug: string }[];
  locations: { id: LocationId; name: string; slug: string | null }[];
};
