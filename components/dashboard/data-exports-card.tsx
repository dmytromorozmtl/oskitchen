import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const exportsList = [
  { label: "Orders", type: "orders" },
  { label: "Customers (aggregated)", type: "customers" },
  { label: "Menu items", type: "products" },
  { label: "Production rows", type: "production" },
  { label: "Inventory (placeholder)", type: "inventory" },
  { label: "Integrations (metadata)", type: "integrations_metadata" },
] as const;

export function DataExportsCard() {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Data export</CardTitle>
        <CardDescription>
          Download CSV snapshots for backups or finance handoff. Exports respect your signed-in
          workspace only.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {exportsList.map((e) => (
          <Link
            key={e.type}
            href={`/api/export?type=${e.type}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
          >
            {e.label}
          </Link>
        ))}
      </CardContent>
      <CardContent className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Backup guidance</p>
        <p className="mt-1">
          Keep a recurring Postgres backup in Supabase for disaster recovery. CSV exports are
          convenience copies, not a full DB restore.
        </p>
        <p className="mt-2">
          Account deletion requests should be handled manually until an audited destructive flow
          ships — see <span className="font-mono text-xs">docs/DATA_RETENTION_POLICY.md</span>.
        </p>
      </CardContent>
    </Card>
  );
}
