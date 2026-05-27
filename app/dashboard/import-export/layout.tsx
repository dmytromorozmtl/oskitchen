import { ImportExportSubnav } from "@/components/dashboard/import-export-subnav";
import { getImportExportPageAccess } from "@/lib/import-export/import-export-page-access";

export default async function ImportExportLayout({ children }: { children: React.ReactNode }) {
  const access = await getImportExportPageAccess();

  const links = [
    { href: "/dashboard/import-export", label: "Overview", match: "exact" as const, visible: access.canViewHub },
    { href: "/dashboard/import-export/import", label: "Import data", visible: access.canImportIngredients },
    { href: "/dashboard/import-export/export", label: "Export data", visible: access.canViewHub },
    { href: "/dashboard/import-export/templates", label: "Templates", visible: access.canViewHub },
    { href: "/dashboard/import-export/imports", label: "Import history", visible: access.canImportIngredients },
    { href: "/dashboard/import-export/exports", label: "Export history", visible: access.canViewHub },
    {
      href: "/dashboard/import-export/validation-errors",
      label: "Validation errors",
      visible: access.canImportIngredients,
    },
    { href: "/dashboard/import-export/settings", label: "Settings", visible: access.canViewHub },
  ].filter((link) => link.visible);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ImportExportSubnav links={links} />
      {children}
    </div>
  );
}
