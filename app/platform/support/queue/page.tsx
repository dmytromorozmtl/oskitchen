import Link from "next/link";

import { PlatformSupportInboxAttentionStrip } from "@/components/platform/platform-support-inbox-attention-strip";
import { PlatformSupportTicketNextAction } from "@/components/platform/platform-support-ticket-next-action";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { buildPlatformSupportInboxFocusSnapshot } from "@/lib/support/platform-support-inbox-focus-era18";
import { PLATFORM_OPEN_TICKET_STATUSES } from "@/services/platform/platform-service";
import {
  getPlatformSupportInboxSnapshot,
  listPlatformSupportTickets,
} from "@/services/platform/platform-support-service";

export default async function PlatformSupportQueuePage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:read");
  const [snapshot, tickets] = await Promise.all([
    getPlatformSupportInboxSnapshot(ctx.userId),
    listPlatformSupportTickets({ status: { in: PLATFORM_OPEN_TICKET_STATUSES } }, 150),
  ]);
  const focus = buildPlatformSupportInboxFocusSnapshot(
    snapshot,
    tickets.map((t) => ({
      id: t.id,
      status: t.status,
      priority: t.priority,
      category: t.category,
      assignedToId: t.assignedToId,
      slaDueAt: t.slaDueAt?.toISOString() ?? null,
    })),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Ticket queue</h1>
      <p className="text-sm text-zinc-400">Open-like statuses across all workspaces.</p>
      <PlatformSupportInboxAttentionStrip focus={focus} />
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Workspace</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Next action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800">
                <td className="px-3 py-2">
                  <Link href={`/platform/support/${t.id}`} className="text-amber-200/90 hover:underline">
                    {t.subject}
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs">{t.workspace?.name ?? "—"}</td>
                <td className="px-3 py-2">{t.status}</td>
                <td className="px-3 py-2">{t.priority}</td>
                <td className="px-3 py-2">
                  <PlatformSupportTicketNextAction
                    ticket={{
                      id: t.id,
                      status: t.status,
                      priority: t.priority,
                      category: t.category,
                      assignedToId: t.assignedToId,
                      slaDueAt: t.slaDueAt?.toISOString() ?? null,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
