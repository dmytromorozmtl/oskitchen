import {
  ChannelMappingConflictRowNextAction,
  DuplicateMappingGroupRowNextAction,
} from "@/components/dashboard/product-mapping/mapping-conflict-row-next-action";
import { MappingRowNextAction } from "@/components/dashboard/product-mapping/mapping-row-next-action";
import { ProductMappingConflictsAttentionStrip } from "@/components/dashboard/product-mapping/product-mapping-conflicts-attention-strip";
import { MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildProductMappingConflictsFocusSnapshot } from "@/lib/product-mapping/product-mapping-focus-era18";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import {
  detectConflicts,
  listMappings,
} from "@/services/product-mapping/product-mapping-service";
import { prisma } from "@/lib/prisma";

export default async function ConflictsPage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const [explicitConflictRows, derived, channelConflicts] = await Promise.all([
    listMappings(dataUserId, { take: 100, status: "CONFLICT" }),
    detectConflicts(dataUserId),
    prisma.channelConflict.findMany({
      where: {
        AND: [
          await channelConflictWhereForOwner(dataUserId),
          { conflictType: "missing_product_mapping", status: "OPEN" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        recordId: true,
      },
    }),
  ]);

  const conflictsSnapshot = buildProductMappingConflictsFocusSnapshot({
    explicitConflictCount: explicitConflictRows.length,
    duplicateInternalGroupCount: derived.duplicateInternalTargets.length,
    duplicateExternalGroupCount: derived.duplicateExternal.length,
    blockedOrderLines: channelConflicts.length,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mapping conflicts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Conflicts include duplicated targets, archived product targets, and blocked order import lines.
        </p>
      </div>

      <ProductMappingConflictsAttentionStrip snapshot={conflictsSnapshot} />

      <Card id="explicit-conflicts">
        <CardHeader>
          <CardTitle className="text-base">Explicit conflicts</CardTitle>
          <CardDescription>Mappings flagged with status CONFLICT.</CardDescription>
        </CardHeader>
        <CardContent>
          {explicitConflictRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No explicit conflicts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {explicitConflictRows.map((m) => (
                <li
                  key={m.id}
                  id={`mapping-${m.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{m.externalTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {PRODUCT_MAPPING_PROVIDER_LABEL[m.providerKey ?? "CUSTOM"]} · ext {m.externalProductId}
                    </p>
                    <MappingRowNextAction
                      row={{
                        id: m.id,
                        status: m.status,
                        confidenceLabel: m.confidenceLabel ?? "NONE",
                        hasCandidate: Boolean(m.internalProductId),
                      }}
                      basePath="/dashboard/product-mapping/conflicts"
                    />
                  </div>
                  <MappingStatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card id="duplicate-internal">
        <CardHeader>
          <CardTitle className="text-base">Duplicate KitchenOS target</CardTitle>
          <CardDescription>
            Multiple external products are pointing at the same internal item — usually the desired behaviour
            for marketplaces, but worth confirming.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {derived.duplicateInternalTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No duplicate KitchenOS targets.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {derived.duplicateInternalTargets.map((group) => (
                <li key={group.internalProductId} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">Internal product {group.internalProductId.slice(0, 8)}…</p>
                    {group.mappings[0] ? (
                      <DuplicateMappingGroupRowNextAction mappingId={group.mappings[0].id} />
                    ) : null}
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                    {group.mappings.map((m) => (
                      <li key={m.id}>
                        {PRODUCT_MAPPING_PROVIDER_LABEL[m.providerKey ?? "CUSTOM"]} · {m.externalTitle}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card id="duplicate-external">
        <CardHeader>
          <CardTitle className="text-base">Duplicate external product</CardTitle>
          <CardDescription>
            The same external product id appears more than once. Reject older rows or archive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {derived.duplicateExternal.length === 0 ? (
            <p className="text-sm text-muted-foreground">No duplicate external products.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {derived.duplicateExternal.map((group) => (
                <li key={group.externalProductId} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">External {group.externalProductId}</p>
                    {group.mappings[0] ? (
                      <DuplicateMappingGroupRowNextAction mappingId={group.mappings[0].id} />
                    ) : null}
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                    {group.mappings.map((m) => (
                      <li key={m.id}>
                        {PRODUCT_MAPPING_PROVIDER_LABEL[m.providerKey ?? "CUSTOM"]} · {m.externalTitle}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card id="order-hub-conflicts">
        <CardHeader>
          <CardTitle className="text-base">Order Hub conflicts</CardTitle>
          <CardDescription>
            Channel order records blocked by a missing product mapping. Open the Order Hub to reprocess once
            the mapping is approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channelConflicts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked orders.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {channelConflicts.map((c) => (
                <li key={c.id} id={`channel-conflict-${c.id}`} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      <ChannelMappingConflictRowNextAction
                        row={{ id: c.id, recordId: c.recordId }}
                      />
                    </div>
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
