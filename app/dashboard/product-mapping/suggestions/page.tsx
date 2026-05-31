import { MappingRowNextAction } from "@/components/dashboard/product-mapping/mapping-row-next-action";
import { ProductMappingAttentionStrip } from "@/components/dashboard/product-mapping/product-mapping-attention-strip";
import { ConfidenceBadge, MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { MappingRowActions } from "@/components/dashboard/product-mapping/mapping-row-actions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BULK_APPROVABLE } from "@/lib/product-mapping/matching-confidence";
import { buildProductMappingFocusSnapshot } from "@/lib/product-mapping/product-mapping-focus-era18";
import { PRODUCT_MAPPING_SUGGESTIONS_ROUTE } from "@/lib/product-mapping/product-mapping-focus-era18-policy";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import { prisma } from "@/lib/prisma";
import {
  listMappings,
  loadMatchableCandidates,
  workbenchKpis,
} from "@/services/product-mapping/product-mapping-service";

type MatchReason = { code: string; detail?: string; score: number };

const REASON_LABEL: Record<string, string> = {
  EXACT_SKU: "Exact SKU",
  EXACT_EXTERNAL_ID: "Approved external id",
  EXACT_TITLE: "Exact title",
  ALIAS: "Alias",
  TITLE_SIMILARITY: "Token similarity",
  CATEGORY_TITLE_SIMILARITY: "Category + title",
  NO_MATCH: "No match",
};

export default async function SuggestionsPage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const [rows, candidates, kpis, blockedConflicts, highConfidenceSuggested] = await Promise.all([
    listMappings(dataUserId, { take: 200, status: ["SUGGESTED"] }),
    loadMatchableCandidates(dataUserId),
    workbenchKpis(dataUserId),
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

  const focusSnapshot = buildProductMappingFocusSnapshot({
    unmapped: kpis.unmapped,
    suggested: kpis.suggested,
    needsReview: kpis.needsReview,
    conflicts: kpis.conflicts,
    blockedOrderLines: blockedConflicts,
    highConfidenceSuggested,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suggestions</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Suggestions produced by the matching engine. Review the candidate, then approve, reject, or pick a
          different OS Kitchen item.
        </p>
      </div>

      <ProductMappingAttentionStrip snapshot={focusSnapshot} />

      {rows.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No suggestions yet</CardTitle>
            <CardDescription>
              Suggestions appear when external products can be compared to your OS Kitchen menu items by SKU,
              title, aliases, or category.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((mapping) => {
            const reasons = (mapping.matchReasonJson as MatchReason[] | null) ?? [];
            return (
              <li key={mapping.id} id={`mapping-${mapping.id}`} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{mapping.externalTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {PRODUCT_MAPPING_PROVIDER_LABEL[mapping.providerKey ?? "CUSTOM"]} ·
                      {" "}SKU {mapping.externalSku ?? "—"} ·
                      {" "}ext {mapping.externalProductId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Candidate: <strong>{mapping.internalProduct?.title ?? "(none)"}</strong>
                    </p>
                    <MappingRowNextAction
                      row={{
                        id: mapping.id,
                        status: mapping.status,
                        confidenceLabel: mapping.confidenceLabel ?? "NONE",
                        hasCandidate: Boolean(mapping.internalProductId),
                      }}
                      basePath={PRODUCT_MAPPING_SUGGESTIONS_ROUTE}
                    />
                    {reasons.length > 0 ? (
                      <ul className="mt-1 flex flex-wrap gap-1">
                        {reasons.map((r, idx) => (
                          <li
                            key={idx}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                          >
                            {REASON_LABEL[r.code] ?? r.code} · {(r.score * 100).toFixed(0)}%
                          </li>
                        ))}
                      </ul>
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
