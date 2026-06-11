import { MappingStatusBadge } from "@/components/dashboard/product-mapping/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";
import { listMappings } from "@/services/product-mapping/product-mapping-service";

export default async function ApprovedMappingsPage() {
  const access = await requireProductMappingPageAccess("mapping.view");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const rows = await listMappings(dataUserId, {
    take: 200,
    status: ["APPROVED", "CONFIRMED"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Approved mappings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          External products with an approved OS Kitchen target. Editing an approved mapping is a destructive
          operation — use Suggestions or Conflicts when in doubt.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No approved mappings yet.</p>
          ) : (
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">External title</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">OS Kitchen item</th>
                  <th className="px-3 py-2 font-medium">Approved by</th>
                  <th className="px-3 py-2 font-medium">Approved</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium">{m.externalTitle}</div>
                      <div className="text-[11px] text-muted-foreground">ext {m.externalProductId}</div>
                    </td>
                    <td className="px-3 py-2">{PRODUCT_MAPPING_PROVIDER_LABEL[m.providerKey ?? "CUSTOM"]}</td>
                    <td className="px-3 py-2">{m.externalSku ?? "—"}</td>
                    <td className="px-3 py-2">{m.internalProduct?.title ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.approvedBy?.fullName ?? m.approvedBy?.email ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.approvedAt ? m.approvedAt.toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <MappingStatusBadge status={m.status} />
                    </td>
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
