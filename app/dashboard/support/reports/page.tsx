import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseFullSupportInbox, userWorkspaceIds } from "@/lib/support/support-permissions";
import { SUPPORT_CATEGORY_LABEL } from "@/lib/support/support-categories";
import { SUPPORT_PRIORITY_LABEL } from "@/lib/support/support-priority";
import {
  supportOpenByModule,
  supportTicketsByCategory,
  supportTicketsByPriority,
  supportVolumeByWorkspace,
} from "@/services/support/support-analytics-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function SupportReportsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    select: { role: true },
  });
  if (!profile) return null;
  const canTriage = await canUseFullSupportInbox(dataUserId, user.email, profile.role);
  const workspaceIds = await userWorkspaceIds(dataUserId);
  const baseParams = { userId: dataUserId, email: user.email, canTriage, workspaceIds };

  const [byCat, byPrio, byMod, byWs] = await Promise.all([
    supportTicketsByCategory(baseParams),
    supportTicketsByPriority(baseParams),
    supportOpenByModule(baseParams),
    supportVolumeByWorkspace(baseParams),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Support reports</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Scoped to tickets you can access. Full tenant volume requires support inbox permissions.
        </p>
        <Link href="/dashboard/support" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Support center
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <CardDescription>All-time ticket counts in your scope.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {byCat.map((r) => (
              <div key={r.category} className="flex justify-between border-b border-border/60 py-1 last:border-0">
                <span>{SUPPORT_CATEGORY_LABEL[r.category]}</span>
                <span className="tabular-nums font-medium">{r._count._all}</span>
              </div>
            ))}
            {byCat.length === 0 ? <p className="text-muted-foreground">No data.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {byPrio.map((r) => (
              <div key={r.priority} className="flex justify-between border-b border-border/60 py-1 last:border-0">
                <span>{SUPPORT_PRIORITY_LABEL[r.priority]}</span>
                <span className="tabular-nums font-medium">{r._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open by module key</CardTitle>
            <CardDescription>Where module was specified on the ticket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {byMod.map((r) => (
              <div key={String(r.moduleKey)} className="flex justify-between border-b border-border/60 py-1 last:border-0">
                <span>{r.moduleKey ?? "—"}</span>
                <span className="tabular-nums font-medium">{r._count._all}</span>
              </div>
            ))}
            {byMod.length === 0 ? <p className="text-muted-foreground">No module tags yet.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volume by workspace</CardTitle>
            <CardDescription>{canTriage ? "All workspaces" : "Hidden without triage access"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {canTriage
              ? byWs.map((r) => (
                  <div key={String(r.workspaceId)} className="flex justify-between border-b border-border/60 py-1 last:border-0">
                    <span className="truncate">{r.workspaceId ?? "—"}</span>
                    <span className="tabular-nums font-medium">{r._count._all}</span>
                  </div>
                ))
              : null}
            {!canTriage ? <p className="text-muted-foreground">Ask a platform administrator for triage access.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
