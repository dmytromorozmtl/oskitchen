import Link from "next/link";

import { TeamCommunicationPanel } from "@/components/dashboard/staff/team-communication-panel";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { loadTeamCommunicationFeed } from "@/services/team/team-communication-load";

export default async function TeamCommunicationPage() {
  const actor = await requireWorkspacePermissionActor();
  const canManage = hasPermission(actor.granted, "staff.manage");

  const [feed, staff] = await Promise.all([
    loadTeamCommunicationFeed(actor.userId, { limit: 50 }),
    prisma.staffMember.findMany({
      where: { userId: actor.userId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team communication</h1>
          <p className="text-sm text-muted-foreground">
            Announcements, shift reminders, and in-app messaging for your crew.
          </p>
        </div>
        <Link href="/dashboard/staff" className="rounded-md border px-2 py-1 text-sm">
          Staff hub →
        </Link>
      </div>

      <TeamCommunicationPanel feed={feed} canManage={canManage} staff={staff} />
    </div>
  );
}
