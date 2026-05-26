import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import { listImportBatches } from "@/services/product-mapping/product-mapping-service";

export default async function ImportBatchesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const batches = await listImportBatches(dataUserId, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import batches</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each catalog sync or CSV import that introduces external products records a batch summary here. Use
          this to triage what the last sync changed.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {batches.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No batches yet. Run a catalog sync from Sales Channels or upload a CSV from the {" "}
              <Link href="/dashboard/import-center" className="underline">Import Center</Link>.
            </p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Rows</th>
                  <th className="px-3 py-2 font-medium">Unmapped</th>
                  <th className="px-3 py-2 font-medium">Suggested</th>
                  <th className="px-3 py-2 font-medium">Approved</th>
                  <th className="px-3 py-2 font-medium">Conflicts</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{b.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="px-3 py-2">{PRODUCT_MAPPING_PROVIDER_LABEL[b.provider]}</td>
                    <td className="px-3 py-2">{b.sourceType}</td>
                    <td className="px-3 py-2 tabular-nums">{b.totalRows}</td>
                    <td className="px-3 py-2 tabular-nums">{b.unmappedCount}</td>
                    <td className="px-3 py-2 tabular-nums">{b.suggestedCount}</td>
                    <td className="px-3 py-2 tabular-nums">{b.approvedCount}</td>
                    <td className="px-3 py-2 tabular-nums">{b.conflictCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
