import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { listPlatformAuditTail } from "@/services/platform/platform-audit-service";

export default async function PlatformAuditPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:audit:read");
  const rows = await listPlatformAuditTail(150);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Platform audit</h1>
      <p className="text-sm text-zinc-400">
        Platform-scoped and <span className="font-mono text-zinc-500">platform.*</span> actions — no raw secrets in
        metadata.
      </p>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Workspace</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-xs text-zinc-500">{a.createdAt.toISOString()}</td>
                <td className="px-3 py-2 font-mono text-xs">{a.actorEmail ?? "—"}</td>
                <td className="px-3 py-2">{a.action}</td>
                <td className="px-3 py-2 text-xs">{a.category ?? "—"}</td>
                <td className="px-3 py-2">
                  {a.entityType} {a.entityLabel ? `· ${a.entityLabel}` : ""}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{a.workspaceId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
