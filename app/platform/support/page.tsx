import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { listPlatformSupportTickets } from "@/services/platform/platform-support-service";

export default async function PlatformSupportPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support:read");
  const tickets = await listPlatformSupportTickets({}, 100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Support inbox</h1>
      <p className="text-sm text-zinc-400">All tickets across tenants — click a row to reply.</p>
      {tickets.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-500">
          No tickets yet. Customer support requests across all workspaces will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Workspace</th>
                <th className="px-3 py-2">Requester</th>
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
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
                  <td className="px-3 py-2 font-mono text-xs">{t.email}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.userProfile?.email ?? "—"}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2">{t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
