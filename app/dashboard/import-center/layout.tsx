import { ImportCenterSubnav } from "@/components/dashboard/import-center/import-center-subnav";
import { requireImportCenterHubPageAccess } from "@/lib/import-center/import-center-page-access";

export default async function ImportCenterLayout({ children }: { children: React.ReactNode }) {
  const access = await requireImportCenterHubPageAccess();
  if (!access.ok) return access.deny;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ImportCenterSubnav links={access.links} />
      {children}
    </div>
  );
}
