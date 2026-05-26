/** Canonical tenant key today — `UserProfile.id` mirrors Supabase auth user id. */
export type UserTenantScope = { userId: string };

export function assertUserTenant(value: string | null | undefined): asserts value is string {
  if (!value?.trim()) throw new Error("User tenant scope missing");
}
