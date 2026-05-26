import { ImportExportSubnav } from "@/components/dashboard/import-export-subnav";

export default function ImportExportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ImportExportSubnav />
      {children}
    </div>
  );
}
