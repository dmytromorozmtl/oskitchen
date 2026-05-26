import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BULK_APPROVABLE_LABELS } from "@/services/product-mapping/product-mapping-service";
import { PRODUCT_MAPPING_PROVIDERS, PRODUCT_MAPPING_PROVIDER_LABEL } from "@/lib/product-mapping/provider-types";

const ROLE_MATRIX: { role: string; can: string[]; cannot?: string[] }[] = [
  { role: "Owner / admin", can: ["view", "create", "approve", "reject", "bulk", "edit", "archive", "alias", "modifier"] },
  { role: "Manager", can: ["view", "create", "approve", "reject", "bulk", "edit", "alias", "modifier"], cannot: ["archive"] },
  { role: "Integration manager", can: ["view", "create", "approve", "reject", "bulk", "edit", "alias", "modifier", "import"] },
  { role: "Accountant", can: ["view", "audit"] },
  { role: "Kitchen / packer / driver / dispatcher", can: ["view"] },
  { role: "Sales", can: ["view"] },
  { role: "Viewer", can: ["view"] },
  { role: "Superadmin (workspace.moroz@gmail.com)", can: ["full access"] },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Workbench configuration — providers, bulk-approval policy, permissions matrix, and links to the
          related modules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Providers</CardTitle>
          <CardDescription>Catalog sources currently supported by the workbench.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {PRODUCT_MAPPING_PROVIDERS.map((p) => (
              <li key={p} className="rounded-md border bg-muted/30 px-3 py-2">
                <p className="font-medium">{PRODUCT_MAPPING_PROVIDER_LABEL[p]}</p>
                <p className="text-[11px] text-muted-foreground">{p}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk approval policy</CardTitle>
          <CardDescription>
            Bulk approve operates only on these confidence labels. Everything else requires per-row review.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          {BULK_APPROVABLE_LABELS.map((label) => (
            <span key={label} className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              {label}
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permissions matrix</CardTitle>
          <CardDescription>Role-based capabilities. Superadmin overrides apply.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Can</th>
                <th className="px-3 py-2 font-medium">Cannot</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_MATRIX.map((row) => (
                <tr key={row.role} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{row.role}</td>
                  <td className="px-3 py-2">{row.can.join(", ")}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.cannot?.join(", ") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related modules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/dashboard/sales-channels" className="rounded-md border p-3 hover:bg-muted/30">
            <p className="font-medium">Sales Channels</p>
            <p className="text-xs text-muted-foreground">Catalog sync + provider connections.</p>
          </Link>
          <Link href="/dashboard/order-hub" className="rounded-md border p-3 hover:bg-muted/30">
            <p className="font-medium">Order Hub</p>
            <p className="text-xs text-muted-foreground">Reprocess blocked order imports.</p>
          </Link>
          <Link href="/dashboard/import-center" className="rounded-md border p-3 hover:bg-muted/30">
            <p className="font-medium">Import Center</p>
            <p className="text-xs text-muted-foreground">Bulk CSV imports of mappings.</p>
          </Link>
          <Link href="/dashboard/menu" className="rounded-md border p-3 hover:bg-muted/30">
            <p className="font-medium">Menu items</p>
            <p className="text-xs text-muted-foreground">Approved mappings appear on the menu item detail.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
