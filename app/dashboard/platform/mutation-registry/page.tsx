import Link from "next/link";

import { MutationRegistryDashboardPanel } from "@/components/dashboard/platform/mutation-registry-dashboard-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadWorkspacePermissionPageActor, hasReportsHubPageAccess } from "@/lib/ux/permission-denied-page-access-era19";
import { loadMutationRegistryDashboardSnapshot } from "@/services/platform/mutation-registry-dashboard-service";

export default async function MutationRegistryDashboardPage() {
  const actor = await loadWorkspacePermissionPageActor();
  if (!hasReportsHubPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="reports_hub" />;
  }

  const snapshot = loadMutationRegistryDashboardSnapshot();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Mutation registry</h1>
            <Badge variant={snapshot.enterpriseTargetMet ? "default" : "destructive"}>
              {snapshot.counts.total} governed entries
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Enterprise RBAC source of truth — domain mutation helpers plus governed server action
            operations. Linter policy{" "}
            <code className="rounded bg-muted px-1 text-xs">{snapshot.policyId}</code> blocks new
            ungoverned mutations in <code className="rounded bg-muted px-1 text-xs">actions/</code>.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/settings/compliance">Compliance settings</Link>
        </Button>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Enterprise procurement proof</CardTitle>
          <CardDescription>
            {snapshot.counts.domainHelpers} domain helpers · {snapshot.counts.actionOperations}{" "}
            action operations · target ≥ {snapshot.counts.minimumEnterpriseTarget}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {snapshot.enterpriseTargetMet
            ? "Registry meets enterprise minimum (100+ governed mutations). Share docs/mutation-registry-enterprise-sales.md with security reviewers."
            : "Registry below enterprise minimum — expand governed entries before procurement sign-off."}
        </CardContent>
      </Card>

      <MutationRegistryDashboardPanel snapshot={snapshot} />
    </div>
  );
}
