import { ConfidenceBadge, MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { MappingRowActions } from "@/components/dashboard/product-mapping/mapping-row-actions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import {
  listMappings,
  loadMatchableCandidates,
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
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [rows, candidates] = await Promise.all([
    listMappings(dataUserId, { take: 200, status: ["SUGGESTED"] }),
    loadMatchableCandidates(dataUserId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suggestions</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Suggestions produced by the matching engine. Review the candidate, then approve, reject, or pick a
          different KitchenOS item.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No suggestions yet</CardTitle>
            <CardDescription>
              Suggestions appear when external products can be compared to your KitchenOS menu items by SKU,
              title, aliases, or category.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((mapping) => {
            const reasons = (mapping.matchReasonJson as MatchReason[] | null) ?? [];
            return (
              <li key={mapping.id} className="rounded-lg border p-4">
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
