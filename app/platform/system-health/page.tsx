import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformDashboardSnapshot } from "@/services/platform/platform-service";

export default async function PlatformSystemHealthPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const s = await getPlatformDashboardSnapshot();

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">System health (platform)</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Cross-tenant operational signals. Revenue figures stay honest — only show aggregates backed by
          Stripe or warehouse exports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Tile title="Webhook backlog (all)" value={s.webhookPending} href="/platform/webhooks" />
        <Tile title="Integration errors" value={s.integrationErrors} href="/platform/integrations" />
        <Tile title="Automation failures" value={s.automationFailures} href="/platform/automations" />
        <Tile title="Open tickets" value={s.openTickets} href="/platform/support" />
        <Tile title="Critical tickets" value={s.criticalTickets} href="/platform/support/escalations" />
        <Tile title="Workspaces" value={s.workspaces} href="/platform/workspaces" />
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Recent platform audit</CardTitle>
          <CardDescription className="text-zinc-500">Latest platform-scoped audit entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {s.recentPlatformAudit.length === 0 ? (
            <p className="text-zinc-500">No recent entries.</p>
          ) : (
            s.recentPlatformAudit.map((row) => (
              <div key={row.id} className="flex flex-col rounded-lg border border-zinc-800 px-3 py-2">
                <span className="font-medium text-white">{row.action}</span>
                <span className="text-xs text-zinc-500">
                  {row.createdAt.toISOString().slice(0, 19)} · {row.entityType ?? "—"}{" "}
                  {row.entityLabel ? `· ${row.entityLabel}` : ""}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <p className="text-3xl font-semibold tabular-nums text-white">{value}</p>
        <Button asChild variant="link" className="text-amber-200">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
