import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";

export default async function StorefrontTeamInviteAuditPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.team");
  if (!pageAccess.ok) return pageAccess.deny;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: { id: true, publicName: true, workspaceId: true },
  });

  const events =
    sf?.workspaceId != null
      ? await prisma.storefrontTeamInviteEvent.findMany({
          where: { storefrontId: sf.id },
          orderBy: { createdAt: "desc" },
          take: 200,
          include: {
            actor: { select: { email: true, fullName: true } },
            invite: { select: { email: true, role: true } },
          },
        })
      : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invite audit log</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Compliance trail for team invitations on <strong>{sf?.publicName ?? "storefront"}</strong> — create,
            reminders, magic links, accept, and cancel events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <a href="/api/dashboard/storefront/team-invite-audit-export" download>
              Export CSV
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/storefront/team">← Team</Link>
          </Button>
        </div>
      </div>

      {!sf ? (
        <p className="text-muted-foreground">Configure storefront overview first.</p>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent events</CardTitle>
            <CardDescription>
              {events.length} event(s) — newest first (max 200). Export includes up to 10k rows; events older than
              90 days are purged weekly by retention cron.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invite events yet.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/80 text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">Event</th>
                    <th className="py-2 pr-4 font-medium">Target</th>
                    <th className="py-2 pr-4 font-medium">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="border-b border-border/40 align-top">
                      <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                        {format(ev.createdAt, "yyyy-MM-dd HH:mm")}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">{ev.eventType}</td>
                      <td className="py-2 pr-4">
                        <span className="font-mono text-xs">{ev.targetEmail ?? ev.invite?.email ?? "—"}</span>
                        {ev.invite?.role ? (
                          <span className="ml-2 text-xs text-muted-foreground">{ev.invite.role}</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {ev.actor?.fullName ?? ev.actor?.email ?? "system"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
