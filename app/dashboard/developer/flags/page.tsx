import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { canUseFeature, FEATURE_KEYS, type FeatureKey } from "@/lib/plans/feature-registry";

function humanizeFeature(key: FeatureKey): string {
  return key.replace(/_/g, " ");
}

export default async function DeveloperFlagsPage() {
  const ctx = await requireDeveloperCenterAccess();
  const entries = await Promise.all(
    FEATURE_KEYS.map(async (key) => {
      const gate = await canUseFeature(ctx.userId, key);
      return { key, label: humanizeFeature(key), allowed: gate.allowed };
    }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feature flags</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Effective entitlements for your workspace (read-only). Changes flow through billing and plan overrides — not
          toggled here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan features</CardTitle>
          <CardDescription>Resolved with enterprise / trial / superadmin bypass rules.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <div
              key={e.key}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
            >
              <span className="capitalize">{e.label}</span>
              <Badge variant={e.allowed ? "default" : "outline"}>{e.allowed ? "on" : "off"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
