import Link from "next/link";

export default function HelpImportExportPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Importing & exporting orders
      </h1>
      <p>
        OS Kitchen ingests orders from connected channels or manual entry. For spreadsheet backups,
        Owners use{" "}
        <Link href="/dashboard/import-export" className="text-primary underline">
          Import / export
        </Link>{" "}
        and authenticated CSV endpoints under{" "}
        <span className="font-mono text-xs">/api/export</span>.
      </p>
      <p>
        External payloads never appear verbatim in exports unless you explicitly enable diagnostic
        tooling — keep PII inside your workspace boundary.
      </p>
    </article>
  );
}
