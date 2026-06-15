/** Growth hub capabilities mapped to canonical workspace permission keys. */
export type GrowthCapability = "growth.view" | "growth.manage";

export type GrowthActorScope = {
  userId: string;
  email: string | null;
  isOwner: boolean;
  role: string | null;
  granted: ReadonlySet<import("@/lib/permissions/permissions").PermissionKey>;
  platformBypass: boolean;
};
