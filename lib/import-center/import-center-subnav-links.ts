export type ImportCenterSubnavLink = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
  requiresSettings?: boolean;
  requiresUpload?: boolean;
};

export const IMPORT_CENTER_SUBNAV_LINKS: ImportCenterSubnavLink[] = [
  { href: "/dashboard/import-center", label: "Overview", match: "exact" },
  { href: "/dashboard/import-center/upload", label: "Upload", requiresUpload: true },
  { href: "/dashboard/import-center/history", label: "Import history" },
  { href: "/dashboard/import-center/templates", label: "Templates" },
  { href: "/dashboard/import-center/errors", label: "Error reports" },
  { href: "/dashboard/import-center/settings", label: "Settings", requiresSettings: true },
];

export function buildImportCenterSubnavLinks(input: {
  canViewHub: boolean;
  canUpload: boolean;
  canManageSettings: boolean;
}): ImportCenterSubnavLink[] {
  if (!input.canViewHub) return [];
  return IMPORT_CENTER_SUBNAV_LINKS.filter((link) => {
    if (link.requiresSettings && !input.canManageSettings) return false;
    if (link.requiresUpload && !input.canUpload) return false;
    return true;
  });
}
