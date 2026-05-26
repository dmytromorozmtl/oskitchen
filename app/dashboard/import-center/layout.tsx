import { ImportCenterSubnav } from "@/components/dashboard/import-center/import-center-subnav";
import { WorkspacePermissionGate } from "@/components/permissions/workspace-permission-gate";

export default function ImportCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspacePermissionGate
      permission="workspace.settings"
      fallback={
        <div className="mx-auto max-w-6xl rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Import center access restricted</p>
          <p className="mt-2">Your workspace role does not include data import permissions.</p>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <ImportCenterSubnav />
        {children}
      </div>
    </WorkspacePermissionGate>
  );
}
