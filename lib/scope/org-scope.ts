export type OrgScope = { organizationId: string };

export function assertOrganizationId(value: string | null | undefined): asserts value is string {
  if (!value?.trim()) throw new Error("Organization scope missing");
}
