import { ConfidenceBadge, MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { MappingRowActions } from "@/components/dashboard/product-mapping/mapping-row-actions";
import { SuggestionForm } from "@/components/dashboard/product-mapping/suggestion-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canUseProductMapping } from "@/lib/product-mapping/mapping-permissions";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import {
  listMappings,
  loadMatchableCandidates,
} from "@/services/product-mapping/product-mapping-service";

export default async function UnmappedQueuePage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const [rows, candidates] = await Promise.all([
    listMappings(dataUserId, {
      take: 200,
      status: ["UNMAPPED", "NEEDS_REVIEW"],
    }),
    loadMatchableCandidates(dataUserId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Unmapped queue</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          External products waiting for a KitchenOS target. Pick a candidate, approve, or reject — never bulk-approve
          unless the confidence is HIGH or above.
        </p>
      </div>

      {canUseProductMapping(access.scope, "mapping.create") ? <SuggestionForm /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Awaiting decision</CardTitle>
          <CardDescription>
            {rows.length === 0 ? "No unmapped products right now." : `${rows.length} item${rows.length === 1 ? "" : "s"} in the queue.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">All external products are mapped</p>
              <p className="mt-1">
                New unmapped products will appear here after catalog syncs, CSV imports, or order imports.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((mapping) => (
                <li key={mapping.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{mapping.externalTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {PRODUCT_MAPPING_PROVIDER_LABEL[mapping.providerKey ?? "CUSTOM"]} · SKU {mapping.externalSku ?? "—"} · ext {mapping.externalProductId}
                      </p>
                      {mapping.externalCategory ? (
                        <p className="text-xs text-muted-foreground">Category: {mapping.externalCategory}</p>
                      ) : null}
                      {mapping.internalProduct ? (
                        <p className="text-xs text-muted-foreground">
                          Suggested candidate: <strong>{mapping.internalProduct.title}</strong>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No candidate attached yet.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge label={mapping.confidenceLabel} />
                      <MappingStatusBadge status={mapping.status} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <MappingRowActions
                      mappingId={mapping.id}
                      initialProductId={mapping.internalProductId}
                      initialStatus={mapping.status}
                      candidates={candidates}
                      hasCandidate={Boolean(mapping.internalProductId)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
