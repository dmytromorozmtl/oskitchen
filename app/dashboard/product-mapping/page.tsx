import Link from "next/link";

import { MappingRowNextAction } from "@/components/dashboard/product-mapping/mapping-row-next-action";
import { ProductMappingAttentionStrip } from "@/components/dashboard/product-mapping/product-mapping-attention-strip";
import { WorkbenchKpiGrid } from "@/components/dashboard/product-mapping/kpi-grid";
import { ConfidenceBadge, MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { SuggestionForm } from "@/components/dashboard/product-mapping/suggestion-form";
import { MappingRowActions } from "@/components/dashboard/product-mapping/mapping-row-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { BULK_APPROVABLE } from "@/lib/product-mapping/matching-confidence";
import { buildProductMappingFocusSnapshot } from "@/lib/product-mapping/product-mapping-focus-era18";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { canUseProductMapping } from "@/lib/product-mapping/mapping-permissions";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import {
  listMappings,
  loadMatchableCandidates,
  workbenchKpis,
} from "@/services/product-mapping/product-mapping-service";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import { prisma } from "@/lib/prisma";

export default async function ProductMappingPage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const [kpis, recent, candidates, blockedConflicts, highConfidenceSuggested] = await Promise.all([
    workbenchKpis(dataUserId),
    listMappings(dataUserId, {
      take: 20,
      status: ["SUGGESTED", "NEEDS_REVIEW", "UNMAPPED", "CONFLICT"],
    }),
    loadMatchableCandidates(dataUserId),
    prisma.channelConflict.count({
      where: {
        AND: [
          await channelConflictWhereForOwner(dataUserId),
          { conflictType: "missing_product_mapping", status: "OPEN" },
        ],
      },
    }),
    prisma.productMapping.count({
      where: {
        AND: [
          await productMappingListWhereForOwner(dataUserId),
          { status: "SUGGESTED", confidenceLabel: { in: BULK_APPROVABLE } },
        ],
      },
    }),
  ]);

  const kpiTiles = { ...kpis, blockedOrderLines: blockedConflicts };
  const focusSnapshot = buildProductMappingFocusSnapshot({
    unmapped: kpis.unmapped,
    suggested: kpis.suggested,
    needsReview: kpis.needsReview,
    conflicts: kpis.conflicts,
    blockedOrderLines: blockedConflicts,
    highConfidenceSuggested,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Product Mapping Workbench</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Map external catalog items, SKUs, variants, and modifiers to KitchenOS menu items so imports,
            production, costing, and reports stay accurate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/import-center/upload?type=PRODUCT_MAPPINGS">Import external products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/product-mapping/unmapped">Open unmapped queue</Link>
          </Button>
        </div>
      </div>

      <WorkbenchKpiGrid tiles={kpiTiles} />

      <ProductMappingAttentionStrip snapshot={focusSnapshot} />

      {canUseProductMapping(access.scope, "mapping.create") ? <SuggestionForm /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Most recent mappings to review</CardTitle>
          <CardDescription>
            Showing the latest suggested / unmapped / conflicting rows. Approve a row only after you have
            verified the KitchenOS target.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No product mappings yet</p>
              <p className="mt-1">
                Import external products from sales channels or CSVs, then map them to KitchenOS menu items.
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/import-center/upload?type=PRODUCT_MAPPINGS">Import external products</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/product-mapping/unmapped">Add manual mapping</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {recent.map((mapping) => (
                <li key={mapping.id} id={`mapping-${mapping.id}`} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{mapping.externalTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {PRODUCT_MAPPING_PROVIDER_LABEL[mapping.providerKey ?? "CUSTOM"]}
                        {" "}·{" "}
                        SKU {mapping.externalSku ?? "—"} · ext {mapping.externalProductId}
                        {mapping.externalVariantTitle ? ` · ${mapping.externalVariantTitle}` : ""}
                      </p>
                      <MappingRowNextAction
                        row={{
                          id: mapping.id,
                          status: mapping.status,
                          confidenceLabel: mapping.confidenceLabel ?? "NONE",
                          hasCandidate: Boolean(mapping.internalProductId),
                        }}
                        basePath="/dashboard/product-mapping"
                      />
                      {mapping.internalProduct ? (
                        <p className="text-xs text-muted-foreground">
                          Candidate:{" "}
                          <Link
                            href={`/dashboard/products`}
                            className="font-medium text-primary underline underline-offset-4"
                          >
                            {mapping.internalProduct.title}
                          </Link>
                        </p>
                      ) : null}
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
