export function brandHubPath(): string {
  return "/dashboard/brands";
}

export function brandDetailPath(brandId: string): string {
  return `/dashboard/brands/${brandId}`;
}

export function brandReportsPath(brandId: string): string {
  return `/dashboard/brands/${brandId}/reports`;
}

export function brandTemplatesPath(): string {
  return "/dashboard/brands/templates";
}

export function brandMultiBrandSetupPath(): string {
  return "/dashboard/brands/multi-brand-setup";
}

export function brandAssignmentPath(): string {
  return "/dashboard/brands/assignment";
}

export function brandNewWizardPath(): string {
  return "/dashboard/brands/new";
}
