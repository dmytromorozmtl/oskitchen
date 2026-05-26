import { AliasForm } from "@/components/dashboard/product-mapping/alias-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import {
  listAliases,
  loadMatchableCandidates,
} from "@/services/product-mapping/product-mapping-service";

export default async function AliasesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [aliases, candidates] = await Promise.all([
    listAliases(dataUserId, 200),
    loadMatchableCandidates(dataUserId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rules &amp; aliases</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Aliases let the matching engine remember external titles such as &quot;Bangkok Noodles&quot; →
          &quot;Chicken Bangkok Peanut Noodles&quot;. Aliases are scoped to your workspace and can be limited
          to a specific provider.
        </p>
      </div>

      <AliasForm candidates={candidates} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active aliases</CardTitle>
          <CardDescription>{aliases.length} alias{aliases.length === 1 ? "" : "es"}.</CardDescription>
        </CardHeader>
        <CardContent>
          {aliases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No aliases yet — try adding one above.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">External title</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">KitchenOS item</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {aliases.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{a.externalTitle}</td>
                    <td className="px-3 py-2">{a.provider ? PRODUCT_MAPPING_PROVIDER_LABEL[a.provider] : "Any"}</td>
                    <td className="px-3 py-2">{a.internalProduct.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.createdAt.toISOString().slice(0, 10)}</td>
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
