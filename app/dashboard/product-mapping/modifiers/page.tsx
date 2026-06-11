import { ModifierForm } from "@/components/dashboard/product-mapping/modifier-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canUseProductMapping } from "@/lib/product-mapping/mapping-permissions";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import { PRODUCT_MODIFIER_STATUS_LABEL } from "@/lib/product-mapping/mapping-status";
import { listMappings } from "@/services/product-mapping/product-mapping-service";

export default async function ModifierMappingPage() {
  const access = await requireProductMappingPageAccess("mapping.modifier");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const rows = await listMappings(dataUserId, {
    take: 60,
    status: ["APPROVED", "CONFIRMED", "SUGGESTED", "NEEDS_REVIEW"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Modifiers &amp; options</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Map external modifiers (Shopify options, Woo attributes, Uber Eats modifiers, CSV options) to canonical
          OS Kitchen modifier keys for production and packaging.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No mappings yet</CardTitle>
            <CardDescription>
              Modifiers can only be mapped after the parent product mapping exists. Approve or review products
              first, then return here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{m.externalTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {PRODUCT_MAPPING_PROVIDER_LABEL[m.providerKey ?? "CUSTOM"]} · ext {m.externalProductId} ·
                    {" "}OS Kitchen: {m.internalProduct?.title ?? "—"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.modifierMappings.length} modifier{m.modifierMappings.length === 1 ? "" : "s"}
                </p>
              </div>

              {m.modifierMappings.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs">
                  {m.modifierMappings.map((mod) => (
                    <li key={mod.id} className="flex flex-wrap items-center gap-2 rounded border bg-muted/30 px-2 py-1">
                      <span className="font-medium">{mod.externalModifierName}</span>
                      {mod.externalOptionName ? <span className="text-muted-foreground">/ {mod.externalOptionName}</span> : null}
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{mod.internalModifierKey ?? "(unmapped)"}</span>
                      {mod.internalOptionValue ? <span>· {mod.internalOptionValue}</span> : null}
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                        {PRODUCT_MODIFIER_STATUS_LABEL[mod.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {canUseProductMapping(access.scope, "mapping.modifier") ? (
                <div className="mt-3">
                  <ModifierForm productMappingId={m.id} defaultProvider={m.providerKey ?? undefined} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
