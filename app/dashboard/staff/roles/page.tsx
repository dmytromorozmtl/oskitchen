import { RoleDeactivateButton, RoleUpsertForm } from "@/components/dashboard/staff/role-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStaffPageAccess } from "@/lib/staff/staff-page-access";
import { SYSTEM_ROLES } from "@/lib/staff/staff-roles";
import { listRoles } from "@/services/staff/staff-service";

export default async function RolesPage() {
  const { userId, canRoleManage } = await getStaffPageAccess();
  const roles = await listRoles(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; permissions</h1>
        <p className="text-sm text-muted-foreground">
          System roles are enforced server-side. Add custom roles to extend the matrix.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System roles</CardTitle>
          <CardDescription>Built-in roles with default area permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Orders</th>
                  <th className="py-2 pr-3">Production</th>
                  <th className="py-2 pr-3">Kitchen screen</th>
                  <th className="py-2 pr-3">Packing</th>
                  <th className="py-2 pr-3">Routes</th>
                  <th className="py-2 pr-3">Tasks</th>
                  <th className="py-2 pr-3">CRM</th>
                  <th className="py-2 pr-3">Costing</th>
                  <th className="py-2 pr-3">Analytics</th>
                  <th className="py-2 pr-3">Billing</th>
                  <th className="py-2 pr-3">Settings</th>
                  <th className="py-2 pr-3">Staff</th>
                  <th className="py-2 pr-3">Training</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEM_ROLES.filter((r) => r.key !== "CUSTOM").map((r) => (
                  <tr key={r.key} className="border-b">
                    <td className="py-2 pr-3 font-medium">{r.label}</td>
                    {(["orders", "production", "kitchen_screen", "packing", "routes", "tasks", "crm", "costing", "analytics", "billing", "settings", "staff", "training"] as const).map((area) => (
                      <td key={area} className="py-2 pr-3 capitalize">{r.permissions[area]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!canRoleManage && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Custom role editing requires owner-level staff permissions (
          <span className="font-medium text-foreground">staff.role.create</span>).
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom roles</CardTitle>
          <CardDescription>Add or update workspace-specific roles. Permissions are JSON-shaped.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canRoleManage ? <RoleUpsertForm /> : null}
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom roles yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {roles.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <div>
                    <p className="font-medium">{r.label} <span className="text-xs text-muted-foreground">({r.key})</span></p>
                    {r.description ? <p className="text-xs text-muted-foreground">{r.description}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.active ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                    {r.active && canRoleManage ? <RoleDeactivateButton roleId={r.id} /> : null}
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
