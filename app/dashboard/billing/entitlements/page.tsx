import { ClearOverrideButton, SetEntitlementOverrideForm } from "@/components/dashboard/billing/entitlement-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { canUseBilling } from "@/lib/billing/billing-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

import { FEATURE_FLAGS, FEATURE_LABEL } from "@/lib/billing/entitlements";
import { entitlementSnapshot, listOverrides } from "@/services/billing/entitlement-service";

export default async function EntitlementsPage() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = { role: profile.role ?? null, email: profile.email ?? null };
  const canWrite = canUseBilling(scope, "billing.override.write", { granted: actor.granted });
  const userId = actor.userId;
  const [snap, overrides] = await Promise.all([
    entitlementSnapshot(userId),
    listOverrides(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entitlements</h1>
        <p className="text-sm text-muted-foreground">
          Effective feature flags for this workspace. Plan + overrides + superadmin bypass.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Effective flags</CardTitle>
          <CardDescription>Plan = {snap.plan}{snap.superadmin ? " · Superadmin bypass enabled" : ""}.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3">Feature</th>
                <th className="py-2 pr-3">Effective</th>
                <th className="py-2 pr-3">Override?</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_FLAGS.map((flag) => (
                <tr key={flag} className="border-b">
                  <td className="py-2 pr-3 font-medium">{FEATURE_LABEL[flag]}</td>
                  <td className="py-2 pr-3">{snap.features[flag] ? <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge> : <Badge variant="outline">Disabled</Badge>}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {snap.overridesActive.includes(flag) ? "yes" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active overrides</CardTitle>
          <CardDescription>{overrides.length} override{overrides.length === 1 ? "" : "s"} on file.</CardDescription>
        </CardHeader>
        <CardContent>
          {canWrite ? <SetEntitlementOverrideForm /> : <p className="text-sm text-muted-foreground">You do not have permission to edit overrides.</p>}
          {overrides.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm">
              {overrides.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <div>
                    <p className="font-medium">{FEATURE_LABEL[o.featureKey as keyof typeof FEATURE_LABEL] ?? o.featureKey}</p>
                    <p className="text-xs text-muted-foreground">
                      Value: {String(o.valueJson)}
                      {o.reason ? ` · ${o.reason}` : ""}
                      {o.expiresAt ? ` · expires ${o.expiresAt.toISOString().slice(0, 10)}` : ""}
                    </p>
                  </div>
                  {canWrite ? <ClearOverrideButton featureKey={o.featureKey} /> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
