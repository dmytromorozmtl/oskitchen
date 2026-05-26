import { BulkActionsTable } from "@/components/dashboard/product-mapping/bulk-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isBulkApprovable } from "@/lib/product-mapping/matching-confidence";
import { listMappings } from "@/services/product-mapping/product-mapping-service";

export default async function BulkMappingPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const rows = await listMappings(dataUserId, {
    take: 200,
    status: ["SUGGESTED", "NEEDS_REVIEW", "UNMAPPED"],
  });

  const tableRows = rows.map((m) => ({
    id: m.id,
    externalTitle: m.externalTitle,
    confidenceLabel: m.confidenceLabel ?? null,
    candidateTitle: m.internalProduct?.title ?? null,
    bulkEligible: isBulkApprovable(m.confidenceLabel) && Boolean(m.internalProductId),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bulk mapping</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Approve, ignore, or archive multiple mappings at once. Bulk approve only works for confidence levels
          EXACT_SKU, EXACT_TITLE, and HIGH — everything else requires per-row review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk preview</CardTitle>
          <CardDescription>
            Confidence distribution of {rows.length} rows currently in review. Only highlighted rows can be
            bulk-approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkActionsTable rows={tableRows} />
        </CardContent>
      </Card>
    </div>
  );
}
